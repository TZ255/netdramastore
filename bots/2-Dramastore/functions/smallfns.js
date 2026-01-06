const dramasModel = require('../models/vue-new-drama')

const moveNewChannel = async (bot, ctx, dt, InlineKeyboard) => {
    try {
        if (ctx.chat.id == dt.shd) {
            let all = await dramasModel.find()

            for (let [index, d] of all.entries()) {
                if (d.telegraph) {
                    let dName = d.newDramaName
                    let ph = d.telegraph
                    let chan = d.tgChannel
                    let search = `t.me/${ctx.me.username}?start=find_drama`
                    let trending = `t.me/${ctx.me.username}?start=on_trending`
                    let inline_keyboard = new InlineKeyboard()
                        .url(`⬇ DOWNLOAD ALL EPISODES`, chan).row()
                        .url(`📊 Trending`, trending).url(`🔍 Find drama`, search).row()

                    let link = `<a href="${ph}">📺</a> <u><b>${dName}</b></u>`
                    setTimeout(() => {
                        bot.api.sendMessage(dt.ds, link, {
                            parse_mode: 'HTML',
                            reply_markup: inline_keyboard,
                            link_preview_options: { prefer_large_media: true },
                            disable_notification: true
                        })
                            .then(() => {
                                if (index == all.length - 1) {
                                    bot.api.sendMessage(dt.shd, 'nimemaliza migration')
                                        .catch((e) => console.log(e.message))
                                }
                            })
                            .catch(e => console.log(e.message))
                    }, index * 4000)
                }
            }
        }
    } catch (error) {
        await ctx.reply(error.message)
    }
}

const ApproveReqs = async (bot, ctx, dt, delay) => {
    try {
        let userid = ctx.chatJoinRequest.from.id
        let chan_id = ctx.chatJoinRequest.chat.id
        //if is drama updates
        if (chan_id == dt.aliProducts) {
            await bot.api.approveChatJoinRequest(chan_id, userid)
            await delay(500)
            await bot.api.sendMessage(userid, 'Request approved. You can now download the episode.\n\nClick the <b>✅ JOINED</b> button above to proceed with your download', { parse_mode: 'HTML' })
        } else {
            await bot.api.sendMessage(userid, 'Request approved. You can now download Korean Dramas from Our Channel', { parse_mode: 'HTML' })
            await delay(500)
            await bot.api.approveChatJoinRequest(chan_id, userid)
        }
    } catch (error) {
        console.log(error.message)
        await bot.api.sendMessage(dt.shd, `Join Error: ${error.message}`)
    }
}

module.exports = {
    moveNewChannel,
    ApproveReqs
}