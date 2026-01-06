const { Bot, webhookCallback, InlineKeyboard, InlineQueryResultBuilder, InputFile } = require('grammy')
const { autoRetry } = require("@grammyjs/auto-retry");
const { limit } = require("@grammyjs/ratelimiter");

const usersModel = require('./database/users')
const listModel = require('./database/botlist')
const jumbe = require('./database/sms.json')

const imp = {
    shemdoe2: 6638791469
}


const myBotsFn = async () => {
    try {
        const tokens = await listModel.find()

        for (let tk of tokens) {
            const bot = new Bot(tk.token)

            bot.catch(async (e, ctx) => {
                console.log(e)
                await bot.api.sendMessage(imp.shemdoe2, e.message)
            })

            bot.start(async ctx => {
                try {
                    let chatid = ctx.chat.id
                    let first_name = ctx.chat.first_name
                    let botname = ctx.botInfo.username
                    let user = await usersModel.findOne({ chatid })
                    if (!user) {
                        let tk = await listModel.findOne({ botname })
                        await usersModel.create({ chatid, first_name, botname, token: tk })
                        await bot.api.sendMessage(imp.shemdoe2, `${first_name} added to db via ${botname}`)
                    }
                    await ctx.reply(`Hello <b>${first_name}!</b>\n\nKaribu. Kupata jumbe tamu za kutia moyo za maisha \nbonyeza hapa 👉 /ujumbe`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: '❤ PATA UJUMBE MTAMU' }
                                ]
                            ],
                            is_persistent: true,
                            resize_keyboard: true
                        }
                    })
                } catch (e) {
                    console.log(e.message, e)
                }
            })

            bot.command('ujumbe', async ctx => {
                try {
                    let rand = Math.floor(Math.random() * jumbe.length)
                    await ctx.reply(`<i><b>${jumbe[rand]}</b></i>`, {
                        parse_mode: 'HTML'
                    })
                } catch (err_ujumbe) {
                    console.log(err_ujumbe.message)
                }
            })

            bot.command('stats', async ctx => {
                try {
                    let all = await usersModel.countDocuments()
                    let lists = await listModel.find()

                    let txt = `Total Users are ${all.toLocaleString('en-US')}\n\n`

                    for (let [i, v] of lists.entries()) {
                        let num = (await usersModel.countDocuments({ botname: v.botname })).toLocaleString('en-US')
                        txt = txt + `${i + 1}. ${v.botname} = ${num}\n\n`
                    }
                    await ctx.reply(txt)
                } catch (err) {
                    console.log(err.message)
                }
            })

            bot.on('message', async ctx => {
                try {
                    if (ctx.message.reply_to_message) {
                        let rpmsg = ctx.message.reply_to_message.text
                        let txt = ctx.message.text

                        if (rpmsg.toLowerCase() == 'token' && ctx.chat.id == imp.shemdoe2) {
                            let bt = await listModel.create({ token: txt, botname: 'unknown' })
                            await ctx.reply(`Token Added: 👉 ${bt.token} 👈\n\nReply with username of bot`)
                        } else if (rpmsg.includes('Token Added') && ctx.chat.id == imp.shemdoe2) {
                            let token = rpmsg.split('👉 ')[1].split(' 👈')[0].trim()
                            let bt = await listModel.findOneAndUpdate({ token }, { $set: { botname: txt } }, { new: true })
                            let final = `New Bot with the following info added successfully:\n\n✨ Botname: ${bt.botname}\n✨ Token: ${bt.token}`
                            await ctx.reply(final)
                        }
                    } else {
                        if (ctx.message.text == '❤ PATA UJUMBE MTAMU') {
                            let rand = Math.floor(Math.random() * jumbe.length)
                            await ctx.reply(`<i><b>${jumbe[rand]}</b></i>`, {
                                parse_mode: 'HTML'
                            })
                        }
                    }
                } catch (err) {
                    console.log(err.message)
                }
            })

            bot.start().catch(async ee => {
                await bot.api.sendMessage(imp.shemdoe2, ee.message)
                console.log(ee.message)
            })
        }
    } catch (err) {
        console.log(err.message, err)
    }
}


module.exports = {
    myBotsFn
}
