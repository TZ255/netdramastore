const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const getRouter = require('./routes/getroute')
const postRouter = require('./routes/postRoute')
const cors = require('cors')

const app = express()

// TELEGRAM
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

// TELEGRAPH
const telegraph = require('telegraph-node')
const ph = new telegraph()

// database connection
mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASS}@nodetuts.ngo9k.mongodb.net/dramastore?retryWrites=true&w=majority`)
.then(()=> console.log('Connected to database'))
.catch((err)=> {
    console.log(err)
    bot.telegram.sendMessage('@shemdoe', err.message)
})

// MIDDLEWARES
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cors())
app.set('trust proxy', true) //our app is hosted on server using proxy to pass user request
app.use(postRouter)
app.use(getRouter)

app.listen(process.env.PORT || 3000, ()=> console.log('Connected to port 3000'))


process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
    //on production here process will change from crash to start cools
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err)
})