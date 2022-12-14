const mongoose = require("mongoose");

const journeyschema = mongoose.Schema(
  {
    title: String,
    journeys: [],
    username: String,
    personality: String,
    author: String,
    journeyend: { type: Boolean, default: false },
    summary: { type: String, default: "No summary" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journey", journeyschema);
