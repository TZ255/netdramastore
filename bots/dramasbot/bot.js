const { Bot, webhookCallback } = require('grammy')
const { limit } = require("@grammyjs/ratelimiter");
const axios = require('axios').default
const otheBotsUsersModel = require('./database/users')
const botListModel = require('./database/botlist')
const newMovieModel = require('../../models/vue-new-drama');


const imp = {
    shemdoe: 741815228,
    halot: 1473393723,
    mkekaLeo: -1001733907813,
    dstore: -1001245181784,
    airtz1: 1426255234,
    airtz2: 5940671686,
}


const myBotsFn = async (app) => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    try {
        const tokens = await botListModel.find()
        console.log(`Found ${tokens.length} bots to initialize`)

        for (let tk of tokens) {
            try {
                const bot = new Bot(tk.token)

                // IMPORTANT: Register rate limiter FIRST
                bot.use(limit({ timeFrame: 3000, limit: 2 }))

                // Error handler
                bot.catch((err) => {
                    const ctx = err.ctx;
                    console.error(`(${tk.botname}): ${err.message}`, err);
                });

                // Register ALL bot handlers BEFORE setting up webhook
                bot.command('start', async ctx => {
                    try {
                        let chatid = ctx.chat.id
                        let first_name = ctx.chat.first_name
                        let botname = ctx.me.username
                        let user = await otheBotsUsersModel.findOne({ chatid })
                        let the_bot = await botListModel.findOne({ botname })

                        if (!user) {
                            await otheBotsUsersModel.create({ chatid, first_name, botname, token: the_bot.token })
                        }

                        let prep = await ctx.reply('Preparing Invite link...')
                        await delay(1000)
                        await ctx.api.deleteMessage(ctx.chat.id, prep.message_id)

                        let drama = await newMovieModel.findOne({ chan_id: the_bot.drama_chanid })

                        let link_text = `<a href="${drama.tgChannel}">https://t.me/drama/${drama.id}</a>`
                        let txt = `Hi, <b>${ctx.chat.first_name}</b>\n\nDownload All ${drama.noOfEpisodes} Episodes of <b>${drama.newDramaName}</b> for free with English Subtitles Below\n\n<b>Full Drama 👇👇\n${link_text}</b>`
                        await ctx.reply(txt, { parse_mode: 'HTML', protect_content: true })
                    } catch (e) {
                        console.log(e.message, e)
                    }
                })

                bot.command('stats', async ctx => {
                    try {
                        let all = await otheBotsUsersModel.countDocuments()
                        let lists = await botListModel.find()

                        let txt = `Total Users Are ${all.toLocaleString('en-US')}\n\n`

                        for (let [i, v] of lists.entries()) {
                            let num = (await otheBotsUsersModel.countDocuments({ botname: v.botname })).toLocaleString('en-US')
                            txt = txt + `${i + 1}. @${v.botname} = ${num}\n\n`
                        }
                        await ctx.reply(txt)
                    } catch (err) {
                        console.log(err.message)
                    }
                })

                bot.command('other_drama', async ctx => {
                    try {
                        return await ctx.reply('Download all latest korean dramas at www.dramastore.net')
                    } catch (error) {
                        console.log('/other_drama command Error:', error?.message)
                        await ctx.reply('Sorry! Cant process this command for now, retry later or check logs for context')
                    }
                })

                bot.on('message:text', async ctx => {
                    const chatid = ctx.chat.id
                    try {
                        if (ctx.message.reply_to_message && ctx.chat.type === 'private' && Object.values(imp).includes(chatid)) {
                            let rpmsg = ctx.message.reply_to_message.text
                            let txt = ctx.message.text

                            if (rpmsg.toLowerCase() == 'token') {
                                let bt = await botListModel.create({ token: txt, botname: 'unknown', drama_chanid: 0 })
                                await ctx.reply(`Token Added: 👉 ${bt.token} 👈\n\nReply with username of bot and the channel id e.g: <examplebot> <-1234567890>`)
                            } else if (rpmsg.includes('Token Added:')) {
                                let [botname, chan_id] = txt.split(' ').map(item => item.trim())
                                if (!botname || !chan_id || !String(chan_id).startsWith('-')) {
                                    return await ctx.reply('Wrong reply... Reply with botname and drama channel id in this format\n<example_bot> <channel_id>')
                                }
                                let token = rpmsg.split('👉 ')[1].split(' 👈')[0].trim()
                                let drama = await newMovieModel.findOne({ chan_id: Number(chan_id) })
                                if (!drama) return await ctx.reply(`No drama found with channel id ${chan_id}`)

                                let bt = await botListModel.findOneAndUpdate({ token }, { $set: { botname, drama_chanid: Number(chan_id) } }, { new: true })

                                //set bot desc
                                let descAPI = `https://api.telegram.org/bot${token}/setMyDescription`
                                let data = {
                                    description: `Hey Chingu! Welcome 🤗\n\nClick START to download all episodes of ${drama.newDramaName}`
                                }
                                await axios.post(descAPI, data)

                                //set commands
                                let commAPI = `https://api.telegram.org/bot${token}/setMyCommands`
                                let commData = {
                                    commands: [
                                        { command: 'other_drama', description: '🔥 Other Korean Dramas' },
                                    ]
                                }
                                await axios.post(commAPI, commData)

                                //reply with bot data
                                let final = `New Bot with the following info added successfully:\n\n✨ Botname: ${bt.botname}\n✨ Token: ${bt.token} \n✨ Channel: ${drama.newDramaName} (${drama.chan_id})`

                                return await ctx.reply(final)
                            }
                        } else {
                            return await ctx.reply(`Hello,\nClick /start to start downloading or check the menu for other options`)
                        }
                    } catch (err) {
                        console.log(err.message)
                    }
                })

                // NOW register the Express route with all handlers in place
                let hookPath = `/telebot/dramastore/${process.env.USER}/${tk.botname}`
                let domain = process.env.DOMAIN

                app.use(hookPath, webhookCallback(bot, 'express'))
                console.log(`✅ Express route registered: ${hookPath}`)

                // Set the webhook on Telegram's side
                await bot.api.setWebhook(`https://${domain}${hookPath}`, {
                    drop_pending_updates: true,
                    allowed_updates: ["message", "callback_query"]
                })
                console.log(`✅ Webhook set for ${tk.botname}: https://${domain}${hookPath}`)

            } catch (botError) {
                console.error(`❌ Failed to initialize bot ${tk.botname}:`, botError.message)
            }
        }

        console.log(`✅ All ${tokens.length} bots initialized successfully`)
    } catch (err) {
        console.error('❌ DramaBots initialization error:', err.message, err)
    }
}


module.exports = {
    DramaBots: myBotsFn
}