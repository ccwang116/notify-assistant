require("dotenv").config();
const dayjs = require("dayjs");
const express = require("express");
const axios = require("axios");
const app = express();
const port = 5001;

const stockList = require("./trace-info.json");

const lineNotifyRouter = require("./routes/line-notify");
const pushMsg = require("./routes/push-msg");
const makeNotify = require("./routes/make-notify");

//only notify when last notification is over 30 minutes
let traceLog = {};
const getStockInfo = (stockId, tracePrice) => {
  axios
    .get(
      `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockId}.tw&json=1&delay=0`
    )
    .then((response) => {
      const stockName = response.data.msgArray[0].n;
      const price = +response.data.msgArray[0].z;
      console.log(stockName, price);
      if (price >= tracePrice && price < tracePrice + 1) {
        if (
          !traceLog[`${stockName}-${tracePrice}`] ||
          dayjs().diff(traceLog[`${stockName}-${tracePrice}`], "m") > 30
        ) {
          makeNotify(`${stockName}: ${price}`);
          traceLog[`${stockName}-${tracePrice}`] = dayjs().format(
            "YYYY/MM/DD HH:mm:ss"
          );
        }
      }
      // console.log("traceLog", traceLog);
    })
    .catch((error) => {
      console.error(error);
    });
};

//get info every 5 secs during MON to FRI morning
setInterval(() => {
  if (
    // dayjs().day() > 0
    dayjs().day() > 0 &&
    dayjs().day() < 6 &&
    dayjs().hour() > 8 &&
    dayjs().hour() < 14
  ) {
    console.log("Wait for 5 second...");
    for (let i = 0; i < stockList.list.length; i++) {
      const element = stockList.list[i];
      getStockInfo(element.stockId, element.tracePrice);
    }
  }
}, 5000);

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.use("/login/line_notify", lineNotifyRouter);

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

app.use("/push", pushMsg);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
