require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  const state = "state";
  res.redirect(
    `https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${process.env["LINE_NOTIFY_CLIENT_ID"]}&redirect_uri=${process.env["LINE_NOTIFY_CALLBACK_URL"]}&scope=notify&state=${state}`
  );
});

module.exports = router;
