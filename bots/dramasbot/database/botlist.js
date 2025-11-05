const mongoose = require('mongoose')
const Schema = mongoose.Schema

const botListSchema = new Schema({
    token: {type: String},
    botname: {type: String},
    drama_chanid: {type: Number},
}, {timestamps: true, strict: false})

const botListModel = mongoose.model('Drama Bot List', botListSchema)
module.exports = botListModel