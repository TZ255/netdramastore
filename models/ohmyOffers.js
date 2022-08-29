const mongoose = require('mongoose')
const Schema = mongoose.Schema

const offerSchema = new Schema({
    url: {
        type: String
    },
    stats: {
        type: Number,
    },
    pid: {
        type: String,
        default: 'shemdoe'
    }
}, { timestamps: true, strict: false })

const db = mongoose.connection.useDb('ohmyNew')
const model = db.model('offers', offerSchema)
module.exports = model