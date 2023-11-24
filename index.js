const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const getRouter = require('./routes/getroute')
const postRouter = require('./routes/postRoute')
const cors = require('cors')
const elimit = require('express-rate-limit')

const app = express()

// TELEGRAM
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

// database connection
mongoose.set('strictQuery', false)
mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@nodetuts-shard-00-00.ngo9k.mongodb.net:27017,nodetuts-shard-00-01.ngo9k.mongodb.net:27017,nodetuts-shard-00-02.ngo9k.mongodb.net:27017/dramastore?ssl=true&replicaSet=atlas-pyxyme-shard-0&authSource=admin&retryWrites=true&w=majority`)
    .then(() => {
        console.log('✅ Connected to database')
    }).catch((err) => {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message)
    })

// MIDDLEWARES
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cors())
app.set('trust proxy', true) //our app is hosted on server using proxy to pass user request

const limiter = elimit({
    keyGenerator: (req, res) => req.ip, //distinguish users based on ip
    windowMs: 60 * 1000, // 1 minute
    max: 15, // Limit each IP to 5 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "To many request, please try again after 3 minutes",
})
app.use(limiter)
app.use(postRouter)
app.use(getRouter)

app.listen(process.env.PORT || 3000, () => console.log('Connected to port 3000'))


process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
    //on production here process will change from crash to start cools
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err)
})