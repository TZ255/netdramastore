const MuhimuPeopleFn = async (bot, ctx, dt) => {
    try {
        const muhimu = [dt.naomy, dt.jacky, dt.airt]
        if (muhimu.includes(ctx.chat.id)) {
            await ctx.api.copyMessage(dt.shd, ctx.chat.id, ctx.message.message_id)
            await ctx.api.sendMessage(dt.shd, `From ${ctx.chat.id} - ${ctx.chat.first_name}`)
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    MuhimuPeopleFn
}