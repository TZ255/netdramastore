const { Bot, webhookCallback } = require('grammy')
const { autoRetry } = require("@grammyjs/auto-retry");

const Bot1Function = async (app) => {
    const bot = new Bot(process.env.HOOK_TOKEN)
    app.use('/tele/hookbot', webhookCallback(bot, 'express'))

    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`${err.message}`, err);
    });

    //use auto-retry
    bot.api.config.use(autoRetry());

    bot.command('start', async ctx => {
        try {
            let thisMes = await ctx.reply('karibu')
            await ctx.reply(`This message has an id of ${thisMes.message_id}`, {
                reply_parameters: { message_id: thisMes.message_id }
            })
        } catch (error) {
            console.log(error.message, error)
        }
    })

    bot.command('mama', async ctx => {
        try {
            let mm = await ctx.reply('Mimi sio mama yako')
        } catch (error) {
            console.error(error.message, error)
        }
    })

    const testingFn = async (ctx) => {
        try {
            let pzone = -1001352114412
            await ctx.reply('starting')
            let all = 100
            for (let a = 1; a < all; a++) {
                await ctx.api.sendMessage(pzone, a)
                    .catch(e => console.log(e.message))
            }
        } catch (error) {
            console.log(error)
        }
    }

    bot.command('vipi', async ctx => {
        try {
            testingFn(ctx)
        } catch (error) {
            console.log(error.message)
        }
    })
    bot.api.setWebhook(`https://${process.env.DOMAIN}/tele/hookbot`, {
        drop_pending_updates: true
    })
        .then(() => bot.api.sendMessage(741815228, 'hook settled'))
        .catch(e => console.log(e.message))
}

module.exports = {
    Bot1Function
}