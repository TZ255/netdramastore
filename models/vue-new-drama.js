const mongooose = require("mongoose");
const Schema = mongooose.Schema;

const NewDrama = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    newDramaName: {
      type: String,
      required: true,
      default: "Korean Drama",
    },
    coverUrl: {
      type: String,
      required: true,
    },
    synopsis: {
      type: String,
      required: true,
    },
    noOfEpisodes: {
      type: String,
      required: true,
      default: "Not Confirmed",
    },
    genre: {
      type: String,
      default: "#Drama",
    },
    Subtitle: {
      type: String,
      default: "English",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    aired: {
      type: String,
      default: "2 episodes per week",
    },
    status: {
      type: String,
      required: false,
    },
    tgChannel: {
      type: String,
      required: true,
    },
    timesLoaded: {
      type: Number,
      default: 1,
    },
    today: {type: Number},
    thisWeek: {type: Number},
    thisMonth: {type: Number},
    notify: {type: Boolean}
  },
  { timestamps: true, strict: false }
);

const newMovieModel = mongooose.model("newDrama", NewDrama);
module.exports = newMovieModel;
