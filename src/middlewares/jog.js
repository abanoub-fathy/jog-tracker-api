const Jog = require("../models/jog");
const User = require("../models/user");
const { canAccessJog, canViewListOfJogs } = require("../permissions/jog");
const { isValidObjectId } = require("mongoose");

// middleware to check if the user can create a jog or not
const authCanCreateNewJog = async (req, res, next) => {
  const jog = new Jog(req.body);
  if (!canAccessJog(req.user, jog.owner)) {
    return res.status(403).send({ error: "You are not allowed!" });
  }

  // check for a valid owner id
  if (!isValidObjectId(jog.owner)) {
    return res.status(400).send({ error: "Not valid id for owner" });
  }

  try {
    // check for avalid user for this jog
    const user = await User.findById(jog.owner);
    if (!user) {
      return res.status(400).send({ error: "User not found!" });
    }
    req.jog = jog;
    next();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// middleware to check if the user can Read,Update or Delete jog
const authReadUpdateDeleteJog = async (req, res, next) => {
  // check for valid Id
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid Id" });
  }

  try {
    // fetch the jog
    const jog = await Jog.findById(req.params.id);

    // check if the jog is existed
    if (!jog) {
      return res.status(404).send({ error: "Jog not found!" });
    }

    // check if the user can access the jog
    if (!canAccessJog(req.user, jog.owner)) {
      return res.status(403).send({ error: "You are not allowed!" });
    }

    // call next
    req.jog = jog;
    next();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// middleware to fetch jogs for specific user
const authCanReadUserJogs = async (req, res, next) => {
  // check for valid id
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid id" });
  }

  // check for user permission
  if (!canViewListOfJogs(req.user, req.params.id)) {
    return res.status(403).send({ error: "Not allowed" });
  }

  // call next
  next();
};

module.exports = {
  authCanCreateNewJog,
  authReadUpdateDeleteJog,
  authCanReadUserJogs,
};
