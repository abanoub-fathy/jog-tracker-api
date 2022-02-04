const express = require("express");

// connect to the database
require("./database/mongoose");

// create express app
const app = express();
app.use(express.json());

// app routers
app.use("/users", require("./routes/user"));

// listen on the app port
const port = process.env.PORT || 5000;
app.listen(port, console.log(`App is working on port ${port}`));
