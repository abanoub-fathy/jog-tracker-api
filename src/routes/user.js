const express = require("express");
const User = require("../models/user");
const { isValidObjectId } = require("mongoose");
const { authUser, authRole } = require("../middlewares/auth");

// create a user router
const router = new express.Router();

// create new normal user
router.post("/new", async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "normal";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// login user
router.post("/login", async (req, res) => {
  // destructure the email and password from the body
  const { email, password } = req.body;
  try {
    if (!email || !email.trim() || !password) {
      return res
        .status(400)
        .send({ error: "E-mail and password are required!" });
    }

    // find the user by email and password
    const user = await User.findByCredentials(email, password);

    if (!user) {
      return res.status(400).send({ error: "Not correct Email or Password" });
    }

    // generate token and return user data
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// create new admin user
router.post("/new/admin", authUser, authRole(["admin"]), async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "admin";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// create new user-manager
router.post("/new/manager", authUser, authRole(["admin"]), async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "manager";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// read all users in the database
router.get("/", authUser, authRole(["admin", "manager"]), async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// read a user by its id
router.get("/:id", authUser, async (req, res) => {
  // check if the id is valid
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid objectId" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }
    // populate user jogs
    await user.populate("jogs");
    res.send({ user, jogs: user.jogs });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// update user by id
router.patch("/:id", authUser, async (req, res) => {
  const validUpdates = ["name", "email", "password"];
  const updates = Object.keys(req.body);
  // check if the updates are valid
  const isValidUpdate = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ error: "Not valid update operation" });
  }

  // check if the user id is valid
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid id" });
  }
  try {
    // fetch the user we need to update
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // update the fields we need to update
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// delete user by id
router.delete("/:id", authUser, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid id" });
  }

  try {
    // fetch the user by its id
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User Not Found" });
    }

    await user.remove();
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// logout user from all devices
router.post("/logout/all/:id", authUser, async (req, res) => {
  // check for valid id
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Id not valid" });
  }

  try {
    // fetch the user with the provided id
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // delete the tokens array
    user.tokens = [];
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// export the user router
module.exports = router;
