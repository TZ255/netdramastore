const mongoose = require('mongoose')
const Schema = mongoose.Schema

const linkSchema = new Schema({
    channel: {
        type: String
    },
    link: {
        type: String
    }
}, { timestamps: true, strict: false})

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model('backup_invites', linkSchema)
module.exports = model