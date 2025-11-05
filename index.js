const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const getRouter = require('./routes/getroute')
const postRouter = require('./routes/postRoute')
const cors = require('cors')
const elimit = require('express-rate-limit')
const requestIp = require('request-ip');

const app = express()

// TELEGRAPH
const telegraph = require('telegraph-node')
const { DramaBots } = require('./bots/dramasbot/bot')
const ph = new telegraph()


// MIDDLEWARES
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cors())
app.set('trust proxy', true) //our app is hosted on server using proxy to pass user request
app.use(requestIp.mw());

// Database connection
mongoose.set('strictQuery', false)
mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@nodetuts-shard-00-00.ngo9k.mongodb.net:27017,nodetuts-shard-00-01.ngo9k.mongodb.net:27017,nodetuts-shard-00-02.ngo9k.mongodb.net:27017/dramastore?ssl=true&replicaSet=atlas-pyxyme-shard-0&authSource=admin&retryWrites=true&w=majority`)
    .then(async () => {
        console.log('✅ Connected to database')

        // Initialize bots IMMEDIATELY after DB connection
        // BEFORE other routes are registered
        await DramaBots(app).catch(()=> {})

        // Register other routes AFTER bot routes
        app.use(postRouter)
        app.use(getRouter)

        console.log('✅ All routes registered')
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err)
        //process.exit(1)
    })

app.listen(process.env.PORT || 3000, () => console.log('Connected to port 3000'))


process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
    //on production here process will change from crash to start cools
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err)
})