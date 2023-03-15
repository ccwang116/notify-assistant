require("dotenv").config();
const dayjs = require("dayjs");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const port = 5001;

const stockList = require("./db.json");
const stickerMap = require("./weather-sticker.json");

const lineNotifyRouter = require("./routes/line-notify");
const pushMsg = require("./routes/push-msg");
const makeNotify = require("./routes/make-notify");

// create application/json parser
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

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

const getBusInfo = () => {
  axios
    .get(
      `https://pda.5284.gov.taipei/MQS/RouteDyna?routeid=10172&nocache=${dayjs().valueOf()}`
    )
    .then((response) => {
      const stop = response.data.Stop.find((ele) => ele.id === 34528);
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
const getWeatherInfo = () => {
  const getValue = (list, key) => {
    return list.find((e) => e.elementName === key).time[0].elementValue[0]
      .value;
  };
  axios
    .get(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-093?Authorization=${
        process.env["CWB_AUTHORIZATION"]
      }&locationId=F-D0047-071&locationName=永和區&startTime=${dayjs().format(
        "YYYY-MM-DDT12:00:00"
      )}`
    )
    .then((response) => {
      const locationName =
        response.data.records.locations[0].location[0].locationName;
      const contentList =
        response.data.records.locations[0].location[0].weatherElement;
      const PoP12h = getValue(contentList, "PoP12h");
      const MinT = getValue(contentList, "MinT");
      const MaxT = getValue(contentList, "MaxT");
      const description = getValue(contentList, "WeatherDescription");
      //makeNotify(`${locationName}天氣:\n${description}`);
      let stickerIdx = "0";
      if (+PoP12h >= 0 && +PoP12h < 31) {
        stickerIdx = "0";
      } else if (+PoP12h >= 31 && +PoP12h < 51) {
        stickerIdx = "10";
      } else if (+PoP12h >= 51 && +PoP12h < 81) {
        stickerIdx = "50";
      } else if (+PoP12h >= 81 && +PoP12h < 101) {
        stickerIdx = "80";
      }
      makeNotify(
        `${locationName}天氣:\n溫度${MinT}~${MaxT}度，降雨機率${PoP12h}%`,
        true,
        stickerMap[stickerIdx]
      );
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
    getBusInfo();
  }
  if (timeNow === "08:05") {
    getWeatherInfo();
  }
}, 60000);

app.get("/", (req, res) => {
  res.send("hello world!");
});
app.post("/tracks", jsonParser, (req, res) => {
  const payload = {
    stockId: req.body.stockId,
    tracePrice: [+req.body.tracePrice],
  };

  axios
    .post(`http://localhost:5000/tracks`, payload)
    .then((result) => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error(error);
    });
});
app.get("/tracks/:id/delete", function (req, res) {
  axios
    .delete(`http://localhost:5000/tracks/${req.params.id}`)
    .then((result) => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error(error);
    });
});
app.post("/tracks/:id/edit", jsonParser, function (req, res) {
  const payload = { tracePrice: [+req.body.tracePrice] };
  console.log(payload);
  axios
    .patch(`http://localhost:5000/tracks/${req.params.id}`, payload)
    .then((result) => {
      res.redirect("/");
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

app.use("/push", pushMsg);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
