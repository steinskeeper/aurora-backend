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

    res
      .status(200)
      .json({ code: "success", message: "User Created", userid: user["_id"] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: "error", message: "Error" });
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
        code: "success",
        message: "User Logged In",
        data: { username: user.username, name: user.name, _id: user._id },
      });
    } else {
      res.json({ code: "error", message: "Invalid username/password" });
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
      code: "success",
      message: "Personality Updated",
      personality: personality,
    });
  } catch (err) {
    return res.json({
      code: "error",
      message: "Error",
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
      code: "success",
      message: "Journey Created",
      journeyid: journey["_id"],
    });
  } catch (err) {
    return res.json({
      code: "error",
      message: "Failed to Create Journey",
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
        code: "success",
        message: "Milestone Added",
      });
    }
  } catch (err) {
    return res.json({
      code: "error",
      message: "Failed to Update Journey",
    });
  }
});

router.post("/get-journey", async (req, res) => {
  try {
    const { journeyid } = req.body;
    const journey = await Journey.findOne({ _id: journeyid });
    res.json({
      code: "success",
      message: "Journey Retrieved",
      journey: journey,
    });
  } catch (err) {
    return res.json({
      code: "error",
      message: "Failed to Reterive Data",
    });
  }
});

router.post("/home", async (req, res) => {
  try {
    const { username } = req.body;
    const journeys = await Journey.find({ username });
    const user = await User.findOne({ username });
    res.json({
      code: "success",
      name: user.name,
      journey: journeys,
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
      code: "success",
      journeys: finaljourneys,
    });
  } catch (err) {
    return res.json({
      code: "error",
      details: "Failed",
    });
  }
});

router.get("/test", async function (req, res) {
  var text =
    "Once there was a dog who wandered the streets night and day in search of food. One day, he found a big juicy bone and he immediately grabbed it between his mouth and took it home. On his way home, he crossed a river and saw another dog who also had a bone in its mouth. He wanted that bone for himself too. But as he opened his mouth, the bone he was biting fell into the river and sank. That night, he went home hungry.";
  var numberSentences = 1;
  let Summarizer = new SummarizerManager(text, numberSentences);
  let summary = Summarizer.getSummaryByRank();

  res.json({
    hello: summary,
  });
});

module.exports = router;
