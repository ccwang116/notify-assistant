require("dotenv").config();
const express = require("express");
const router = express.Router();
const stockList = require("../db.json");

const makeNotify = require("../controllers/notify.controller");
const { notifyTotal } = require("../controllers/tracks.controller");

// router.use(function pushMsg(req, res, next) {
//   makeNotify("鬧鐘");
//   next();
// });
router.get("/", function (req, res, next) {
  makeNotify("鬧鐘");
  res.send("請見手機訊息");
});
router.get("/total", function (req, res, next) {
  notifyTotal(stockList);
  res.send("請見手機訊息");
});

module.exports = router;
