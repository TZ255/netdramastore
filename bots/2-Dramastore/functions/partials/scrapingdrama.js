// Required external dependencies
const axios = require('axios');
const cheerio = require('cheerio');
const { nanoid } = require('nanoid');
const telegraph = require('telegraph-node');
const ph = new telegraph()
const dramasModel = require('../../models/vue-new-drama');
const homeModel = require('../../models/vue-home-db');
const movieModel = require('../../models/movieModel');


const scrapeMyDramalist = async (ctx, txt, dt, bot) => {
    try {
        // Get the channel id from the context (if using channel posts)
        let chid = ctx.channelPost.chat.id;

        // Get additional channel info
        let info = await bot.api.getChat(chid);
        let arrs = txt.split('=');

        // Extract invite link, URL and drama ID from the text
        let invite_link = info.invite_link;
        let url = arrs[1].trim();
        let dramaid = arrs[2].trim();

        // Fetch the HTML from the URL and load it into Cheerio for scraping
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);

        // Get the synopsis and remove the source if needed
        let syn = $('.show-synopsis').text();
        if (syn.includes('(Source: ')) {
            let arr = syn.split('(Source: ');
            syn = arr[0].trim();
        }

        // Get the genres and trim extra text
        let genres = $('.show-genres').text().split('Genres: ')[1].trim();

        // Get the cover image details and construct high-quality image URL
        let pic_href = $('.row .cover .block').attr('href');
        let pic_id = pic_href.split('/photos/')[1].trim();
        let highq_img = `https://i.mydramalist.com/${pic_id}f.jpg`;

        // Get the low-quality image URL from either "src" or "data-cfsrc"
        let lowq_img = '';
        if ($('.row .cover .block img').attr('src')) {
            lowq_img = $('.row .cover .block img').attr('src');
        } else {
            lowq_img = $('.row .cover .block img').attr('data-cfsrc');
        }
        if (lowq_img.includes(`/cdn-cgi/mirage/`)) {
            let raw = lowq_img.split('https:');
            lowq_img = 'https:' + raw[1];
        }

        // Get the drama name and other details from the page
        let dramaName = $('.box-header .film-title').text().trim();

        let no_of_episodes = $('.box-body ul li:nth-child(3)')
            .text()
            .split('Popularity')[0]
            .split('Episodes: ')[1]
            .trim();
        if (no_of_episodes.length === 1) {
            no_of_episodes = '0' + no_of_episodes;
        }
        let aired = $('.box-body ul li:nth-child(4)')
            .text()
            .split('Watchers')[0]
            .split('Aired: ')[1]
            .trim();
        let country = $('.box-body ul li:nth-child(2)')
            .text()
            .split('Country: ')[1]
            .split('Ranked')[0]
            .trim();

        // Create a Telegraph page with the drama information
        let page = await ph.createPage(
            process.env.TOKEN,
            dramaName,
            [
                { tag: 'img', attrs: { src: highq_img } },
                { tag: 'h3', children: ['Details'] },
                {
                    tag: 'ul',
                    children: [
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Drama: '] },
                                { tag: 'i', children: [dramaName] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Episodes: '] },
                                { tag: 'i', children: [no_of_episodes] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Subtitle: '] },
                                { tag: 'i', children: ['English'] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Aired: '] },
                                { tag: 'i', children: [aired] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Genre: '] },
                                { tag: 'i', children: [genres] },
                            ],
                        },
                        {
                            tag: 'li',
                            children: [
                                { tag: 'b', children: ['Country: '] },
                                { tag: 'i', children: [country] },
                            ],
                        },
                    ],
                },
                { tag: 'h3', children: ['Synopsis'] },
                {
                    tag: 'em',
                    children: [
                        {
                            tag: 'i',
                            children: [syn],
                        },
                    ],
                },
            ],
            {
                author_name: '@shemdoe',
                author_url: 'https://t.me/shemdoe',
            }
        );
        let telegraph_link = page.url;
        let link_id = invite_link.split('/+')[1];

        // Create database entries if this is not a repost
        if (!txt.includes('repost_drama')) {
            await dramasModel.create({
                newDramaName: dramaName,
                noOfEpisodes: no_of_episodes,
                genre: genres,
                aired,
                subtitle: 'English',
                id: dramaid,
                coverUrl: highq_img,
                synopsis: syn.replace(/\n/g, '<br>'),
                status: 'Ongoing',
                tgChannel: `tg://join?invite=${link_id}`,
                telegraph: telegraph_link,
                timesLoaded: 1,
                nano: nanoid(5),
                chan_id: chid,
                country,
                notify: true,
            });

            let yearScrap = dramaName.split('(2')[1].split(')')[0];
            let strYr = `2${yearScrap}`;
            await homeModel.create({
                idToHome: dramaid,
                year: Number(strYr),
                dramaName,
                imageUrl: lowq_img,
                episodesUrl: dramaid,
            });
        }

        // Format the message to send via Telegram
        let ujumb = `<a href="${telegraph_link}">🇰🇷 </a><u><b>${dramaName}</b></u>`;
        if (country === 'China') {
            ujumb = `<a href="${telegraph_link}">🇨🇳 </a><u><b>${dramaName}</b></u>`;
        }
        if (country === 'Japan') {
            ujumb = `<a href="${telegraph_link}">🇯🇵 </a><u><b>${dramaName}</b></u>`;
        }
        if (txt.includes('repost_drama')) {
            ujumb = `#UPDATED\n<a href="${telegraph_link}">🇰🇷 </a><u><b>${dramaName}</b></u>`;
        }

        // Send a message to the designated chat using the bot API
        await bot.api.sendMessage(dt.shd, ujumb, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⬇ DOWNLOAD ALL EPISODES', url: invite_link }],
                    [
                        { text: '📊 Trending', url: 't.me/dramastorebot?start=on_trending' },
                        { text: '🔍 Find drama', url: 't.me/dramastorebot?start=find_drama' },
                    ],
                    [{ text: 'Push to dramastore', callback_data: 'push' }],
                ],
            },
        });

        // Also reply in the current context with the drama info
        await ctx.reply(ujumb, { parse_mode: 'HTML' });

        // Finally, copy and pin a specific message (for example, an H265 version)
        let waikiki_id = -1002192201513;
        let h265 = await ctx.api.copyMessage(chid, waikiki_id, 5);
        await ctx.api.pinChatMessage(chid, h265.message_id);
    } catch (error) {
        console.log('Failed scraping mydramalist')
        throw error
    }
};

