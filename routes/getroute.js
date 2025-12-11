const express = require('express')
const mongoose = require('mongoose')
const botUsersModel = require('../models/botusers')
const newDramaModel = require('../models/vue-new-drama')
const homeModel = require('../models/vue-home-db')
const blogModel = require('../models/postmodel')
const ohmyBotUsersModel = require('../models/ohmyusers')
const ohmyfilesModel = require('../models/ohmyfiles')
const ohmyOffersModel = require('../models/ohmyOffers')
const episodeModel = require('../models/dramastore-episode')

//Times
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

const axios = require('axios').default

// TELEGRAM
const { Bot } = require('grammy')
const bot = new Bot(process.env.BOT_TOKEN)
const boosterBot = new Bot(process.env.OH_BOT2)

// TELEGRAPH
const telegraph = require('telegraph-node')
const blockReq = require('./fns/block')
const getUserLocation = require('./fns/userIp')
const detectBettingSites = require('./fns/detect-betting')
const { insertOtherDramaBot } = require('./fns/createdramabot')
const movieModel = require('../models/movieModel')
const ph = new telegraph()

const router = express.Router()

//send success (no content) response to browser
router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/', blockReq, async (req, res) => {
    try {
        const latest = await homeModel.find().sort('-year').sort('-createdAt').limit(16)
        const popular = await newDramaModel.find().sort('-thisMonth').limit(25)
        const latest_episodes = await episodeModel.find().sort('-createdAt').limit(25)


        res.render('home/home', { latest, popular, latest_episodes })
    } catch (err) {
        console.log(err)
        res.send('Internal Error, try again later')
        bot.api.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get(['/list/all', '/list-of-dramastore-dramas'], async (req, res) => {
    try {
        let dramas = await homeModel.find().sort('dramaName').select('dramaName episodesUrl')
        let allDrama = []

        dramas.forEach(drama => {
            let path = drama.episodesUrl
            if (!path.includes('joinchat') && !path.includes('t.me')) {
                path = `/open/${drama.episodesUrl}`
            }
            allDrama.push({ name: drama.dramaName, path })
        })

        res.render('searchpage/searchpage', { allDrama })

    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

router.get('/:id', blockReq, async (req, res, next) => {
    try {
        const id = req.params.id

        if (id.startsWith('list-of')) {
            next()
        }

        else {
            const drama = await newDramaModel.findOneAndUpdate({ id }, { $inc: { timesLoaded: 100, thisMonth: 97, thisWeek: 97, today: 97 } }, { new: true })
            const popular = await newDramaModel.find().sort('-timesLoaded').limit(50)

            if (!drama) {
                res.send('The drama you try to access is not available, Request it from Drama Store Admin (Telegram @shemdoe)')
            }
            else {
                //find episodes
                let episodes = await episodeModel.find({ drama_name: drama.newDramaName }).sort('epno')
                res.render('subpage/subpage', { drama, popular, episodes })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

//only for telegram
function errorDisplay(error, userId, multiBot) {
    if (error.message) {
        console.log(error.message)
        multiBot.api.sendMessage(process.env.TG_SHEMDOE, `${error.message} for user with ${userId}`)
    }
    if (error.description) {
        console.log(error.description)
        multiBot.api.sendMessage(process.env.TG_SHEMDOE, `${error.description} for user with ${userId}`)
    } else {
        multiBot.api.sendMessage(process.env.TG_SHEMDOE, `Error in adding points for ${userId}, critical check logs`)
    }
}

router.get(['/user/:id/boost', '/user/:id/boost/:ignore'], async (req, res) => {
    try {
        const userId = req.params.id

        let user = await botUsersModel.findOne({ userId })
        let temp = await botUsersModel.find().limit(100).sort('-downloaded').select('fname points downloaded updatedAt userId')
        let ranks = []

        for (let u of temp) {
            if (u.fname == '@shemdoe') {
                ranks.push({
                    fname: u.fname, points: u.points, downloaded: u.downloaded, updatedAt: "a moment ago"
                })
            } else {
                ranks.push({
                    fname: u.fname, points: u.points, downloaded: u.downloaded, updatedAt: timeAgo.format(new Date(u.updatedAt))
                })
            }
        }

        res.render('userstatus/userstatus', { user, ranks })
    } catch (err) {
        console.log(err)
        res.send(`<h2>Error:</h2> ${err.message}`)
        bot.api.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get('/dramastore-add-points/user/:id', async (req, res) => {
    const userId = req.params.id
    try {
        let botuser = await botUsersModel.findOneAndUpdate({ userId }, { $inc: { points: 1 } }, { new: true })
        res.send(botuser)
        bot.api.sendMessage(userId, `+1 more point added... you've <b>${botuser.points} points</b>`, { parse_mode: 'HTML' })
            .catch((err) => {
                errorDisplay(err, userId, bot)
            })
    } catch (err) {
        console.log(err)
        res.status(400).send(`<h2>Error: Couldn't add point, try again later</h2>`)
        bot.api.sendMessage(process.env.TG_SHEMDOE, `Error in adding points for ${userId}`)
    }
})

router.get(['/new/episodes', '/new/episodes/0'], async (req, res) => {
    try {
        let episodes = await episodeModel.find().sort('-createdAt').limit(100).select('_id drama_name size epno epid drama_chan_id updatedAt quality')

        let total = episodes.length
        let page = { next: 1, prev: -1 }

        res.render('updated-eps/update', { episodes, page })
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

router.get(['/new/episodes/:page_no'], async (req, res) => {
    try {
        let page_no = Number(req.params.page_no)
        let episodes = await episodeModel.find().skip(page_no * 100).sort('-createdAt').limit(100).select('_id drama_name size epno epid drama_chan_id updatedAt quality')

        if (episodes.length > 0 && page_no >= 0) {
            let page = { next: page_no + 1, prev: page_no - 1 }

            res.render('updated-eps/update', { episodes, page })
        } else {
            res.send('No any other episodes was found')
        }

    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

router.get('/op/drama/:chanid', async (req, res) => {
    try {
        let drama = await newDramaModel.findOne({ chan_id: Number(req.params.chanid) })
        res.redirect(`/open/${drama.id}`)
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

router.get('/open/:id', async (req, res) => {
    try {
        //update drama downloads
        let drama = await newDramaModel.findOneAndUpdate({ id: req.params.id }, { $inc: { timesLoaded: 100, thisMonth: 97, thisWeek: 97, today: 97 } }, { new: true })

        let chan = drama.tgChannel
        if (chan.startsWith('tg://')) {
            let chan_path = chan.split('?invite=')[1]
            chan = `https://t.me/+${chan_path}`
        }
        res.redirect(chan)
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

// router.get('/:id', async (req, res, next) => {
//     try {
//         const id = req.params.id
//         res.render('maintenance')
//     } catch (err) {
//         console.log(err)
//         res.status(400).send(`${err.message}\n`)
//     }

// })

//new episode req by paths
router.get('/download/episode/:_id/:userid', async (req, res) => {
    try {
        const ep_id = req.params._id
        const userId = req.params.userid
        //const myip = req.ip
        const userIp = req?.clientIp

        let episode = await episodeModel.findById(ep_id)
        let the_user = await botUsersModel.findOne({ userId })

        let user = {
            fname: the_user.fname,
            userId,
            points: the_user.points,
            downloaded: the_user.downloaded,
            last: timeAgo.format(new Date(the_user.updatedAt))
        }

        res.render('episode-view/episode', { episode, user })
    } catch (err) {
        console.log(err.message)
    }
})

//new episode req by query params
router.get('/download/episode', async (req, res) => {
    try {
        let { ep_id, userid } = req.query

        //check if there is no ep_id and userid queries
        if (!ep_id && !userid) {
            ep_id = '643d1da000e9b3ff97e5e269'
            userid = 741815228
        }

        let episode = null
        let isMovie = false
        let msg_id = null

        if (String(ep_id).endsWith('--movie')) {
            let _id = String(ep_id).split('--movie')[0]
            episode = await movieModel.findById(_id)
            isMovie = true
            msg_id = Number(episode.msgId)
        } else {
            episode = await episodeModel.findById(ep_id)
            msg_id = Number(episode.epid)
        }

        let the_user = await botUsersModel.findOne({ userId: Number(userid) })

        let user = {
            fname: the_user.fname,
            userId: the_user.userId,
            points: the_user.points,
            downloaded: the_user.downloaded,
            last: timeAgo.format(new Date(the_user.updatedAt))
        }

        //check ip for ads
        let bet_ad_code = '404'
        // let userip = req?.clientIp
        // let ip_data = await getUserLocation(userip)

        // if(ip_data?.status === "success") {
        //     bet_ad_code = detectBettingSites(ip_data.c_code)

        //     //update user data
        //     the_user.country = {name: ip_data.country, c_code: ip_data.c_code}
        //     the_user.save().catch(e => console.log(e.message))
        // } else {
        //     console.log(ip_data)
        // }

        res.render('episode-view/episode', { episode, user, bet_ad_code, isMovie, msg_id })
    } catch (err) {
        console.log(err.message)
        res.status(404).send(`You followed an incorrect url. Please ensure you clicked a button sent to you by dramastore bot<br></br>If this error persist contact dramastore admin @shemdoe`)
    }
})

router.get('/success/send/:msg_id/:userid', async (req, res) => {
    const { msg_id, userid: userId } = req.params;

    const dbChannel = -1001239425048;
    const shemdoe = 741815228;

    // High CPM redirect links
    const monetag = 'https://otieu.com/4/10311018'

    try {
        // Increment user download count
        await botUsersModel.findOneAndUpdate(
            { userId },
            { $inc: { downloaded: 1 } },
            { upsert: true }
        );

        // Redirect user immediately
        res.redirect(monetag);

        // Send Telegram message after a short delay
        setTimeout(async () => {
            try {
                await bot.api.copyMessage(userId, dbChannel, Number(msg_id));
            } catch (err) {
                console.error("Error copying message:", err.message);
            }
        }, 10000);
    } catch (err) {
        console.error("Router error:", err.message);
    }
});


router.get('/download/episode/option2/:ep_id/shemdoe', async (req, res) => {
    try {
        let ep_id = req.params.ep_id
        res.redirect(`http://t.me/dramastorebot?start=marikiID-${ep_id}`)
    } catch (error) {
        console.log(error.message)
    }
})

router.get('/download/movie/option2/:movie_id/shemdoe', async (req, res) => {
    try {
        let movie_id = req.params.movie_id
        res.redirect(`http://t.me/dramastorebot?start=KMOVIE-${movie_id}`)
    } catch (error) {
        console.log(error.message)
    }
})

router.get('/shemdoe/req/top-100', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const temp = await botUsersModel.find()
            .limit(100).sort('-downloaded')
            .select('fname points downloaded updatedAt for userId');

        // Transform the data into the desired format
        const ranks = temp.map(u => ({
            fname: u.fname,
            points: u.points,
            downloaded: u.downloaded,
            updatedAt: timeAgo.format(new Date(u.updatedAt), 'twitter-minute')
        }));

        // Send the transformed data in the response
        res.status(200).json(ranks);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/ebook/free/download/:book', async (req, res) => {
    try {
        const book = req.params.book
        switch (book) {
            case 'atomic':
                let info = {
                    title: 'Atomic Habits',
                    dd: `https://mega.nz/file/jxwnjKbZ#Ba5fFrfgDEYwfpVqmSsAHWOYejUpMPaYA0s5w_lDbW4`,
                    cover: '/images/atomic.webp',
                    sub: `The most fundamental information about habit formation, so you can accomplish more by focusing on less.`
                }
                res.render('zlanding/landing', { info })
                break;

            default:
                res.status(404).send('Book not found')
        }

    } catch (err) {
        console.log(err.message, err)
    }
})

router.get('/post/drama', (req, res) => {
    res.render('postdrama')
})

router.get('/post/movie', (req, res) => {
    res.render('postmovie')
})

router.get('/API/testing', async (req, res) => {
    try {
        insertOtherDramaBot()
        res.send({ "ok": true, "message": "request executed" })
    } catch (error) {
        res.send('Error on testing:', error?.message)
    }
})

router.all('*', (req, res) => {
    res.sendStatus(404)
})

module.exports = router