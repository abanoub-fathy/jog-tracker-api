const User = require("../models/user");

// create new user controller
exports.createNewUser = async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "normal";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};

// login user
exports.loginUser = async (req, res) => {
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
};

// create new admin
exports.createNewAdmin = async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "admin";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};

// create new user manager
exports.createNewManager = async (req, res) => {
  try {
    const user = new User(req.body);
    user.role = "manager";
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};

// get user profile
exports.getUserProfile = async (req, res) => {
  await req.requestedUser.populate({
    path: "jogs",
    options: {
      limit: 10,
    },
  });
  res.send({ user: req.requestedUser, jogs: req.requestedUser.jogs });
};

// update user
exports.updateUser = async (req, res) => {
  const validUpdates = ["name", "email", "password"];
  const updates = Object.keys(req.body);
  // check if the updates are valid
  const isValidUpdate = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ error: "Not valid update operation" });
  }

  try {
    // update the fields we need to update
    updates.forEach((update) => {
      req.requestedUser[update] = req.body[update];
    });
    await req.requestedUser.save();
    res.send(req.requestedUser);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    await req.requestedUser.remove();
    res.send(req.requestedUser);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// read list of users in the db
exports.readListOfUsers = async (req, res) => {
  try {
    const users = await req.user.getUsersForRequesterRole();
    res.send(users);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// logout user
exports.logoutUserFromAllDevice = async (req, res) => {
  try {
    // delete the tokens array
    req.user.tokens = [];
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// logout user from current device
exports.logoutUserFromCurrentDevice = async (req, res) => {
  try {
    // delete the tokens array
    req.user.tokens = req.user.tokens.filter(
      (tokenObj) => tokenObj.token !== req.token
    );
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};
