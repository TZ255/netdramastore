const mongoose = require('mongoose')
const Schema = mongoose.Schema

const offerSchema = new Schema({
    url: {
        type: String
    },
    stats: {
        type: Number,
    }
}, { timestamps: true, strict: false })

const model = mongoose.model('offers', offerSchema)
module.exports = model