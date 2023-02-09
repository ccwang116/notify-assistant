require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const webhook_url = "https://notify-api.line.me/api/notify";

const oauthToken = process.env["LINE_NOTIFY_OAUTHTOKEN_ME"];

const data = new URLSearchParams();
data.append("message", "鬧鐘");

router.use(function pushMsg(req, res, next) {
  axios
    .post(webhook_url, data, {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: "Bearer " + oauthToken,
      },
    })
    .then((res) => {
      console.log(`statusCode: ${res.status}`);
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
  next();
});
router.get("/", function (req, res, next) {
  res.send("請見手機訊息");
});

module.exports = router;
