const Jog = require("../models/jog");
const express = require("express");
const router = new express.Router();

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

module.exports = router;
