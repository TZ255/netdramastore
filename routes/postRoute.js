const express = require('express')
const mongoose = require('mongoose')
const blogModel = require('../models/postmodel')
const router = express.Router()

// TELEGRAM
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

router.post('/blog-post', async (req, res) => {
    let title = req.body.title
    let body = req.body.body
    let rawTags = req.body.tags

    console.log('working')

    try {
        let tags = rawTags.split(',')

        let post = await blogModel.create({
            title, body, tags
        })
        console.log('Post created')
        console.log(post.body)
        res.sendStatus(200)

    } catch (err) {
        console.log(err.message)
        res.sendStatus(300)
    }
})

module.exports = router