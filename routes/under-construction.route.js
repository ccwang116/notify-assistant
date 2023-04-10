const express = require("express");
const router = express.Router();
const mockData = require("../db.json");

router.get("/", (req, res) => {
  const baseUrl = req.baseUrl;
  let list = {};
  switch (baseUrl) {
    case "/weather":
      list = mockData.weather;
      res.render("weather", {
        title: "Weather page",
        locationId: list[0].locationId,
        currentLocation: list[0].locationName,
        form_action: "/weather/edit",
      });
      break;
    case "/stock":
      list = mockData.tracks;
      res.render("stock", {
        initialValue: { stockId: "", tracePrice: "" },
        title: "Stock Tracker",
        results: list,
        form_action: "/tracks",
      });
      break;
    case "/bus":
      list = mockData.bus;
      res.render("bus", {
        title: "Bus page",
        routeId: list[0].routeId,
        stopId: list[0].stopId,
        form_action: "/bus/edit",
      });
      break;

    default:
      break;
  }
});

module.exports = router;
