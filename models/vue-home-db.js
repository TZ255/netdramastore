const mongoose = require('mongoose')

const Schema = mongoose.Schema

const HomeSchema = new Schema({
    idToHome: {
        type: String,
    },
    dramaName: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    episodesUrl: {
        type: String,
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true, strict: false },
)

// Pre-save hook to generate `id` from movie_name
HomeSchema.pre("save", function (next) {
  let id = this.dramaName
    .toLowerCase()
    .replace(/[^a-z0-9\s()]/g, "") // remove special chars except spaces and ()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[()]/g, ""); // remove brackets

  this.episodesUrl = id;
  this.idToHome = id
  next();
});

const HomeModel = mongoose.model('home', HomeSchema)
module.exports = HomeModel