require("dotenv").config();

const express = require("express");
const axios = require("axios");
const app = express();
const port = 5001;

const lineNotifyRouter = require("./routes/line-notify");
const pushMsg = require("./routes/push-msg");

app.use(function (req, res, next) {
  axios
    .get(
      "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw&json=1&delay=0"
    )
    .then((response) => {
      const price = +response.data.msgArray[0].pz;
      console.log(price);
      if (price === 542) {
        console.log("報價:ooo");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  next();
});

app.use("/login/line_notify", lineNotifyRouter);

app.use("/push", pushMsg);

app.get("/", (req, res) => {
  res.send("hello world!");
});
app.get("/callback", async function (req, res, next) {
  axios
    .post(
      `https://notify-bot.line.me/oauth/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${process.env["LINE_NOTIFY_CALLBACK_URL"]}&client_id=${process.env["LINE_NOTIFY_CLIENT_ID"]}&client_secret=${process.env["LINE_NOTIFY_CLIENT_SECRET"]}`
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
});
app.get("/bye", (req, res) => {
  res.send("bye!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
