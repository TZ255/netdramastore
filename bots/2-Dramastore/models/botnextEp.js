const mongoose = require('mongoose')
const Schema = mongoose.Schema

const nextEpSchema = new Schema({
    dramaName: {
        type: String,
        default: "DRAMA STORE"
    },
    nextEp: {
        type: String,
        required: true
    },
    dramaId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model('nextEpModel', nextEpSchema)
module.exports = model