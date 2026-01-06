const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    genre: {type: String, default: "#Drama"},
    Subtitle: {type: String, default: "English"},
    date: {type: Date, default: Date.now},
    aired: {type: String, default: "2 episodes per week"},
    status: {type: String, required: false},
    tgChannel: {type: String, required: true},
    telegraph: {type: String},
    timesLoaded: {type: Number, default: 1},
    chan_id: {type: Number},
    episodes: {type: Array},
    today: {type: Number},
    thisWeek: {type: Number},
    thisMonth: {type: Number},
    notify: {type: Boolean}
  },
  { timestamps: true, strict: false }
);

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model("newDrama", NewDrama);
module.exports = model;