const scrapeAsianWiki = async (ctx, txt, dt, bot) => {
    try {
        // Get the channel id from the context (if using channel posts)
        let chid = ctx.channelPost.chat.id;

        // Get additional channel info
        let info = await bot.api.getChat(chid);
        let arrs = txt.split('=');

        // Extract invite link, URL and drama ID from the text
        let invite_link = info.invite_link;
        let url = arrs[1].trim();
        let dramaid = arrs[2].trim();

        // Fetch the HTML from the URL and load it into Cheerio for scraping
        const html = await axios.get('https://asianwiki.com/For_Eagle_Brothers', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Save-Data': 'on',
                'Priority': 'u=0, i',
                'Referer': 'https://www.google.com/'
            },
            withCredentials: true // Equivalent to "credentials: include" in fetch
        });
        const $ = cheerio.load(html.data);
        console.log(html.data)
    } catch (error) {
        throw error
    }
}

const TelegraphPage = async (bot, ctx, dt) => {
    try {
        let text = ctx.channelPost.text
        let _id = text.split('=')[1]
        let drama = await dramasModel.findById(_id)
        if (!drama) return await ctx.reply('No drama found for the given ID');

        // Format the message to send via Telegram
        let ujumb = `<a href="${drama.telegraph}">🇰🇷 </a><u><b>${drama.newDramaName}</b></u>`;
        if (drama?.country === 'China') {
            ujumb = `<a href="${drama.telegraph}">🇨🇳 </a><u><b>${drama.newDramaName}</b></u>`;
        }
        if (drama?.country === 'Japan') {
            ujumb = `<a href="${drama.telegraph}">🇯🇵 </a><u><b>${drama.newDramaName}</b></u>`;
        }

        // Get the channel id from the context (if using channel posts)
        let chid = ctx.channelPost.chat.id;
        // Get additional channel info
        let info = await bot.api.getChat(chid);
        // Extract invite link, URL and drama ID from the text
        let invite_link = info.invite_link;
        let link_id = invite_link.split('/+')[1];

        //update db with channel info
        drama.tgChannel = `tg://join?invite=${link_id}`
        drama.chan_id = chid
        await drama.save()

        // Send a message to the designated chat using the bot API
        await bot.api.sendMessage(dt.shd, ujumb, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⬇ DOWNLOAD ALL EPISODES', url: invite_link }],
                    [
                        { text: '📊 Trending', url: 't.me/dramastorebot?start=on_trending' },
                        { text: '🔍 Find drama', url: 't.me/dramastorebot?start=find_drama' },
                    ],
                    [{ text: 'Push to dramastore', callback_data: 'push' }],
                ],
            },
        });

        // Also reply in the current context with the drama info
        await ctx.reply(ujumb, { parse_mode: 'HTML' });

        // Finally, copy and pin a specific message (for example, an H265 version)
        let waikiki_id = -1002192201513;
        let h265 = await ctx.api.copyMessage(chid, waikiki_id, 5);
        await ctx.api.pinChatMessage(chid, h265.message_id);
        //delete message
        await ctx.api.deleteMessage(chid, ctx.channelPost.message_id)
    } catch (error) {
        await ctx.reply('Telegraph page failded')
        throw error
    }
}

