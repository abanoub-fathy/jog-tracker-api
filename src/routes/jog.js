const express = require("express");
const jogController = require("../controllers/jog");
const { authUser, authRole } = require("../middlewares/auth");
const {
  authCanCreateNewJog,
  authReadUpdateDeleteJog,
  authCanReadUserJogs,
} = require("../middlewares/jog");

// create a jog router
const router = new express.Router();

// create a new jog
router.post("/", authUser, authCanCreateNewJog, jogController.createNewJog);

// read a jog by its id
router.get("/:id", authUser, authReadUpdateDeleteJog, jogController.readJog);

// update a jog by its id
router.patch(
  "/:id",
  authUser,
  authReadUpdateDeleteJog,
  jogController.updateJog
);

// delete a jog by its id
router.delete(
  "/:id",
  authUser,
  authReadUpdateDeleteJog,
  jogController.deleteJog
);

// read list of jogs in db accessed by admin
router.get("/", authUser, authRole(["admin"]), jogController.readListOfJogs);

// read jogs of specific user
router.get(
  "/user/:id",
  authUser,
  authCanReadUserJogs,
  jogController.readListOfUserJogs
);

// get a report of user jogs for the last week
router.get(
  "/user/:id/report",
  authUser,
  authCanReadUserJogs,
  jogController.reportForLastWeek
);

module.exports = router;
