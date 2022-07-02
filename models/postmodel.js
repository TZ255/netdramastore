const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blogSchema = new Schema({
    title: {
        type: Number
    },
    body: {
        type: String
    },
    tags: {
        type: Array
    },
    visited: {
        type: Number
    }
}, { timestamps: true, strict: false })

const model = mongoose.model('blogModel', blogSchema)
module.exports = model