const TelegraphMoviePage = async (bot, ctx, dt) => {
    try {
        let text = ctx.channelPost.text
        let mv_id = text.split('=')[1].trim()
        let movie = await movieModel.findById(mv_id)
        if (!movie) return await ctx.reply(`No Movie found for the given ID: ${mv_id}`);

        // Format the message to send via Telegram
        let ujumb = `<a href="${movie.telegraph}">🎬 </a><u><b>${movie.movie_name}</b></u>`;

        // Get the channel id from the context (if using channel posts)
        let chid = ctx.channelPost.chat.id;
        // Get additional channel info
        let info = await bot.api.getChat(chid);
        // Extract invite link, URL and drama ID from the text
        let invite_link = info.invite_link;

        let ddl2 = `http://dramastore.net/download/movie/option2/${mv_id}/shemdoe`
        let ddl = `https://${dt.link}KMOVIE-${movie._id}`

        // Send a message to the designated chat using the bot API
        await ctx.reply(ujumb, {
            parse_mode: 'HTML',
            link_preview_options: {
                prefer_large_media: true,
                show_above_text: false
            },
            reply_markup: {
                inline_keyboard: [
                    [{ text: `📥 DOWNLOAD NOW (${movie?.file_size || '~200'} MB)`, url: ddl }],
                    [
                        { text: '📥 LINK #2', url: ddl2 },
                        { text: '💡 Help', callback_data: 'newHbtn2' },
                    ],
                ],
            },
        });

        //edit the movie on db channel
        const new_caption = `<b>${movie.movie_name}</b> with English Subtitles \n\n<b>⭐️Find More KDrama & Movies at\n<a href="https://t.me/+vfhmLVXO7pIzZThk">@KOREAN_DRAMA_STORE</a></b>`
        await bot.api.editMessageCaption(dt.databaseChannel, Number(movie.msgId), {
            caption: new_caption, parse_mode: 'HTML'
        }).catch(e => { console.log(e?.message, e) })

        // backup
        if (!movie.backup) {
            const backup = await bot.api.copyMessage(dt.backup, dt.databaseChannel, Number(movie.msgId));
            movie.backup = backup.message_id
            await movie.save()
        }

        // Prepare a caption for a notification message
        let caption = `<blockquote>New Movie Uploaded 🔥</blockquote>\n<b>${movie.movie_name}\n\n🔗 Check it Out!\n<a href="${invite_link}">https://t.me/download/${movie.nano}</a></b>`;

        await bot.api.sendDocument(dt.aliProducts, movie.coverUrl, {
            parse_mode: 'HTML',
            caption
        });

        //delete message
        await ctx.api.deleteMessage(chid, ctx.channelPost.message_id)
    } catch (error) {
        await ctx.reply(`Error: ${error?.message}`)
        console.log("Movie Post Error:", error)
    }
}

module.exports = {
    scrapeMyDramalist,
    scrapeAsianWiki,
    TelegraphPage,
    TelegraphMoviePage
}