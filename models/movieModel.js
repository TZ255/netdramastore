const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewDrama = new Schema(
    {
        id: {
            type: String,
        },
        movie_name: {
            type: String,
            required: true,
            default: "Korean Movie",
        },
        coverUrl: {
            type: String,
            required: true,
        },
        synopsis: {
            type: String,
            required: true,
        },
        genre: {
            type: String,
            default: "#Movie",
        },
        subtitle: {
            type: String,
            default: "English",
        },
        telegraph: {
            type: String,
        },
        released: {
            type: Number,
        },
        msgId: {
            type: String,
            required: true,
        },
        backup: {
            type: String,
        },
        timesLoaded: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true, strict: false }
);

// Pre-save hook to generate `id` from movie_name
NewDrama.pre("save", function (next) {
    if (this.movie_name && !this.id) {
        // Example: "The Ultimate: Unsetted (2024)" -> "the-ultimate-unsetted-2024"
        let id = this.movie_name
            .toLowerCase()
            .replace(/[^a-z0-9\s()]/g, "") // remove special chars except spaces and ()
            .replace(/\s+/g, "-") // replace spaces with hyphens
            .replace(/[()]/g, ""); // remove brackets

        this.id = id;
    }
    next();
});

const movieModel = mongoose.model("Movie", NewDrama);
module.exports = movieModel;