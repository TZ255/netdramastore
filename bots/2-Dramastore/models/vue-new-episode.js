const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newEpisodeSchema = new Schema(
  {
    epid: {type: Number},
    epno: {type: Number},
    size: {type: String},
    drama_name: {type: String},
    drama_chan_id: {type: Number},
    poll_msg_id: {type: Number},
    backup: {type: Number},
    quality: {type: String, default: '540p'}
  },
  { timestamps: true, strict: false }
);

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model("new-episode", newEpisodeSchema);
module.exports = model;