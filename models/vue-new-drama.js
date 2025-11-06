const mongooose = require("mongoose");
const Schema = mongooose.Schema;

const NewDrama = new Schema(
  {
    id: {
      type: String,
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
    chan_id: {
      type: Number
    },
    tgChannel: {
      type: String,
      required: true,
    },
    timesLoaded: {
      type: Number,
      default: 1,
    },
    today: { type: Number },
    thisWeek: { type: Number },
    thisMonth: { type: Number },
    notify: { type: Boolean }
  },
  { timestamps: true, strict: false }
);

// Pre-save hook to generate `id` from movie_name
NewDrama.pre("save", function (next) {
  let id = this.newDramaName
    .toLowerCase()
    .replace(/[^a-z0-9\s()]/g, "") // remove special chars except spaces and ()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[()]/g, ""); // remove brackets

  this.id = id;
  next();
});

const newDramaModel = mongooose.model("newDrama", NewDrama);
module.exports = newDramaModel;
