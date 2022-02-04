const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isemail");

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

// create user model
const User = mongoose.model("User", userSchema);

// export the user model
module.exports = User;
