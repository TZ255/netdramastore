const dramasModel = require('../../models/vue-new-drama')

const TrendingTodayFn = async (bot, ctx, dt) => {
    try {
        let id = ctx.chat.id
        let d = new Date().toUTCString()

        let todays = await dramasModel.find().limit(20).select('newDramaName tgChannel today id').sort('-today')
        let txt = `🔥 <u><b>Trending Today (UTC)</b></u>\n<code>${d}</code>\n\n\n`

        todays.forEach((d, i) => {
            let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
            txt = txt + `${link}\n🔥 ${d.today.toLocaleString('en-US')}\n\n`
        })
        let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
        await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })

    } catch (err) {
        await ctx.reply(err.message)
    }
}


const TrendingThisWeekFn = async (bot, ctx, dt) => {
    try {
        let id = ctx.chat.id
        let todays = await dramasModel.find().limit(30).select('newDramaName tgChannel thisWeek id').sort('-thisWeek')
        let d = new Date().getDay()
        if (d == 0) { d = 7 }
        let txt = `🔥 <u><b>On Trending This Week (Day ${d})</b></u>\n\n\n`

        todays.forEach((d, i) => {
            let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
            txt = txt + `${link}\n🔥 ${d.thisWeek.toLocaleString('en-US')}\n\n`
        })
        let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
        await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })

    } catch (err) {
        await ctx.reply(err.message)
    }
}


const TrendingThisMonthFn = async (bot, ctx, dt) => {
    try {
        let id = ctx.chat.id
        let todays = await dramasModel.find().limit(35).select('newDramaName tgChannel thisMonth id').sort('-thisMonth')
        let txt = `🔥 <u><b>On Trending This Month (UTC)</b></u>\n\n\n`

        todays.forEach((d, i) => {
            let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
            txt = txt + `${link}\n🔥 ${d.thisMonth.toLocaleString('en-US')}\n\n`
        })
        let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
        await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })

    } catch (err) {
        await ctx.reply(err.message)
    }
}


const TrendingAllTime = async (bot, ctx, dt) => {
    try {
        let id = ctx.chat.id
        let todays = await dramasModel.find().limit(45).select('newDramaName tgChannel timesLoaded id').sort('-timesLoaded')
        let txt = `🔥 <u><b>Most Popular Dramas (of All Time)</b></u>\n\n\n`

        todays.forEach((d, i) => {
            let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
            txt = txt + `${link}\n🔥 ${d.timesLoaded.toLocaleString('en-US')}\n\n`
        })
        let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
        await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })

    } catch (err) {
        await ctx.reply(err.message)
    }
}

module.exports = {
    TrendingTodayFn, TrendingThisWeekFn, TrendingThisMonthFn, TrendingAllTime
}