const mongoose = require("mongoose");

const jogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  distance: { type: Number, required: true, min: 0 },
  time: { type: Number, required: true, min: 0 },
  location: { type: String, trim: true, default: "undefined" },
});

const Jog = mongoose.model("Jog", jogSchema);
module.exports = Jog;
