const User = require("../models/user");
const createAdmin = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      // create new one
      const admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: "mypass123",
      });
      await admin.save();
      console.log("New admin is created!");
    }
  } catch (e) {
    console.log("Cannot create an admin");
  }
};

module.exports = createAdmin;
