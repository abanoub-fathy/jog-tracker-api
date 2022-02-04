const mongoose = require("mongoose");

// connect to the database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.log(err));
