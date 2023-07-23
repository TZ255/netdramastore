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
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const boosterBot = new Telegraf(process.env.OH_BOT2)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

const router = express.Router()

//send success (no content) response to browser
router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/', async (req, res) => {
    try {
        const latest = await homeModel.find().sort('-year').sort('-createdAt').limit(10)
        const popular = await newDramaModel.find().sort('-thisMonth').limit(25)

        let dramas = await homeModel.find().sort('-year').sort('dramaName')

        let drama2023 = []
        let drama2022 = []
        let drama2021 = []
        let drama2020 = []
        let drama2019 = []
        let drama2018 = []
        let drama2017 = []
        let drama2016 = []
        let drama2015 = []


        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year

        dramas.forEach(drama => {
            if (drama.year == 2023 || drama.dramaName.includes('(2023)')) {
                drama2023.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
            }

            else if (drama.year == 2022 || drama.dramaName.includes('(2022)')) {
                drama2022.push({
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
            }
        })

        res.render('home/home', { latest, popular, drama2023, drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015 })
    } catch (err) {
        console.log(err)
        res.send('Internal Error, try again later')
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

//only for telegram
function errorDisplay(error, userId, multiBot) {
    if (error.message) {
        console.log(error.message)
        multiBot.telegram.sendMessage(process.env.TG_SHEMDOE, `${error.message} for user with ${userId}`)
    }
    if (error.description) {
        console.log(error.description)
        multiBot.telegram.sendMessage(process.env.TG_SHEMDOE, `${error.description} for user with ${userId}`)
    } else {
        multiBot.telegram.sendMessage(process.env.TG_SHEMDOE, `Error in adding points for ${userId}, critical check logs`)
    }
}

router.get(['/user/:id/boost', '/user/:id/boost/:ignore'], async (req, res) => {
    try {
        const userId = req.params.id

        let user = await botUsersModel.findOne({ userId })
        let temp = await botUsersModel.find().limit(500).sort('-downloaded').select('fname points downloaded updatedAt userId')
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
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get('/dramastore-add-points/user/:id', async (req, res) => {
    const userId = req.params.id
    try {
        let botuser = await botUsersModel.findOneAndUpdate({ userId }, { $inc: { points: 1 } }, { new: true })
        res.send(botuser)
        bot.telegram.sendMessage(userId, `+1 more point added... you've <b>${botuser.points} points</b>`, { parse_mode: 'HTML' })
            .catch((err) => {
                errorDisplay(err, userId, bot)
            })
    } catch (err) {
        console.log(err)
        res.status(400).send(`<h2>Error: Couldn't add point, try again later</h2>`)
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, `Error in adding points for ${userId}`)
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

            let dramas = await homeModel.find().sort('-year').sort('dramaName')

            let drama2023 = []
            let drama2022 = []
            let drama2021 = []
            let drama2020 = []
            let drama2019 = []
            let drama2018 = []
            let drama2017 = []
            let drama2016 = []
            let drama2015 = []


            dramas.forEach(drama => {
                if (drama.year == 2023 || drama.dramaName.includes('(2023)')) {
                    drama2023.push({
                        name: drama.dramaName,
                        path: drama.episodesUrl
                    })
                }

                else if (drama.year == 2022 || drama.dramaName.includes('(2022)')) {
                    drama2022.push({
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
                }
            })

            if (!drama) {
                res.send('The drama you try to access is not available, Request it from Drama Store Admin (Telegram @shemdoe)')
            }
            else {
                res.render('subpage/subpage', { drama, popular, drama2023, drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015 })
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
            if (drama.year == 2023 || drama.dramaName.includes('(2023)')) {
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

        res.render('searchpage/searchpage', { drama2023, drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015, allDrama })

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
        const myip = req.ip

        let episode = await episodeModel.findById(ep_id)
        let the_user = await botUsersModel.findOne({ userId })
        let temp = await botUsersModel.find()
            .limit(500).sort('-downloaded')
            .select('fname points downloaded updatedAt userId')

        const ranks = temp.map(u => ({
            fname: u.fname,
            points: u.points,
            downloaded: u.downloaded,
            updatedAt: timeAgo.format(new Date(u.updatedAt))
        }))

        let user = {
            fname: the_user.fname,
            userId,
            points: the_user.points,
            downloaded: the_user.downloaded,
            last: timeAgo.format(new Date(the_user.updatedAt))
        }

        res.render('episode-view/episode', { episode, user, ranks })

        //ip & update country
        if (the_user.country.c_code == 'unknown') {
            let mm = await axios.get(`https://api.ipregistry.co/${myip}?key=${process.env.IP_REG}`)

            let country = {
                name: mm.data.location.country.name,
                c_code: mm.data.location.country.calling_code
            }

            await the_user.updateOne({ $set: { country } })
            console.log(`${user.fname} with ip ${myip} - country updated to ${country.name}`)
        }
    } catch (err) {
        console.log(err.message)
    }
})

router.get('/success/send/:_id/:userid', async (req, res) => {
    let _id = req.params._id
    let userId = req.params.userid
    let dbChannel = -1001239425048
    let shemdoe = 741815228
    let prop = `http://itespurrom.com/4/6141068`
    let adsterra = `https://www.highwaycpmrevenue.com/rha1eibt?key=ff261964d9caf1492ea19335d93dc3a0`

    try {
        res.redirect(adsterra)
        let epinfo = await episodeModel.findById(_id)
        setTimeout(() => {
            bot.telegram.copyMessage(userId, dbChannel, epinfo.epid)
                .catch(e => console.log(e.message))
        }, 5000)
        await botUsersModel.findOneAndUpdate({ userId }, { $inc: { downloaded: 1 } })
    } catch (err) {
        console.log(err)
    }
})

router.all('*', (req, res) => {
    res.sendStatus(404)
})

module.exports = router