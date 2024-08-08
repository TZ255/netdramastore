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
const ph = new telegraph()

const router = express.Router()

//send success (no content) response to browser
router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/', async (req, res) => {
    try {
        const latest = await homeModel.find().sort('-year').sort('-createdAt').limit(16)
        const popular = await newDramaModel.find().sort('-thisMonth').limit(25)


        res.render('home/home', { latest, popular })
    } catch (err) {
        console.log(err)
        res.send('Internal Error, try again later')
        bot.api.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

//only for telegram
function errorDisplay(error, userId, multiBot) {
    if (error.message) {
        console.log(error.message)
        bot.api.sendMessage(process.env.TG_SHEMDOE, `${error.message} for user with ${userId}`)
    }
    if (error.description) {
        console.log(error.description)
        bot.api.sendMessage(process.env.TG_SHEMDOE, `${error.description} for user with ${userId}`)
    } else {
        bot.api.sendMessage(process.env.TG_SHEMDOE, `Error in adding points for ${userId}, critical check logs`)
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

router.get('/:id', async (req, res, next) => {
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
                res.render('subpage/subpage', { drama, popular })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }

})

router.get('/list-of-dramastore-dramas', async (req, res) => {
    try {
        let dramas = await homeModel.find().sort('-year').sort('dramaName')

        let drama2024 = []
        let drama2023 = []
        let drama2022 = []
        let drama2021 = []
        let drama2020 = []
        let drama2019 = []
        let drama2018 = []
        let drama2017 = []
        let drama2016 = []
        let drama2015 = []
        let allDrama = []


        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year

        dramas.forEach(drama => {
            if (drama.year == 2024 || drama.dramaName.includes('(2024)')) {
                drama2024.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
                allDrama.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
            }

            else if (drama.year == 2023 || drama.dramaName.includes('(2023)')) {
                drama2023.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
                allDrama.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
            }

            else if (drama.year == 2022 || drama.dramaName.includes('(2022)')) {
                drama2022.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
                allDrama.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
            }

            else if (drama.year == 2021 || drama.dramaName.includes('(2021)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2021.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if (drama.year == 2020 || drama.dramaName.includes('(2020)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2020.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if (drama.year == 2019 || drama.dramaName.includes('(2019)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2019.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if (drama.year == 2018 || drama.dramaName.includes('(2018)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2018.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if (drama.year == 2017 || drama.dramaName.includes('(2017)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2017.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if (drama.year == 2016 || drama.dramaName.includes('(2016)')) {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2016.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }

            else {
                let path = drama.episodesUrl
                if (path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if (path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2015.push({
                    name: drama.dramaName,
                    path
                })
                allDrama.push({
                    name: drama.dramaName,
                    path
                })
            }
        })

        res.render('searchpage/searchpage', { drama2024, drama2023, drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015, allDrama })

    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

//new episode req
router.get('/download/episode/:_id/:userid', async (req, res) => {
    try {
        const ep_id = req.params._id
        const userId = req.params.userid
        //const myip = req.ip

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

router.get('/success/send/:_id/:userid', async (req, res) => {
    let _id = req.params._id
    let userId = req.params.userid
    let dbChannel = -1001239425048
    let shemdoe = 741815228
    let prop = `https://glookomtoh.net/4/7646739`
    let crak = `https://t.assxm.link/153258/3785/0?source=dramastore&bo=2753,2754,2755,2756&pyt=multi&po=6456`

    try {
        await botUsersModel.findOneAndUpdate({ userId }, { $inc: { downloaded: 1 } })
        res.redirect(prop)
        let epinfo = await episodeModel.findById(_id)
        setTimeout(() => {
            bot.api.copyMessage(userId, dbChannel, epinfo.epid)
                .catch(e => console.log(e.message))
        }, 10000)
    } catch (err) {
        console.log(err.message, err)
    }
})

router.get('/download/episode/option2/:ep_id/shemdoe', async (req, res) => {
    try {
        let ep_id = req.params.ep_id
        res.redirect(`http://telegram.me/dramastorebot?start=marikiID-${ep_id}`)
    } catch (error) {
        console.log(error.message)
    }
})

router.get('/shemdoe/req/top-100', async (req, res) => {
    try {
        // Fetch data from MongoDB using Mongoose
        const temp = await botUsersModel.find()
            .limit(100).sort('-downloaded')
            .select('fname points downloaded updatedAt userId');

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

router.all('*', (req, res) => {
    res.sendStatus(404)
})

module.exports = router