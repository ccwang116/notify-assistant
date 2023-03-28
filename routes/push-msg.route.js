require("dotenv").config();
const express = require("express");
const router = express.Router();

const makeNotify = require("../controllers/notify.controller");

router.use(function pushMsg(req, res, next) {
  makeNotify("鬧鐘");
  next();
});
router.get("/", function (req, res, next) {
  res.send("請見手機訊息");
});

module.exports = router;
