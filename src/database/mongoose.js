const mongoose = require("mongoose");
const createAdmin = require("./createAdmin");

// connect to the database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to the database");
    createAdmin();
  })
  .catch((err) => console.log(err));
