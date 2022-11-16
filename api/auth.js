var express = require("express");
var router = express.Router();
var stringSimilarity = require("string-similarity");
const fetch = require("node-fetch");

let SummarizerManager = require("node-summarizer").SummarizerManager;

var User = require("../models/User");

const bcrypt = require("bcryptjs");
const Journey = require("../models/Journey");

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      password: encryptedPassword,
    });

    res.status(200).json(user["_id"]);
  } catch (err) {
    console.log(err);
    res.status(500).send;
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ status: "error", error: "No user" });
    }
    if (await bcrypt.compare(password, user.password)) {
      return res.json({
        status: "success",
        data: { username: user.username, name: user.name, _id: user._id },
      });
    } else {
      res.json({ status: "error", error: "Invalid username/password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send;
  }
});

router.post("/personality", async (req, res) => {
  try {
    const { username, personality } = req.body;
    const user = await User.findOneAndUpdate(
      {
        username: username,
      },
      {
        personality: personality,
      }
    );
    res.json({
      personality: personality,
    });
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed to Reterive Data",
    });
  }
});

router.post("/create-journey", async (req, res) => {
  try {
    const { username, title } = req.body;

    const user = await User.findOne({ username }).lean();
    const journey = await Journey.create({
      title: title,
      personality: user.personality,
      username: username,
    });
    res.json({
      status: "success",
      journeyid: journey["_id"],
    });
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed",
    });
  }
});

router.post("/edit-journey", async (req, res) => {
  try {
    const { username, journeyid, text } = req.body;
    const journey = await Journey.findOne({ _id: journeyid });
    var obj = {
      text: text,
      date: new Date(),
    };
    if (journey.username === username) {
      const jour = await Journey.findOneAndUpdate(
        {
          _id: journeyid,
        },
        {
          $push: {
            journeys: obj,
          },
        }
      );
      res.json({
        status: "success",
      });
    }
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed",
    });
  }
});

router.post("/get-journey", async (req, res) => {
  try {
    const { journeyid } = req.body;
    const journey = await Journey.findOne({ _id: journeyid });
    res.json({
      status: "success",
      journey: journey,
    });
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed",
    });
  }
});

router.post("/my-journey", async (req, res) => {
  try {
    const { username } = req.body;
    const journeys = await Journey.find({ username });
    res.json({
      status: "success",
      journeys: journeys,
    });
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed",
    });
  }
});

router.post("/find-journeys", async (req, res) => {
  try {
    const { text, username } = req.body;
    const user = await User.findOne({ username }).lean();

    const journeys = await Journey.find;
    var manyjourneys = [];
    for (let x in journeys) {
      if (journeys[x].personality === user.personality) {
        manyjourneys.push(journeys[x].title);
      }
    }
    var matches = stringSimilarity.findBestMatch(text, manyjourneys);
    var ratings = matches.ratings;
    for (let i = 0; i < ratings.length; i++) {
      if (ratings[i].rating > 0.5) {
        manyjourneys[i]["rating"] = ratings[i].rating;
      }
    }
    var finaljourneys = [];
    for (let z in manyjourneys) {
      if (manyjourneys[z].rating > 0.5) {
        finaljourneys.push(manyjourneys[z]);
      }
    }
    res.json({
      status: "success",
      journeys: finaljourneys,
    });
  } catch (err) {
    return res.json({
      message: "error",
      details: "Failed",
    });
  }
});

router.get("/test", async function (req, res) {
  var text = "Once there was a dog who wandered the streets night and day in search of food. One day, he found a big juicy bone and he immediately grabbed it between his mouth and took it home. On his way home, he crossed a river and saw another dog who also had a bone in its mouth. He wanted that bone for himself too. But as he opened his mouth, the bone he was biting fell into the river and sank. That night, he went home hungry."
  var numberSentences = 1 ;
  let Summarizer = new SummarizerManager(text, numberSentences);
  let summary = Summarizer.getSummaryByRank()

  res.json({
    hello: summary,
   
  });
});

module.exports = router;
