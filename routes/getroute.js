const express = require('express')
const mongoose = require('mongoose')
const botUsersModel = require('../models/botusers')
const newDramaModel = require('../models/vue-new-drama')
const homeModel = require('../models/vue-home-db')

// TELEGRAM
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const latest = await homeModel.find().sort('-year').sort('-createdAt').limit(10)
        const popular = await newDramaModel.find().sort('-timesLoaded').limit(15)

        res.render('home/home', { latest, popular })
    } catch (err) {
        console.log(err)
        res.send('Internal Error, try again later')
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get(['/user/:id/boost', '/user/:id/boost/:ignore'], async (req, res) => {
    try {
        const userId = req.params.id

        let user = await botUsersModel.findOne({ userId })
        let ranks = await botUsersModel.find().limit(10).sort('-points')

        res.render('userstatus/userstatus', { user, ranks })
    } catch (err) {
        console.log(err)
        res.send(`<h2>Error:</h2> ${err.message}`)
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get('/dramastore-add-points/user/:id', async (req, res) => {
    try {
        const userId = req.params.id

        let botuser = await botUsersModel.findOneAndUpdate({ userId }, { $inc: { points: 1 } }, { new: true })
        res.send(botuser)
        bot.telegram.sendMessage(userId, `+1 more point added... you've <b>${botuser.points} points</b>`, { parse_mode: 'HTML' })
    } catch (err) {
        console.log(err)
        res.status(400).send(`<h2>Error: Could'nt add point, try again later</h2>`)
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id

        if(id.startsWith('list-of')) {
            next()
        }

        else {
            const drama = await newDramaModel.findOneAndUpdate({ id }, { $inc: { timesLoaded: 100}}, { new: true })
        const popular = await newDramaModel.find().sort('-timesLoaded').limit(50)

        res.render('subpage/subpage', { drama, popular })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }

})

router.get('/list-of-dramastore-dramas', async (req, res)=> {
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


        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year
        // Add new if under foreach to find dramas of new year

        dramas.forEach(drama=> {
            if(drama.year == 2022 || drama.dramaName.includes('(2022)')) {
                drama2022.push({
                    name: drama.dramaName,
                    path: drama.episodesUrl
                })
            }

            else if(drama.year == 2021 || drama.dramaName.includes('(2021)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }

                drama2021.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if(drama.year == 2020 || drama.dramaName.includes('(2020)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }
                
                drama2020.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if(drama.year == 2019 || drama.dramaName.includes('(2019)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }
                
                drama2019.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if(drama.year == 2018 || drama.dramaName.includes('(2018)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }
                
                drama2018.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if(drama.year == 2017 || drama.dramaName.includes('(2017)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }
                
                drama2017.push({
                    name: drama.dramaName,
                    path
                })
            }

            else if(drama.year == 2016 || drama.dramaName.includes('(2016)')) {
                let path = drama.episodesUrl
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
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
                if(path.includes('joinchat')) {
                    let id = path.split('https://t.me/joinchat/')[1]
                    path = `tg://join?invite=${id}`
                }

                else if(path.includes('t.me') && !path.includes('joinchat')) {
                    let id = path.split('https://t.me/')[1]
                    path = `tg://resolve?domain=${id}`
                }
                
                drama2015.push({
                    name: drama.dramaName,
                    path
                })
            }
        })

        res.render('searchpage/searchpage', {drama2022, drama2021, drama2020, drama2019, drama2018, drama2017, drama2016, drama2015})

    } catch(err) {
        console.log(err)
        res.status(400).send(`${err.message}\n<h2>Error: Couldn't load the resources, try agin later</h2>`)
    }
})

module.exports = router