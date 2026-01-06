const { Bot, webhookCallback, InlineKeyboard, InlineQueryResultBuilder, InputFile } = require('grammy')
const { autoRetry } = require("@grammyjs/auto-retry");
const { limit } = require("@grammyjs/ratelimiter");
require('dotenv').config()
const usersModel = require('./models/botusers')
const inviteModel = require('./models/invitelink')
const dramasModel = require('./models/vue-new-drama')
const episodesModel = require('./models/vue-new-episode')
const homeModel = require('./models/vue-home-db')
const { nanoid } = require('nanoid')
const cheerio = require('cheerio')
const telegraph = require('telegraph-node');

//important middlewares
const nkiriFetch = require('./functions/nkiri')
const ph = new telegraph()
const if_function_for_buttons = require('./functions/buttons')
const postEpisodesInChannel = require('./functions/postEpisodeInChannel')
const sendToDramastore = require('./functions/sendToDramastore')
const naomymatusi = require('./functions/naomymatusi')
const trendingFunctions = require('./functions/schedulers')
const { sendTome, sendToMe } = require('./functions/partials/sendtome')
const { createChatInviteLink } = require('./functions/partials/createLink')
const { moveNewChannel, ApproveReqs } = require('./functions/smallfns')
const StartCommand = require('./functions/start')
const { TrendingTodayFn, TrendingThisWeekFn, TrendingThisMonthFn, TrendingAllTime } = require('./functions/partials/trendings');
const { BroadcastConvoFn } = require('./functions/partials/convo');
const { MuhimuPeopleFn } = require('./functions/muhimupeople');
const axios = require('axios');

// important field
const dt = {
    ds: -1001245181784,
    databaseChannel: -1001239425048,
    backup: -1002250839443,
    subsDb: '-1002634850653',
    whats: process.env.WHATS,
    dstore_domain: 'https://dramastore.net',
    main_channel: `https://t.me/+mTx_t-6TBx9hNTc8`,
    shd: 741815228,
    htlt: 1473393723,
    naomy: 1006615854,
    jacky: 1937862156,
    loading: 1076477335,
    airt: 1426255234,
    hotel_king: -1001425392198,
    my_sweet_mobser: -1001457093470,
    dr_stranger: -1001199318533,
    romance_book: -1001175513824,
    my_love_from_star: -1001220805172,
    tale: -1001167737100,
    family_by_choice: -1002353438269,
    qn_tears: -1001955559953,
    vincenzo: -1001276495200,
    serendepity: -1002169508218,
    link: process.env.BOT_LINK,
    aliProducts: -1002494520726,
    rtcopyDB: -1002634850653,
    dstore_movies: -1003274804808
}


