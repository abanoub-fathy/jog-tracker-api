const Jog = require("../models/jog");
const express = require("express");
const router = new express.Router();
const { isValidObjectId } = require("mongoose");

// create a jog
router.post("/", async (req, res) => {
  try {
    const jog = new Jog(req.body);
    await jog.save();
    res.status(201).send(jog);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// read all jogs
router.get("/", async (req, res) => {
  try {
    // fetch all jogs
    const jogs = await Jog.find();
    res.send(jogs);
  } catch (e) {
    res.send({ error: e.message });
  }
});

// read a jog by its id
router.get("/:id", async (req, res) => {
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
router.patch("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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

module.exports = router;
