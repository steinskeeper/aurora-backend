var express = require("express");
var router = express.Router();

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
    if (journey.username === username) {
      const jour = await Journey.findOneAndUpdate(
        {
          _id: journeyid,
        },
        {
          $push: {
            journeys: text,
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

router.get("/test", async function (req, res) {
  res.json({
    hello: "world",
  });
});

module.exports = router;
