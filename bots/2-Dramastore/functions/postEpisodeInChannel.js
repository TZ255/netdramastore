const vueNewDramaModel = require('../models/vue-new-drama')
const episodesModel = require('../models/vue-new-episode')
const postModel = require('../models/postmodel')
const usersModel = require('../models/botusers')
const {scrapeMyDramalist, scrapeAsianWiki, TelegraphPage, TelegraphMoviePage} = require('./partials/scrapingdrama')
const UploadingNewEpisode = require('./partials/uploading_new_episode')

module.exports = async (bot, ctx, next, dt, anyErr, delay, InputFile) => {
    try {
        // check if it is used in channel
        if (ctx.update.channel_post) {
            //return if is direct messages
            if(ctx.update.channel_post?.sender_chat?.is_direct_messages) return;
            
            // check if it is dramastore database
            if (ctx.update.channel_post.sender_chat.id == dt.databaseChannel) {
                // check if ni document
                if (ctx.update.channel_post.document) {
                    let msgId = ctx.update.channel_post.message_id
                    let fileName = ctx.update.channel_post.document.file_name
                    let fileZize = ctx.channelPost.document.file_size
                    let SizeInMB = (fileZize / (1024 * 1024))
                    let netSize = Math.trunc(SizeInMB)
                    let noEp = ''
                    let extraParams = ''

                    //document spillited with dramastore
                    if (fileName.includes('[dramastore.net] ')) {
                        noEp = fileName.split('[dramastore.net] ')[1].split('.')[0]
                    } else if (fileName.includes('@dramaost.')) {
                        noEp = fileName.split('@dramaost.E')[1].split('.')[0]
                    } else if (fileName.includes('[dramastore.net] MOVIE.')) {
                        noEp = "MOVIE"
                    }

                    let cap = `<b>${fileName.replace('[dramastore.net]', '').replace('.mkv', '.EngSub.mkv').trim()}\n\n⭐️ Find More K-Dramas at\n<a href="https://t.me/+vfhmLVXO7pIzZThk">@KOREAN_DRAMA_STORE</a></b>`

                    if (noEp === "MOVIE" && String(fileName).includes('MOVIE.')) {
                        cap = `<b>${String(fileName).split('MOVIE.')[1]}\n\n⭐️ More K-Dramas & Movies at\n<a href="https://t.me/+vfhmLVXO7pIzZThk">@KOREAN_DRAMA_STORE</a></b>`
                    }

                    await bot.api.editMessageCaption(ctx.channelPost.chat.id, msgId, {
                        caption: cap, parse_mode: 'HTML'
                    })

                    let copy_data = `<code>uploading_new_episode_${noEp}_S${netSize}_msgId${msgId}_${extraParams}</code>`

                    if(noEp === "MOVIE") copy_data = `<code>${msgId}_S${fileZize}</code>`;

                    ctx.reply(`Copy -> ${copy_data}`, { parse_mode: 'HTML' })
                }
            }

            // if is other channels
            else {
                //check if its text sent to that channel
                if (ctx.channelPost.hasOwnProperty('text')) {
                    let txt = ctx.channelPost.text
                    if (txt.includes('uploading_new_episode')) {
                        // uploading new episode
                        UploadingNewEpisode(ctx, txt, dt, bot, InputFile)
                    }

                    else if (txt.includes('post_drama')) {
                        // from mydramalist
                        //scrapeMyDramalist(ctx, txt, dt, bot)

                        // from asianwiki
                        //scrapeAsianWiki(ctx, txt, dt, bot)
                    }

                    else if (txt.includes('post_db=')) {
                        TelegraphPage(bot, ctx, dt)
                    }

                    else if (txt.includes('post_movie=')) {
                        TelegraphMoviePage(bot, ctx, dt)
                    }

                    else if (txt.includes('update_id')) {
                        let chan_id = ctx.channelPost.chat.id
                        let cname = ctx.channelPost.chat.title
                        let invite = await ctx.api.createChatInviteLink(chan_id)
                        let tgChannel = `tg://join?invite=${invite.invite_link.split('/+')[1]}`

                        if (cname.includes('Official -')) {
                            cname = cname.split('Official - ')[1]
                        } else if (!cname.includes('Official -') && cname.includes('[Eng sub]')) {
                            cname = cname.split('[Eng sub] ')[1].trim()
                        }

                        let drama = await vueNewDramaModel.findOne({ newDramaName: cname })
                        if (!drama) return await ctx.reply(`Drama with name ${cname} not found in database.`);

                        //update episodes with new chan_id
                        await episodesModel.updateMany({ drama_chan_id: drama.chan_id }, { $set: { drama_chan_id: chan_id } })
                        // update drama with new chan_id and tgChannel
                        let up = await vueNewDramaModel.findOneAndUpdate({ newDramaName: cname }, { $set: { chan_id, tgChannel } }, { new: true })
                        let did = await ctx.reply(`drama updated with ${up.chan_id} and ${tgChannel} as link`)
                        await delay(500)
                        await ctx.api.deleteMessage(ctx.chat.id, ctx.channelPost.message_id)
                        await ctx.api.deleteMessage(ctx.chat.id, did.message_id)
                    }
                    else if (txt.includes('zima updates')) {
                        let chan_id = ctx.channelPost.chat.id

                        let up = await vueNewDramaModel.findOneAndUpdate({ chan_id }, { $set: { notify: false } }, { new: true })
                        let did = await ctx.reply(`Backup notifications turned off`)
                        await delay(500)
                        await ctx.api.deleteMessage()
                        await ctx.api.deleteMessage(ctx.chat.id, did.message_id)
                    }
                    else if (txt.includes('washa updates')) {
                        let chan_id = ctx.channelPost.chat.id

                        let up = await vueNewDramaModel.findOneAndUpdate({ chan_id }, { $set: { notify: true } }, { new: true })
                        let did = await ctx.reply(`Backup notifications turned on`)
                        await delay(500)
                        await ctx.api.deleteMessage()
                        await ctx.api.deleteMessage(ctx.chat.id, did.message_id)
                    }
                }
            }
        }

        // if is not channel
        else { next() }
    }
    catch (err) {
        console.log(err)
        anyErr(err)
    }

}