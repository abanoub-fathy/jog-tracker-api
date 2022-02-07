const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isemail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create a user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    // validate that the user entered a valid E-mail address
    validate(email) {
      if (!isEmail(email)) {
        throw new Error("The email address you entered is not valid!");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    default: "normal",
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// jogs virtual property for each user
userSchema.virtual("jogs", {
  ref: "Jog",
  localField: "_id",
  foreignField: "owner",
});

// hash user passwords before saving to the DB
userSchema.pre("save", async function (next) {
  const user = this;

  // if the user try to modify the password
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// generate user auth token function
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  // create new token and save it to the DB
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1 day",
  });
  user.tokens.push({ token });
  await user.save();

  // return the token
  return token;
};

// hide user sensitive information before sending
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.tokens;
  return userObj;
};

// fetch list of users for amin or manager
userSchema.methods.getUsersForRequesterRole = async function () {
  const user = this;
  if (user.role === "admin") {
    return await User.find();
  } else if (user.role === "manager") {
    return await User.find().or([{ role: "normal" }, { _id: user._id }]);
  }
};

// find user by credentials function
userSchema.statics.findByCredentials = async function (email, password) {
  // find the user by email first
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  // check for user password
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return null;
  }

  // return the user
  return user;
};

// remove user related jogs before removing the user from th db
userSchema.pre("remove", async function (next) {
  const user = this;

  try {
    // populate user related jogs
    await user.populate("jogs");

    // loop and remove each jog
    user.jogs.forEach(async (jog) => await jog.remove());
  } catch (e) {
    console.log({ error: e.message });
  }
});

// create user model
const User = mongoose.model("User", userSchema);

// export the user model
module.exports = User;
