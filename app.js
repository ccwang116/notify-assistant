require("dotenv").config();
const dayjs = require("dayjs");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

const port = 5001;

const stockList = require("./db.json");

const lineNotifyRouter = require("./routes/line-notify");
const tracksRouter = require("./routes/tracks.route");
const stockRouter = require("./routes/stock.route");
const weatherRouter = require("./routes/weather.route");
const pushMsg = require("./routes/push-msg");

const makeNotify = require("./controllers/notify.controller");
const { getWeatherInfo } = require("./controllers/weather.controller");

// create application/json parser
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set("views", __dirname + "/views");
app.set("view engine", "pug");

const handleMatchPrice = (price, tracePrice, stockName, traceLog) => {
  if (price >= tracePrice && price < tracePrice + 1) {
    if (
      !traceLog[`${stockName}-${tracePrice}`] ||
      dayjs().diff(traceLog[`${stockName}-${tracePrice}`], "m") > 30
    ) {
      // console.log(`台股報價\n${stockName}: ${price}`);
      makeNotify(`台股報價\n${stockName}: ${price}`);
      traceLog[`${stockName}-${tracePrice}`] = dayjs().format(
        "YYYY/MM/DD HH:mm:ss"
      );
    }
  }
};
//only notify when last notification is over 30 minutes
let traceLog = {};
const getStockInfo = (stockId, tracePriceList) => {
  axios
    .get(
      `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockId}.tw&json=1&delay=0`
    )
    .then((response) => {
      const targetStock = response.data.msgArray
        ? response.data.msgArray[0]
        : null;
      const stockName = targetStock ? targetStock.n : "無資料";
      const price = targetStock ? +targetStock.z : 0;
      console.log(stockName, price);
      tracePriceList.forEach((tracePrice) => {
        handleMatchPrice(price, tracePrice, stockName, traceLog);
      });
      // console.log("traceLog", traceLog);
    })
    .catch((error) => {
      console.error(error);
    });
};

const getBusInfo = (routeId, stopId) => {
  axios
    .get(
      `https://pda.5284.gov.taipei/MQS/RouteDyna?routeid=${routeId}&nocache=${dayjs().valueOf()}`
    )
    .then((response) => {
      const stop = response.data.Stop.find((ele) => ele.id === stopId);
      const infoList = stop.n1.split(",");
      const count = Math.floor(infoList[7] / 60);
      if (count === -1) {
        makeNotify(`243公車文化里無資訊`);
      } else {
        makeNotify(`公車資訊\n243公車還有 ${count} 分鐘抵達文化里`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

let totalQuery = "";
for (let i = 0; i < stockList.tracks.length; i++) {
  const element = stockList.tracks[i];
  totalQuery += element.stockId;
  totalQuery += "：";
  totalQuery += element.tracePrice.join(",");
  if (i !== stockList.tracks.length - 1) {
    totalQuery += "\n";
  }
}
// getWeatherInfo();
// getBusInfo();
// makeNotify(`台股目前追蹤\n${totalQuery}`);

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
    axios.get("http://localhost:5000/tracks").then((res) => {
      console.log(res.data);
      const list = res.data;
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        getStockInfo(element.stockId, element.tracePrice);
      }
    });
  }
}, 5000);

setInterval(() => {
  const timeNow = dayjs().format("HH:mm");
  if (timeNow === "08:20" || timeNow === "08:25") {
    axios.get("http://localhost:5000/weather").then((result) => {
      const list = result.data;
      getBusInfo(list[0].routeId, list[0].stopId);
    });
  }
  if (timeNow === "08:05") {
    axios.get("http://localhost:5000/weather").then((result) => {
      const list = result.data;
      getWeatherInfo(list[0].locationId, list[0].locationName);
    });
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
app.use("/stock", stockRouter);

app.use("/tracks", tracksRouter);

app.use("/weather", weatherRouter);

app.get("/bus", (req, res) => {
  axios.get("http://localhost:5000/bus").then((result) => {
    const list = result.data;
    res.render("bus", {
      title: "Bus page",
      routeId: list[0].routeId,
      stopId: list[0].stopId,
      form_action: "/bus/edit",
    });
  });
});
//notify now
app.get("/bus/:routeId/:stopId", (req, res) => {
  getBusInfo(+req.params.routeId, +req.params.stopId);
  res.redirect("/bus");
});

//  edit
app.post("/bus/edit", urlencodedParser, function (req, res) {
  const payload = {
    routeId: +req.body.routeId,
    stopId: +req.body.stopId,
  };
  axios
    .patch(`http://localhost:5000/bus/1`, payload)
    .then((result) => {
      res.redirect("/bus");
    })
    .catch((error) => {
      console.error(error);
    });
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
//status example
// res.status(200).json({
//   message: "Edit Success!",
//   data: result.data,
// });
app.use("/push", pushMsg);
app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
