require("dotenv").config();
const axios = require("axios");

const webhook_url = "https://notify-api.line.me/api/notify";

const oauthToken = "Ha7p8dpUaSNug7pGFGKi8lyyMfUblVaYkzNTi49iSax";

const makeNotify = (text) => {
  const data = new URLSearchParams();
  data.append("message", text);
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
