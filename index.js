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
const constructionRouter = require("./routes/under-construction.route");
const pushMsg = require("./routes/push-msg.route");
const mockData = require("./db.json");

const { getStockInfo } = require("./controllers/tracks.controller");
const { getWeatherInfo } = require("./controllers/weather.controller");
const { getBusInfo } = require("./controllers/bus.controller");

app.set("views", __dirname + "/views");
app.set("view engine", "pug");

// get info every 5 secs during MON to FRI morning
setInterval(() => {
  if (
    // dayjs().day() > 0
    dayjs().day() > 0 &&
    dayjs().day() < 6 &&
    dayjs().hour() > 8 &&
    dayjs().hour() < 14
  ) {
    console.log("Wait for 5 second...");
    const list = mockData.tracks;
    console.log(list);
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      getStockInfo(element.stockId, element.tracePrice);
    }
  }
}, 5000);

setInterval(() => {
  const timeNow = dayjs().format("HH:mm");
  if (timeNow === "08:20" || timeNow === "08:25") {
    const list = mockData.bus;
    getBusInfo(list[0].routeId, list[0].stopId);
  }
  if (timeNow === "08:05") {
    const list = mockData.weather;
    getWeatherInfo(list[0].locationId, list[0].locationName);
  }
}, 60000);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.render("home", {
    title: "Welcome!",
    results: [
      { title: "Stock", url: "/stock" },
      { title: "Weather", url: "/weather" },
      { title: "Bus", url: "/bus" },
    ],
  });
});
// app.use("/stock", stockRouter);
app.use("/stock", constructionRouter);

// app.use("/tracks", tracksRouter);
app.use("/tracks", constructionRouter);

// app.use("/weather", weatherRouter);
app.use("/weather", constructionRouter);

// app.use("/bus", busRouter);
app.use("/bus", constructionRouter);

app.use("/daily", dailyRouter);

app.use("/push", pushMsg);

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
//status example
// res.status(200).json({
//   message: "Edit Success!",
//   data: result.data,
// });
app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
