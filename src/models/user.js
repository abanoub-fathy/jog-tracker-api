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

// create user model
const User = mongoose.model("User", userSchema);

// export the user model
module.exports = User;
