const express = require("express");
const router = express.Router();
const mockData = require("../db.json");
const { getWeatherInfo } = require("../controllers/weather.controller");
const { getStockInfo } = require("../controllers/tracks.controller");

router.get("/", (req, res, next) => {
  res.send("OK");
});
router.get("/weather", async (req, res, next) => {
  const list = mockData.weather;
  const result = await getWeatherInfo(list[0].locationId, list[0].locationName);
  if (result.status === 200) {
    res.status(200).json({
      message: "Send Success!",
      data: list,
    });
    console.log(result);
  } else {
    res.status(result.status).json({
      message: result.message,
      data: list,
    });
  }
});
router.get("/stock", async (req, res, next) => {
  const list = mockData.tracks;
  let recordList = [];
  console.log(list);
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    const result = await getStockInfo(element.stockId, element.tracePrice);
    recordList.push(result);
  }
  console.log(recordList.map((e) => e.message));
  if (recordList.every((e) => e.status === 200)) {
    res.status(200).json({
      message: "Fetch Success!",
      data: list,
    });
  } else {
    res.status(400).json({
      message: "Something went wrong",
      data: recordList,
    });
  }
});

module.exports = router;
