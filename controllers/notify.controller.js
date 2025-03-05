require("dotenv").config();
const axios = require("axios");

const webhook_url = "https://api.line.me/v2/bot/message/push";

const oauthToken = process.env["LINE_NOTIFY_OAUTHTOKEN_ME"];

const userIdList = [
  "Uc4f6f41cfd8c215cf3df4d2f08d68847",
  "U6212c0c4e71fe293f684136a14fa1958",
];

const makeNotify = async (text, isSticker = false, stickerId = [0, 0]) => {
  const data = {
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
  const process = [];
  userIdList.forEach((user) => {
    let sendData = data;
    sendData.to = user;
    process.push(
      axios.post(webhook_url, sendData, {
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + oauthToken,
        },
      })
    );
  });
  let holdDoor = true;
  let ps = () => {
    setTimeout(function () {
      console.log("status:", process);
      if (holdDoor) ps();
    }, 500);
  };
  ps();

  return Promise.all(process)
    .then(() => {
      holdDoor = false;
      console.log(`已發送提醒`);
    })
    .catch((error) => console.error(error));
};

module.exports = makeNotify;
