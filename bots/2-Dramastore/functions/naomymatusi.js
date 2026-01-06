module.exports = async (bot, ctx, dt, anyErr) => {
    const muhimu = [dt.naomy, dt.jacky, dt.airt]
    try {
        if (ctx.message.reply_to_message && [dt.htlt, dt.shd].includes(ctx.chat.id)) {
            let myid = ctx.chat.id
            let my_msg_id = ctx.message.message_id
            let umsg = ctx.message.reply_to_message.text
            let ids = umsg.split('id = ')[1].trim()
            let userid = Number(ids.split('&mid=')[0])
            let mid = Number(ids.split('&mid=')[1])

            return await bot.api.copyMessage(userid, myid, my_msg_id, {
                protect_content: true,
                reply_parameters: { message_id: mid, allow_sending_without_reply: true }
            })
        }

        //not replying to a message || admins is not included
        let userid = ctx.chat.id
        let txt = ctx.message.text
        let username = ctx.chat.first_name
        let mid = ctx.message.message_id

        //return if is direct message on channel
        if (ctx.message?.sender_chat?.is_direct_messages) return

        //if the message is from important users send to shemdoe
        if (muhimu.includes(ctx.chat.id)) {
            return await bot.api.sendMessage(dt.shd, `<b>${txt}</b> \n\nfrom = <code>${username}</code>\nid = <code>${userid}</code>&mid=${mid}`, { parse_mode: 'HTML' })
        }

        await bot.api.sendMessage(dt.htlt, `<b>${txt}</b> \n\nfrom = <code>${username}</code>\nid = <code>${userid}</code>&mid=${mid}`, { parse_mode: 'HTML', disable_notification: true })

        //elekeza kutafuta drama
        const msg = `Looking for drama? Click the button below to explore on <b>Dramastore</b> website. \n\nNeed help? Just reach out to @shemdoe`
        await ctx.reply(msg, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔍 Find drama', url: 'https://dramastore.net/list/all' },
                    ]
                ]
            }
        })
    } catch (err) {
        console.log(err.message, err)
    }
}
