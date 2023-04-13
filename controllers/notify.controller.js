require("dotenv").config();
const axios = require("axios");

const webhook_url = "https://notify-api.line.me/api/notify";

const oauthToken = process.env["LINE_NOTIFY_OAUTHTOKEN_ME"];

const makeNotify = async (text, isSticker = false, stickerId = [0, 0]) => {
  const data = new URLSearchParams();
  data.append("message", text);
  if (isSticker) {
    data.append("stickerPackageId", stickerId[0]);
    data.append("stickerId", stickerId[1]);
  }
  try {
    const result = await axios.post(webhook_url, data, {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: "Bearer " + oauthToken,
      },
    });
    console.log(`已發送提醒，message: ${result.data.message}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = makeNotify;
