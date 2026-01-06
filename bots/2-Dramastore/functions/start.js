const dramasModel = require('../models/vue-new-drama')
const episodesModel = require('../models/vue-new-episode')
const nextEpModel = require('../models/botnextEp')
const usersModel = require('../models/botusers')
const inviteModel = require('../models/invitelink')
const { UpdateChanUser } = require('./partials/after-confirm')
const movieModel = require('../models/movieModel')

// Cache membership checks (4h) so we don't spam Telegram
const CHAT_MEMBER_CACHE_TTL = 4 * 60 * 60 * 1000
const chatMemberCache = new Map()

const getChatMemberCached = async (bot, channelId, userId) => {
    const cachedEntry = chatMemberCache.get(userId)
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CHAT_MEMBER_CACHE_TTL) {
        return { status: cachedEntry.status }
    }

    const member = await bot.api.getChatMember(channelId, userId)

    if (member?.status !== 'left') {
        chatMemberCache.set(userId, { status: member.status, timestamp: Date.now() })
    }

    return { status: member?.status }
}

module.exports = async (bot, ctx, dt, anyErr, trendingRateLimit) => {

    let delay = (ms) => new Promise(reslv => setTimeout(reslv, ms))

    let ujumbe3 = 'You got the file and 2 points deducted from your points balance.\n\n<b>You remained with 8 points.</b>'
    try {
        let name = ctx.chat.first_name
        let message_id = ctx.message.message_id
        let msg = `Welcome ${name}, Visit Drama Store Website For Korean Series`
        if (!ctx.match) {
            await ctx.reply(msg, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🌎 OPEN DRAMA STORE', url: 'www.dramastore.net/list/all' }
                        ]
                    ]
                }
            })
        }
        if (ctx.match) {
            let payload = ctx.match
            let pt = 1

            if (payload.includes('2shemdoe')) {
                pt = 2
            }

            if (payload.includes('marikiID-')) {
                let ep_doc_id = payload.split('marikiID-')[1]

                let member = await getChatMemberCached(bot, dt.aliProducts, ctx.chat.id)
                if (member.status == 'left') {
                    let inv_db = await inviteModel.findOne().sort('-createdAt')
                    let sp_ch = inv_db?.link
                    await ctx.reply(`⚠ Please join our notifications channel to continue. \n\nTap the link below to JOIN, then click <b>✅ Joined</b> button to unlock this episode.\n\n<b>🔗 Join: 👇\n${sp_ch}</b>`, {
                        parse_mode: 'HTML',
                        link_preview_options: { is_disabled: true },
                        reply_markup: { inline_keyboard: [[{ text: '✅ JOINED', url: `https://t.me/dramastorebot?start=marikiID-${ep_doc_id}` }]] }
                    })
                } else {
                    //find the document
                    let ep_doc = await episodesModel.findById(ep_doc_id)

                    let txt = `<b>🤖 <u>Confirm Download</u></b>\n\nYou’re about to download, <b>${ep_doc.drama_name} ➜ Episode ${ep_doc.epno}</b>.\nPlease continue to the download page.\n\n<code>Here 👇</code>`
                    let url = `http://dramastore.net/download/episode?ep_id=${ep_doc._id}&userid=${ctx.chat.id}`

                    //reply with episodes info
                    let conf_msg = await ctx.reply(txt, {
                        parse_mode: 'HTML',
                        protect_content: true,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "⬇ OPEN DOWNLOAD PAGE", url }
                                ]
                            ]
                        }
                    })

                    //upadate drama count & user
                    UpdateChanUser(ctx, ep_doc, conf_msg.message_id)
                }
            }

            if (payload.includes('KMOVIE-')) {
                let movie_id = payload.split('KMOVIE-')[1]

                //find the document
                let movie = await movieModel.findById(movie_id)

                if(!movie) return ctx.reply('This movie is not found. Contact @shemdoe for assistance.')

                let txt = `<b>🤖 <u>Confirm download:</u></b>\n\nYou are downloading \n<b>${movie.movie_name}.</b> Please click and open the button below to go to the download page to get the movie file.\n\n<code>Here 👇</code>`
                let url = `http://dramastore.net/download/episode?ep_id=${movie._id}--movie&userid=${ctx.chat.id}`

                //reply with episodes info
                let conf_msg = await ctx.reply(txt, {
                    parse_mode: 'HTML',
                    protect_content: true,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "⬇ OPEN DOWNLOAD PAGE", url }
                            ]
                        ]
                    }
                })

                //upadate drama count & user
                let isMovie = true
                UpdateChanUser(ctx, movie, conf_msg.message_id, isMovie)
            }

            if (payload.includes('fromWeb')) {
                let msgId = payload.split('fromWeb')[1].trim()

                if (msgId.includes('TT')) {
                    let _data = msgId.split('TT')
                    let ep_id = Number(_data[1])
                    let sub_id = Number(_data[2])

                    await bot.api.copyMessage(ctx.chat.id, dt.databaseChannel, ep_id)
                    await bot.api.copyMessage(ctx.chat.id, dt.subsDb, sub_id)
                } else {
                    await bot.api.copyMessage(ctx.chat.id, dt.databaseChannel, msgId)
                }
                console.log('Episode sent from web by ' + ctx.chat.first_name)

                let userfromWeb = await usersModel.findOneAndUpdate({ userId: ctx.chat.id }, { $inc: { downloaded: 1 } })

                //if user from web is not on database
                if (!userfromWeb) {
                    await usersModel.create({
                        userId: ctx.chat.id,
                        points: 10,
                        fname: ctx.chat.first_name,
                        downloaded: 1,
                        blocked: false,
                        country: { name: 'unknown', c_code: 'unknown' }
                    })
                    console.log('From web not on db but added')
                }
            }

            else if (payload.includes('shemdoe')) {
                if (payload.includes('nano_') && !payload.includes('nano_AND')) {
                    let nano = payload.split('nano_')[1]
                    nano = nano.split('AND_')[0]

                    let drama = await dramasModel.findOneAndUpdate({ nano }, { $inc: { timesLoaded: 30, thisMonth: 29, thisWeek: 29, today: 29 } }, { new: true })
                    console.log(drama.newDramaName + ' updated to ' + drama.timesLoaded)
                }
                let epMsgId = payload.split('shemdoe')[1].trim()

                let ptsUrl = `http://dramastore.net/user/${ctx.chat.id}/boost/`


                let ptsKeybd = [
                    { text: '🥇 My Points', callback_data: 'mypoints' },
                    { text: '➕ Add points', url: ptsUrl }
                ]

                // add user to database
                let user = await usersModel.findOne({ userId: ctx.chat.id })

                //function to send episode
                const sendEp = async (bot, ctx) => {
                    if (epMsgId.includes('TT')) {
                        let _data = epMsgId.split('TT')
                        let ep_id = Number(_data[1])
                        let sub_id = Number(_data[2])

                        await bot.api.copyMessage(ctx.chat.id, dt.databaseChannel, ep_id)
                        await bot.api.copyMessage(ctx.chat.id, dt.subsDb, sub_id)
                    } else {
                        await bot.api.copyMessage(ctx.chat.id, dt.databaseChannel, epMsgId, {
                            reply_markup: { inline_keyboard: [ptsKeybd] }
                        })
                    }
                }

                //if user not exist
                if (!user) {
                    let newUser = await usersModel.create({
                        userId: ctx.chat.id,
                        points: 8,
                        fname: ctx.chat.first_name,
                        downloaded: 1,
                        blocked: false,
                        country: { name: 'unknown', c_code: 'unknown' }
                    })
                    //send episode
                    sendEp(bot, ctx)
                    let re = await ctx.reply(ujumbe3, { parse_mode: 'HTML' })
                    setTimeout(() => {
                        bot.api.deleteMessage(ctx.chat.id, re.message_id)
                            .catch((err) => console.log(err.message))
                    }, 7000)
                }

                //if user exist
                else {
                    if (user?.points > 1) {
                        //send episode
                        sendEp(bot, ctx)

                        let upd = await usersModel.findOneAndUpdate({ userId: ctx.chat.id }, { $inc: { points: -2, downloaded: 1 } }, { new: true })

                        let uj_pts = upd?.points
                        let ujumbe1 = `You got the file and 2 points deducted from your points balance.\n\n<b>You remained with ${uj_pts} points.</b>`

                        let ujumbe2 = `You got the file and 2 points deducted from your points balance.\n\n<b>You remained with ${uj_pts} points.</b>`

                        //delay for 2 secs, not good in longer millsecs
                        await delay(1000)
                        if (upd.downloaded >= 32) {
                            let re50 = await ctx.reply(ujumbe2, { parse_mode: 'HTML' })
                            setTimeout(() => {
                                bot.api.deleteMessage(ctx.chat.id, re50.message_id)
                                    .catch((err) => console.log(err.message))
                            }, 7000)

                        } else if (upd.downloaded < 32) {
                            let re49 = await ctx.reply(ujumbe1, { parse_mode: 'HTML' })
                            setTimeout(() => {
                                bot.api.deleteMessage(ctx.chat.id, re49.message_id)
                                    .catch((err) => console.log(err.message))
                            }, 7000)

                        }
                    }

                    if (user?.points < 2) {
                        await ctx.reply(`You don't have enough points to get this file, you need at least 2 points.\n\nFollow this link to add more http://dramastore.net/user/${ctx.chat.id}/boost or click the button below.`, {
                            reply_markup: { inline_keyboard: [ptsKeybd] }
                        })
                    }
                }
            }

            else if (payload.includes('on_trending')) {
                await ctx.reply(`To see what is on trending on dramastore. Use the following commands\n\n🤖 /trending_today - daily top 10 trending dramas.\n\n🤖 /trending_this_week - top 10 trending dramas this week.\n\n🤖 /trending_this_month - top 10 trending dramas this month.\n\n🤖 /all_time - most popular dramas on dramastore.`)
            }

            else if (payload.includes('find_drama')) {
                await ctx.api.copyMessage(ctx.chat.id, dt.databaseChannel, 12062, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🔍 Find drama here', url: 'https://dramastore.net/list/all' }
                            ]
                        ]
                    }
                })
            }
        }
    } catch (err) {
        console.log(err)
        anyErr(err)
        ctx.reply('An error occurred whilst trying give you the file, please forward this message to @shemdoe\n\n' + 'Error: ' + err.message).catch(e => console.log(e.message))
    }
}
