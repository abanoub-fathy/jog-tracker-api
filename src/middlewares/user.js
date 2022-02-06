const User = require("../models/user");
const { canAccessUserProfile } = require("../permisions/user");
const { isValidObjectId } = require("mongoose");

const authAccessUserProfile = async (req, res, next) => {
  // check if the id is valid
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ error: "Not valid objectId" });
  }

  try {
    // fetch the user we need to show his/her information
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    if (!canAccessUserProfile(req.user, user)) {
      return res.status(403).send({ error: "You are not allowed" });
    }

    // set the requested user
    req.requestedUser = user;
    next();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

module.exports = {
  authAccessUserProfile,
};
