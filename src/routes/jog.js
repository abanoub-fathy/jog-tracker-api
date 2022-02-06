const Jog = require("../models/jog");
const express = require("express");
const router = new express.Router();
const { isValidObjectId } = require("mongoose");
const { authUser, authRole } = require("../middlewares/auth");

// create a jog
router.post("/", authUser, async (req, res) => {
  try {
    const jog = new Jog(req.body);
    await jog.save();
    res.status(201).send(jog);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// read all jogs
router.get("/", authUser, async (req, res) => {
  try {
    // fetch all jogs
    const jogs = await Jog.find();
    res.send(jogs);
  } catch (e) {
    res.send({ error: e.message });
  }
});

// read jogs of specific user
router.get("/user/:id", authUser, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid user id" });
  }

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
    const jogs = await query.exec();
    res.send(jogs);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// read a jog by its id
router.get("/:id", authUser, async (req, res) => {
  const validId = isValidObjectId(req.params.id);
  if (!validId) {
    return res.status(400).send({ error: "Not valid ID" });
  }

  try {
    const jog = await Jog.findById(req.params.id);
    if (!jog) {
      return res.status(404).send({ error: "Jog not found" });
    }

    res.send(jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// update a jog by its id
router.patch("/:id", authUser, async (req, res) => {
  // check from the validation of the id
  const validId = isValidObjectId(req.params.id);
  if (!validId) {
    return res.status(400).send({ error: "Not valid ID" });
  }

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
    const jog = await Jog.findById(req.params.id);
    if (!jog) {
      return res.status(404).send({ error: "Jog not found" });
    }
    // update and save the jog
    updates.forEach((update) => {
      jog[update] = req.body[update];
    });
    await jog.save();
    res.send(jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// delete a jog by its id
router.delete("/:id", authUser, async (req, res) => {
  const validId = isValidObjectId(req.params.id);
  if (!validId) {
    return res.status(400).send({ error: "Not valid ID" });
  }

  try {
    const jog = await Jog.findById(req.params.id);
    if (!jog) {
      return res.status(404).send({ error: "Jog not found" });
    }

    await jog.remove();
    res.send(jog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// get a report of user jogs for the last week
router.get("/user/:id/report", authUser, async (req, res) => {
  // check for valid id
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid Id" });
  }

  try {
    // fetch user related jogs in the last week
    let now = new Date();
    let oneWeekBeforeNow = new Date();
    oneWeekBeforeNow.setDate(oneWeekBeforeNow.getDate() - 7);
    let jogs = await Jog.find().gte("date", oneWeekBeforeNow).lte("date", now);

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
});

module.exports = router;
