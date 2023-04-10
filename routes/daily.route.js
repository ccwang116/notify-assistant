const express = require("express");
const router = express.Router();
const mockData = require("../db.json");
const { getWeatherInfo } = require("../controllers/weather.controller");
const { getStockInfo } = require("../controllers/tracks.controller");

router.get("/", (req, res, next) => {
  res.send("OK");
});
router.get("/weather", () => {
  const list = mockData.weather;
  getWeatherInfo(list[0].locationId, list[0].locationName);
});
router.get("/stock", () => {
  console.log("Wait for 5 second...");
  const list = mockData.tracks;
  console.log(list);
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    getStockInfo(element.stockId, element.tracePrice);
  }
});

module.exports = router;
