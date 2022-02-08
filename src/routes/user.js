const express = require("express");
const { authUser, authRole } = require("../middlewares/auth");
const { authAccessUserProfile } = require("../middlewares/user");
const userController = require("../controllers/user");

// create a user router
const router = new express.Router();

// create new normal user
router.post("/new", userController.createNewUser);

// login user
router.post("/login", userController.loginUser);

// create new admin user
router.post(
  "/new/admin",
  authUser,
  authRole(["admin"]),
  userController.createNewAdmin
);

// create new user-manager
router.post(
  "/new/manager",
  authUser,
  authRole(["admin"]),
  userController.createNewManager
);

// read a user by its id
router.get(
  "/:id",
  authUser,
  authAccessUserProfile,
  userController.getUserProfile
);

// update user by id
router.patch(
  "/:id",
  authUser,
  authAccessUserProfile,
  userController.updateUser
);

// delete user by id
router.delete(
  "/:id",
  authUser,
  authAccessUserProfile,
  userController.deleteUser
);

// read all users in the database
router.get(
  "/",
  authUser,
  authRole(["admin", "manager"]),
  userController.readListOfUsers
);

// logout requested user from all devices
router.post("/logout/all", authUser, userController.logoutUserFromAllDevice);

// logout  user from one device
router.post("/logout", authUser, userController.logoutUserFromCurrentDevice);

// export the user router
module.exports = router;
