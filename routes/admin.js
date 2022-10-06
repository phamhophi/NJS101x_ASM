const path = require("path");
const express = require("express");
const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/checkin", adminController.getCheckIn);

router.post("/checkin", adminController.postCheckIn);

router.get("/employee", adminController.getEmployee);

router.post("/", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

module.exports = router;
