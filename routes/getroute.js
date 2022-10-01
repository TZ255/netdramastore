const express = require('express')
const mongoose = require('mongoose')
const botUsersModel = require('../models/botusers')
const newDramaModel = require('../models/vue-new-drama')
const homeModel = require('../models/vue-home-db')
const blogModel = require('../models/postmodel')
const ohmyBotUsersModel = require('../models/ohmyusers')
const ohmyfilesModel = require('../models/ohmyfiles')
const ohmyOffersModel = require('../models/ohmyOffers')

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
        const popular = await newDramaModel.find().sort('-timesLoaded').limit(15)

        let dramas = await homeModel.find().sort('-year').sort('dramaName')

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
            if (drama.year == 2022 || drama.dramaName.includes('(2022)')) {
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

        res.render('home/home', { latest, popular, drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015 })
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
        let ranks = await botUsersModel.find().limit(25).sort('-downloaded')

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
            const drama = await newDramaModel.findOneAndUpdate({ id }, { $inc: { timesLoaded: 100 } }, { new: true })
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
            if (drama.year == 2022 || drama.dramaName.includes('(2022)')) {
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

        res.render('searchpage/searchpage', { drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015, allDrama })

    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

router.get(['/ohmy-channel-subscribers/:id/boost', '/ohmy-channel-subscribers/:id/boost/:ignore'], (req, res) => {
    const chatid = req.params.id

    res.redirect(`http://ohmy-premium-shows.dramastore.net/boost/${chatid}/add`)
})

///tumeanzia hapa
router.get('/newuser-ds/:id', async (req, res) => {
    const chatid = req.params.id
    try {
        let user = await botUsersModel.findOne({ userId: chatid })
        let posts = await blogModel.find()
        if (user) {
            let data = {
                userId: user.userId,
                points: user.points,
                fname: user.fname,
                downloaded: user.downloaded
            }
            res.send([data, posts])
        } else {
            res.send({ res: 'user not found' })
        }
    } catch (error) {
        errorDisplay(error, chatid, bot)
    }
})

//ohmy static page
router.get('/newuser-oh/:id', async (req, res) => {
    const chatid = req.params.id
    try {
        let user = await ohmyBotUsersModel.findOne({ chatid })
        let posts = await blogModel.find()
        if (user) {
            let data = {
                userId: user.chatid,
                points: user.points,
                fname: user.name,
            }
            res.send([data, posts])
        } else {
            res.send({ res: 'user not found' })
        }
    } catch (error) {
        errorDisplay(error, chatid, boosterBot)
    }
})

router.get('/ohmy-add-points/user/:id', async (req, res) => {
    const userId = req.params.id
    try {
        let botuser = await ohmyBotUsersModel.findOneAndUpdate({ chatid: userId }, { $inc: { points: 1 } }, { new: true })
        res.send(botuser)
        boosterBot.telegram.sendMessage(userId, `+1 more point added... you've <b>${botuser.points} points</b>`, { parse_mode: 'HTML' })
            .catch((err) => {
                errorDisplay(err, userId, boosterBot)
            })
    } catch (err) {
        errorDisplay(err, userId, boosterBot)
    }
})

//blog side posts
router.get('/recent-popular/all-posts', async (req, res) => {

    try {
        let posts = await blogModel.find().sort('-createdAt')
        let pposts = await blogModel.find().sort('-visited')
        if (posts && pposts) {
            res.send([posts, pposts])
        } else {
            res.sendStatus(300)
        }
    } catch (err) {
        console.log(err)
    }
})

//blog posts wit id
router.get('/blog/:id', async (req, res) => {
    let _id = req.params.id

    try {
        let post = await blogModel.findByIdAndUpdate(_id, { $inc: { visited: 5 } }, { new: true })
        let posts = await blogModel.find().sort('-createdAt')
        let pposts = await blogModel.find().sort('-visited').limit(10)
        if (post) {

            res.send([post, posts, pposts])
        } else {
            res.sendStatus(300)
        }
    } catch (err) {
        console.log(err)
    }
})

// dramastore user status with blog
router.get('/dsuser/info/:pid/:uid', async (req, res) => {
    let userId = req.params.uid
    let postId = req.params.pid

    try {
        let user = await botUsersModel.findOne({ userId })
        let ranks = await botUsersModel.find().limit(25).sort('-downloaded')

        //use ne (not equal) to exclude one
        let posts = await blogModel.find({ _id: { $ne: postId } })

        if (!user) {
            res.sendStatus(500)
        } else {
            res.send([user, posts, ranks])
        }
    } catch (err) {
        console.log(`DRAMASTOREBOT ${err.message} -- for user wit id ${userId}`)
        errorDisplay(err, userId, bot)
    }

})

// ohmy user status with blog
router.get('/ohuser/info/:pid/:uid', async (req, res) => {
    let userId = req.params.uid
    let postId = req.params.pid

    try {
        let user = await ohmyBotUsersModel.findOne({ chatid: userId })

        //use ne (not equal) to exclude one
        let posts = await blogModel.find({ _id: { $ne: postId } })

        if (!user) {
            res.sendStatus(500)
        } else {
            res.send([user, posts])
        }
        
    } catch (err) {
        console.log(`OHMY ERROR ${err.message} -- for user wit id ${userId}`)
        errorDisplay(err, userId, boosterBot)
    }

})

//send directly
router.get('/direct-ds-send/:id/:msid', async (req, res) => {
    let id = req.params.id
    let msid = req.params.msid

    try {
        bot.telegram.copyMessage(Number(id), -1001239425048, Number(msid))
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(404)
    }
})

router.get('/direct-oh-send/:id/:nano', async (req, res) => {
    let id = req.params.id
    let nano = req.params.nano

    try {
        let file = await ohmyfilesModel.findOne({ nano })
        await boosterBot.telegram.copyMessage(Number(id), -1001586042518, file.msgId)
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(404)
    }
})


// offers
router.get('/reward/50/:id', async (req, res) => {
    let userId = req.params.id

    try {
        let userName = await botUsersModel.findOne({ userId })
        await bot.telegram.sendMessage(741815228, 'Link Opened')
        res.render('offers/pin-offer', { userName })
    } catch (err) {
        errorDisplay(err, id, boosterBot)
    }
})

router.get('/cong/reward/:id', async (req, res) => {
    let userId = req.params.id

    let ourUser = await botUsersModel.findOne({ userId })
    if (ourUser.offer) {
        if (ourUser.offer[0].gotOffer == true) {
            res.send('You are already completed this offer')
        }
        else {
            await ourUser.updateOne({
                $inc: { points: 50 },
                offer: [
                    {
                        gotOffer: true,
                        country: 'Nigeria',
                        offerNo: 1
                    }
                ]
            })
            await bot.telegram.sendMessage(userId, `Thankyou for completing the offer, you got 50 more points to download files`)
            res.send('Congratulations, you got 50 points 😍')
            await bot.telegram.sendMessage(741815228, `Offer Completed by ${userId}`)
        }
    }
    else {
        let user = await botUsersModel.findOneAndUpdate({ userId }, {
            offer: [
                {
                    country: 'Nigeria',
                    gotOffer: true,
                    offerNo: 1
                }
            ],
            $inc: { points: 50 }
        }
        )
        await bot.telegram.sendMessage(userId, `Thankyou for completing the offer, you got 100 more points to download files`)
        res.send('Congratulations, you got 50 points 😍')
        await bot.telegram.sendMessage(741815228, `Offer Completed by ${userId}`)
    }
})

//offers
router.get('/open-offer/complete/:nano/:id/:msid', async (req, res) => {
    try {
        let id = Number(req.params.id)
        let msid = req.params.msid

        let offer = await ohmyOffersModel.findOneAndUpdate({ pid: 'shemdoe' }, { $inc: { stats: 1 } }, { new: true })

        res.redirect(offer.url)
        setTimeout(() => {
            boosterBot.telegram.copyMessage(id, -1001586042518, msid)
                .catch((err) => {
                    console.log(err)
                    if (err.message.includes('message to copy not found')) {
                        bot.telegram.sendMessage(id, `I couldn't send the full video to you, in ohmy channel use option 2 to get this video.`)
                    }
                })
        }, 10000)

        let this_user = await ohmyBotUsersModel.findOne({ chatid: id })
        let myip = req.ip  //note: this working after set app.set('trust proxy', true)
        let mm = await axios.get(`https://api.ipregistry.co/${myip}?key=${process.env.IP_REG}`)
        let c_code = mm.data.location.country.calling_code
        let c_name = mm.data.location.country.name
        await this_user.updateOne({ location: [{ c_code, c_name }] })
        console.log('country updated with ip '+ myip)
    } catch (err) {
        console.log(err)
        res.send('An error occurred..: Report telegram at @BlackberryTZ')
    }
})

module.exports = router