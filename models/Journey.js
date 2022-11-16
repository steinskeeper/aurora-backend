const mongoose = require("mongoose");

const journeyschema = mongoose.Schema(
  {
    title: String,
    journeys: [],
    username: String,
    personality: String,
    author: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journey", journeyschema);