const DramaStoreBot = async (app) => {
    try {
        const bot = new Bot(process.env.DS_TOKEN)
        //set webhook
        let hookPath = `/telebot/${process.env.USER}/dramastore`
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`, {
            drop_pending_updates: true, max_connections: 60
        })
            .then(() => {
                console.log(`webhook for dramastore is set`)
                bot.api.sendMessage(dt.shd, `${hookPath} set as webhook`)
                    .catch(e => console.log(e.message))
            })
            .catch(e => console.log(e.message))
        app.use(`${hookPath}`, webhookCallback(bot, 'express', { timeoutMilliseconds: 30000 }))

        //configure rateLimit (2 messages in 3 seconds)
        bot.use(limit({
            timeFrame: 5000, limit: 3,
            // This is called when the limit is exceeded.
            onLimitExceeded: async (ctx) => {
                if (ctx.chat.type === 'private') {
                    await ctx.reply("Please refrain from sending too many requests!");
                }
            },
            // Note that the key should be a number in string format such as "123456789".
            keyGenerator: (ctx) => {
                return ctx.from?.id.toString();
            },
        }));

        //use auto-retry
        bot.api.config.use(autoRetry());
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`(Dstore): ${err.message}`, err);
        });

        // function to send any err in catch block
        function anyErr(err) {
            bot.api.sendMessage(741815228, err.message)
                .catch(e => console.log(e.message))
        }

        var trendingRateLimit = []

        setInterval(() => {
            let d = new Date()
            let date = d.getUTCDate()
            let day = d.getUTCDay()  // 0 to 6 where sunday = 0
            let hours = d.getUTCHours()
            let minutes = d.getUTCMinutes()
            let time = `${hours}:${minutes}`

            if (time == '0:0') {
                trendingFunctions.daily(bot, dt)

                if (day == 1) { trendingFunctions.weekly(bot, dt) } //every monday
                if (date == 1) { trendingFunctions.monthly(bot, dt) } //every trh 1
            }
        }, 1000 * 59)

        //delaying
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        const other_channels = [dt.my_sweet_mobser, dt.hotel_king, dt.dr_stranger, dt.romance_book, dt.my_love_from_star, dt.tale]


        bot.command('start', async ctx => {
            StartCommand(bot, ctx, dt, anyErr, trendingRateLimit)
        })

        bot.command(['fff'], async ctx => {
            try {
                if (ctx.match && ctx.chat.type == 'private') {
                    let searching = await ctx.reply('Searching... ⏳')
                    //send her command to me
                    await sendToMe(ctx, dt)
                    let domain = `http://www.dramastore.net`
                    let match = ctx.match
                    //replace all special characters except ' with '' and all +white spaces with ' '
                    let query = match.replace(/[^a-zA-Z0-9\s']/g, '').replace(/\s+/g, ' ').trim()
                    let queryArray = query.split(' ')

                    //case-insensitive regular expression from the query
                    // Create a regex that matches all keywords in any order
                    const regex = new RegExp(queryArray.map(kw => `(?=.*${kw})`).join(''), 'i');

                    let dramas = await dramasModel.find({ newDramaName: regex }).sort('-timesLoaded').limit(15)
                    let txt = `The following drama were found from your search command "<code>${match}</code>"\n\n`
                    let nodrama = `Oops! No drama found from your search command "<code>${match}</code>"`
                    if (dramas.length > 0) {
                        for (let [index, d] of dramas.entries()) {
                            txt = txt + `<b>${index + 1}. ${d.newDramaName} \n> ${d.tgChannel}</b>\n\n`
                        }
                        await ctx.api.deleteMessage(ctx.chat.id, searching.message_id)
                            .catch(e => console.log(e.message))
                    } else {
                        await ctx.api.deleteMessage(ctx.chat.id, searching.message_id)
                            .catch(e => console.log(e.message))
                        await ctx.reply(nodrama, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                        console.log(query)
                    }
                } else if (!ctx.match && ctx.chat.type == 'private') {
                    await ctx.replyWithChatAction('typing')
                    await delay(1500)
                    await ctx.api.copyMessage(ctx.chat.id, dt.databaseChannel, 10669)
                }
            } catch (error) {
                await ctx.reply(`Oops! An error occurred while processing your searching request. Please forward this message to @shemdoe`)
            }
        })

        bot.command('block', async ctx => {
            if (ctx.chat.id == dt.shd || ctx.chat.id == dt.htlt) {
                let txt = ctx.message.text
                let id = Number(txt.split('/block ')[1])

                await usersModel.updateOne({ userId: id }, { blocked: true })
                ctx.reply(`The user with id ${id} is blocked successfully`)
            }

        })

        bot.command('unblock', async ctx => {
            let txt = ctx.message.text
            let id = Number(txt.split('/unblock ')[1].trim())

            await usersModel.updateOne({ userId: id }, { blocked: false })
            ctx.reply(`The user with id ${id} is unblocked successfully`)
            if (id == dt.naomy || id == dt.airt) {
                bot.api.sendMessage(id, "Unabahati @shemdoe kakuombea msamaha 😏... Unaweza kunitumia sasa.")
            }
            else {
                bot.api.sendMessage(id, `Good news! You're unblocked from using me, you can now request episodes`)
            }
        })

        bot.command('adult', async ctx => {
            try {
                if (ctx.chat.id == dt.shd) {
                    let txt = ctx.message.text
                    if (txt.includes('adult=')) {
                        let userId = Number(txt.split('adult=')[1])
                        let u = await usersModel.findOneAndUpdate({ userId }, { $set: { adult: false } }, { new: true })
                        await ctx.reply(`${u.fname} updated to ${u.adult}`)
                    } else {
                        let all = await usersModel.find({ adult: false })
                        let majina = 'Hawa hapa ambao tunaheshimiana\n\n'
                        for (let u of all) {
                            majina = majina + `${u.fname} - ${u.adult}\n\n`
                        }
                        await ctx.reply(majina)
                    }
                }
            } catch (error) {
                await ctx.reply(error.message)
            }
        })

        bot.command('trending_today', async ctx => {
            TrendingTodayFn(bot, ctx, dt)
        })

        bot.command('trending_this_week', async ctx => {
            TrendingThisWeekFn(bot, ctx, dt)
        })

        bot.command('trending_this_month', async ctx => {
            TrendingThisMonthFn(bot, ctx, dt)
        })

        bot.command('all_time', async ctx => {
            TrendingAllTime(bot, ctx, dt)
        })

        bot.command('convo', async ctx => {
            BroadcastConvoFn(bot, ctx, dt).catch(e => console.log(e?.message))
        })

        bot.command('stats', async ctx => {
            let anas = await usersModel.countDocuments()
            ctx.reply(`Total bot's users are ${anas.toLocaleString('en-us')}`)

            let pps = await usersModel.aggregate([
                { $group: { _id: '$country.name', total: { $sum: 1 } } },
                { $sort: { "total": -1 } }
            ]).limit(20)

            let ttx = `Top 20 countries with most users\n\n`
            for (let u of pps) {
                ttx = ttx + `<b>• ${u._id}:</b> ${u.total.toLocaleString('en-us')} users\n`
            }
            await ctx.reply(ttx, { parse_mode: 'HTML' })
        })

        bot.command('add', async ctx => {
            let txt = ctx.message.text

            if (ctx.chat.id == dt.shd || ctx.chat.id == dt.htlt) {
                try {
                    let arr = txt.split('-')
                    let id = Number(arr[1])
                    let pts = Number(arr[2])
                    let param = arr[3]

                    let updt = await usersModel.findOneAndUpdate({ userId: id }, { $inc: { points: pts } }, { new: true })

                    if (param == 'e') {
                        let t1 = `Shemdoe just added ${pts} points to you. Your new points balance is ${updt?.points} points.`
                        await bot.api.sendMessage(id, t1)
                    }

                    else if (param == 's') {
                        let t2 = `Shemdoe amekuongezea points ${pts}. Sasa umekuwa na jumla ya points ${updt?.points}... Karibu sana! 😉.`
                        await bot.api.sendMessage(id, t2)
                    }

                    await ctx.reply(`Added, she has now ${updt?.points}`)
                } catch (err) {
                    console.log(err.message)
                    ctx.reply(err.message)
                }
            }
        })

        bot.command('update_episodes', async ctx => {
            try {
                let id = ctx.chat.id
                if (id == dt.shd) {
                    let txt = ctx.message.text
                    let dname = txt.split('/update_episodes ')
                    let d_data = dname[1].split(' | ')
                    let dramaName = d_data[0]
                    let new_eps = d_data[1]

                    let dd = await dramasModel.findOneAndUpdate({ newDramaName: dramaName }, { noOfEpisodes: new_eps }, { new: true })
                    await ctx.reply(`${dd.newDramaName} episodes updated to ${dd.noOfEpisodes}`)
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('admin', async ctx => {
            try {
                if (ctx.chat.id == dt.shd) {
                    await bot.api.copyMessage(dt.shd, dt.databaseChannel, 13497)
                }
            } catch (err) {
                console.log(err.message)
                await ctx.reply(err.message)
            }
        })

        bot.command('migrate', async (ctx) => {
            moveNewChannel(bot, ctx, dt, InlineKeyboard)
        })

        bot.on('chat_join_request', async ctx => {
            ApproveReqs(bot, ctx, dt, delay)
        })

        //help command
        bot.command('help', async ctx => {
            try {
                const msg = `Looking for drama? Click the <b>"🔍 Find drama"</b> button below to explore on <b>Dramastore</b> website. \n\nNeed help? Just reach out to <b>@shemdoe</b>`

                let inline_keyboard = [
                    [
                        { text: '🥇 My Points', callback_data: 'mypoints' },
                        { text: '➕ Add points', url: `http://dramastore.net/user/${ctx.chat.id}/boost/` }
                    ],
                    [
                        { text: '🔍 Find drama', url: 'https://dramastore.net/list/all' },
                    ]
                ]

                await ctx.reply(msg, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard
                    }
                })
            } catch (error) {
                await ctx.reply(`Oops! An error occurred while processing your request. Please forward this message to @shemdoe`)
                console.error(error.message, error);
            }
        })

        bot.command('backup', async ctx => {
            try {
                let backup_channel = -1002250839443
                let all = await episodesModel.find()

                for (let [index, ep] of all.entries()) {
                    setTimeout(() => {
                        bot.api.copyMessage(backup_channel, dt.databaseChannel, ep.epid)
                            .then((success) => {
                                episodesModel.findOneAndUpdate({ epid: ep.epid }, { $set: { backup: success.message_id } }).catch(e => console.log(e?.message))
                            }).catch(e => console.log(e.message))
                    }, 3500 * index)
                }
            } catch (error) {
                ctx.reply(error?.message).catch(e => console.log(e?.message))
            }
        })

        bot.on('callback_query', async ctx => {
            sendToDramastore(bot, ctx, dt, anyErr, other_channels)
        })

        bot.use(async (ctx, next) => {
            console.log('On channel Post:', ctx.message)
            postEpisodesInChannel(bot, ctx, next, dt, anyErr, delay, InputFile)
        })

        bot.on(':text', async ctx => {
            console.log('On text:', ctx.message)
            naomymatusi(bot, ctx, dt, anyErr)
        })

        bot.on(':voice', async ctx => {
            MuhimuPeopleFn(bot, ctx, dt)
        })

        bot.on(':photo', async ctx => {
            MuhimuPeopleFn(bot, ctx, dt)
        })

        bot.on(':video', async ctx => {
            MuhimuPeopleFn(bot, ctx, dt)
        })

        //scrap nkiri every five minutes
        setInterval(async () => {
            //new links on dt.ali every even hours (12 links a day)
            let d = new Date()
            let mins = d.getMinutes()
            let hrs = d.getHours()
            let secs = d.getSeconds()
            let stampSeconds = Date.now() / 1000

            if (mins == 27 && hrs % 2 == 0) {
                let name = `${d.getDate()}/${d.getMonth() + 1} - ${hrs}:${mins}`
                let expire = stampSeconds + (60 * 60 * 4) //4 hours
                createChatInviteLink(bot, dt, name, expire)
            }

            //run nkiri
            if (mins % 5 == 0) {
                nkiriFetch.nkiriFetch(dt, bot)
                    .catch(err => {
                        bot.api.sendMessage(-1002079073174, err.message)
                            .catch(e => console.log(e.message))
                    })
            }
        }, 1000 * 60)
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    DramaStoreBot
}
