const Jog = require("../models/jog");
const express = require("express");
const router = new express.Router();
const { isValidObjectId } = require("mongoose");
const { authUser, authRole } = require("../middlewares/auth");
const {
  authCanCreateNewJog,
  authReadUpdateDeleteJog,
  authCanReadUserJogs,
} = require("../middlewares/jog");

// create a new jog
router.post("/", authUser, authCanCreateNewJog, async (req, res) => {
  try {
    await req.jog.save();
    res.status(201).send(req.jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// read a jog by its id
router.get("/:id", authUser, authReadUpdateDeleteJog, async (req, res) => {
  res.send(req.jog);
});

// update a jog by its id
router.patch("/:id", authUser, authReadUpdateDeleteJog, async (req, res) => {
  // check from valid updates
  const updates = Object.keys(req.body);
  const validUpdates = ["location", "time", "distance"];
  const isValidUpdate = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ error: "Not valid update operation" });
  }
  try {
    // update and save the jog
    updates.forEach((update) => {
      req.jog[update] = req.body[update];
    });
    await req.jog.save();
    res.send(req.jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// delete a jog by its id
router.delete("/:id", authUser, authReadUpdateDeleteJog, async (req, res) => {
  try {
    await req.jog.remove();
    res.send(req.jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// read list of jogs in db accessed by admin
router.get("/", authUser, authRole(["admin"]), async (req, res) => {
  try {
    // fetch all jogs
    const count = await Jog.count();
    const jogs = await Jog.find()
      .limit(Number(req.query.limit) || 5)
      .skip(Number(req.query.skip) || 0);
    res.send({ total: count, jogs });
  } catch (e) {
    res.send({ error: e.message });
  }
});

// read jogs of specific user
router.get("/user/:id", authUser, authCanReadUserJogs, async (req, res) => {
  // create a jog query
  let query = Jog.find({ owner: req.params.id });

  // from specific date
  if (req.query.from && req.query.from !== null) {
    query = query.gte("date", req.query.from);
  }

  // to specific date
  if (req.query.to && req.query.to !== null) {
    query = query.lte("date", req.query.to);
  }

  // add limit
  if (req.query.limit && req.query.limit !== null) {
    query = query.limit(Number(req.query.limit));
  }

  // add skip
  if (req.query.skip && req.query.skip !== null) {
    query = query.skip(Number(req.query.skip));
  }

  // add sorting
  if (req.query.sortBy && req.query.sortBy !== null) {
    query = query.sort({
      date: req.query.sortBy === "des" ? "descending" : "ascending",
    });
  }

  try {
    // find the jogs
    const count = await Jog.find({ owner: req.params.id }).count();
    const jogs = await query.exec();
    res.send({ total: count, jogs });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// get a report of user jogs for the last week
router.get(
  "/user/:id/report",
  authUser,
  authCanReadUserJogs,
  async (req, res) => {
    try {
      // fetch user related jogs in the last week
      let now = new Date();
      let oneWeekBeforeNow = new Date();
      oneWeekBeforeNow.setDate(oneWeekBeforeNow.getDate() - 7);
      let jogs = await Jog.find({ owner: req.params.id })
        .gte("date", oneWeekBeforeNow)
        .lte("date", now);

      // create a report
      let totalTime = 0;
      let totalDistance = 0;

      jogs.forEach((jog) => {
        totalTime += jog.time;
        totalDistance += jog.distance;
      });

      res.send({
        from: oneWeekBeforeNow,
        to: now,
        distance: totalDistance,
        averageSpeed: totalTime === 0 ? 0 : totalDistance / totalTime,
      });
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  }
);

module.exports = router;
