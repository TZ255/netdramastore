const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LatestSchema = new Schema({
    dramaId: {
        type: String,
        required: true
    },
    dramaName: {
        type: String,
        required: true
    }
}, { timestamps: true, strict: false })

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model('latestEpisodes', LatestSchema)
module.exports = model