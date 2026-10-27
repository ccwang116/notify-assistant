require("dotenv").config();
const dayjs = require("dayjs");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

const port = 5001;

const lineNotifyRouter = require("./routes/line-notify.route");
const tracksRouter = require("./routes/tracks.route");
const stockRouter = require("./routes/stock.route");
const weatherRouter = require("./routes/weather.route");
const busRouter = require("./routes/bus.route");
const dailyRouter = require("./routes/daily.route");
const pushMsg = require("./routes/push-msg.route");
const { readDb, canEdit } = require("./utils/db.util");

const { getStockInfo } = require("./controllers/tracks.controller");
const {
  getWeatherInfo,
  getWeatherInfoReply,
} = require("./controllers/weather.controller");
const { getBusInfo, getBusInfoReply } = require("./controllers/bus.controller");

app.set("views", __dirname + "/views");
app.set("view engine", "pug");

// get info every 5 secs during MON to FRI morning
// setInterval(() => {
//   if (
//     // dayjs().day() > 0
//     dayjs().day() > 0 &&
//     dayjs().day() < 6 &&
//     dayjs().hour() > 8 &&
//     dayjs().hour() < 14
//   ) {
//     console.log("Wait for 5 second...");
//     const list = readDb().tracks;
//     console.log(list);
//     for (let i = 0; i < list.length; i++) {
//       const element = list[i];
//       getStockInfo(element.stockId, element.tracePrice);
//     }
//   }
// }, 5000);

// setInterval(() => {
//   const timeNow = dayjs().format("HH:mm");
//   if (timeNow === "08:20" || timeNow === "08:25") {
//     const list = readDb().bus;
//     getBusInfo(list[0].routeId, list[0].stopId);
//   }
//   if (timeNow === "08:05") {
//     const list = readDb().weather;
//     getWeatherInfo(list[0].locationId, list[0].locationName);
//   }
// }, 60000);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use((req, res, next) => {
  res.locals.canEdit = canEdit;
  res.locals.currentPath = req.path;
  next();
});

app.get("/", (req, res) => {
  res.render("home", {
    title: "歡迎回來",
    results: [
      {
        title: "股票追蹤",
        desc: "股價到達提醒價格時通知你",
        url: "/stock",
        icon: "chart",
      },
      {
        title: "天氣",
        desc: "每天推送所在地區的天氣預報",
        url: "/weather",
        icon: "cloud",
      },
      {
        title: "公車",
        desc: "查詢公車預計到站時間",
        url: "/bus",
        icon: "bus",
      },
    ],
  });
});
app.use("/stock", stockRouter);

app.use("/tracks", tracksRouter);

app.use("/weather", weatherRouter);

app.use("/bus", busRouter);

app.use("/daily", dailyRouter);

app.use("/push", pushMsg);

app.use("/login/line_notify", lineNotifyRouter);
app.post("/webhook", async (req, res) => {
  const events = req.body?.events || [];

  res.sendStatus(200);

  for (const event of events) {
    try {
      if (event.type !== "message") continue;
      if (event.message.type !== "text") continue;

      const text = event.message.text;

      if (text === "公車") {
        const list = readDb().bus;
        const element = list[0];

        await getBusInfoReply(
          event.replyToken,
          element.routeId,
          element.stopId,
        );
      } else if (text === "天氣") {
        const list = readDb().weather;

        await getWeatherInfoReply(
          event.replyToken,
          list[0].locationId,
          list[0].locationName,
        );
      }
    } catch (err) {
      console.error("webhook error:", err);
    }
  }
});
app.get("/callback", async function (req, res, next) {
  axios
    .post(
      `https://notify-bot.line.me/oauth/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${process.env["LINE_NOTIFY_CALLBACK_URL"]}&client_id=${process.env["LINE_NOTIFY_CLIENT_ID"]}&client_secret=${process.env["LINE_NOTIFY_CLIENT_SECRET"]}`,
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
});
//status example
// res.status(200).json({
//   message: "Edit Success!",
//   data: result.data,
// });
app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
