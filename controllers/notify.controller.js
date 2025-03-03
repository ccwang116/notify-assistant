require("dotenv").config();
const axios = require("axios");

const webhook_url = "https://api.line.me/v2/bot/message/push";

const oauthToken = process.env["LINE_NOTIFY_OAUTHTOKEN_ME"];

const userId = "Uc4f6f41cfd8c215cf3df4d2f08d68847"

const makeNotify = async (text, isSticker = false, stickerId = [0, 0]) => {
  const data = {
    to: userId,
    messages: [
      {
        type: "text",
        text: text,
      },
    ],
    notificationDisabled: false,
  };

  if (isSticker) {
    data.messages = [
      {
        type: "text",
        text: text,
      },
      {
        type: "sticker",
        packageId: stickerId[0],
        stickerId: stickerId[1],
      },
    ];
  }
  try {
    const result = await axios.post(webhook_url, data, {
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + oauthToken,
      },
    });
    console.log(`已發送提醒，message: ${result.data.message}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = makeNotify;
