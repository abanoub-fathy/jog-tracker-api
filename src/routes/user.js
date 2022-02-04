const express = require("express");
const User = require("../models/user");

// create a user router
const router = new express.Router();

router.post("/new", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// export the user router
module.exports = router;
