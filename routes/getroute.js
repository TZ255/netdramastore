const express = require('express')
const mongoose = require('mongoose')
const botUsersModel = require('../models/botusers')

// TELEGRAM
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

const router = express.Router()

router.get('/', async (req, res)=> {
    try{
       res.redirect('http://www.dramastore.xyz')
    } catch(err) {
        console.log(err)
        res.send('Internal Error, try again later')
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get(['/user/:id/boost', '/user/:id/boost/:ignore'], async (req, res)=> {
    try {
        const userId = req.params.id
        
        let user = await botUsersModel.findOne({ userId })
        let ranks = await botUsersModel.find().limit(10).sort('-downloaded')

        res.render('userstatus/userstatus', { user, ranks })
    } catch(err) {
        console.log(err)
        res.send(`<h2>Error:</h2> ${err.message}`)
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

router.get('/dramastore-add-points/user/:id', async (req, res)=> {
    try {
        const userId = req.params.id
        
        let botuser = await botUsersModel.findOneAndUpdate({ userId }, { $inc: { points: 1}}, { new: true })
        res.send(botuser)
        bot.telegram.sendMessage(userId, `+1 more point added... you've <b>${botuser.points} points</b>`, { parse_mode: 'HTML'})
    } catch(err) {
        console.log(err)
        res.status(400).send(`<h2>Error: Could'nt add point, try again later</h2>`)
        bot.telegram.sendMessage(process.env.TG_SHEMDOE, err.message)
    }
})

module.exports = router