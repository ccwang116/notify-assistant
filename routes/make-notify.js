require("dotenv").config();
const axios = require("axios");

const webhook_url = "https://notify-api.line.me/api/notify";

const oauthToken = process.env["LINE_NOTIFY_OAUTHTOKEN_ME"];

const makeNotify = (text) => {
  const data = new URLSearchParams();
  data.append("message", text);
  // data.append("stickerPackageId", 789); //出發去: 789 + 10871 慶祝: 11537 + 52002734
  // data.append("stickerId", 10871);
  axios
    .post(webhook_url, data, {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: "Bearer " + oauthToken,
      },
    })
    .then((res) => {
      console.log(`已發送提醒，message: ${res.data.message}`);
      // console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = makeNotify;
