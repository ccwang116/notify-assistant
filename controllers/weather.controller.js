const axios = require("axios");
const dayjs = require("dayjs");

const makeNotify = require("./notify.controller");
const stickerMap = require("../weather-sticker.json");
const weather = require("../services/weather.service");

const getWeatherInfo = (locationId, locationName) => {
  const getValue = (list, key) => {
    return list.find((e) => e.elementName === key)?.time[0]?.elementValue[0]
      .value;
  };
  const getValueOfThreeIdx = (list, key) => {
    return list.find((e) => e.elementName === key)?.time[3]?.elementValue[0]
      .value;
  };
  axios
    .get(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-093?Authorization=${
        process.env["CWB_AUTHORIZATION"]
      }&locationId=${locationId}&locationName=${locationName}&startTime=${dayjs().format(
        "YYYY-MM-DDT12:00:00"
      )}`
    )
    .then((response) => {
      const locationName =
        response.data.records.locations[0].location[0].locationName;
      const contentList =
        response.data.records.locations[0].location[0].weatherElement;
      const PoP12h = getValue(contentList, "PoP12h");
      const MinT = getValueOfThreeIdx(contentList, "T");
      const MaxT = getValue(contentList, "T");
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

async function get(req, res, next) {
  try {
    const result = await weather.get();
    if (result.status === 200) {
      const list = result.data;
      res.render("weather", {
        title: "Weather page",
        locationId: list[0].locationId,
        currentLocation: list[0].locationName,
        form_action: "/weather/edit",
      });
    }
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function edit(req, res, next) {
  try {
    const result = await weather.edit(req.body);
    if (result.status === 200) {
      res.redirect("/weather");
    }
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function notify(req, res, next) {
  try {
    getWeatherInfo(req.params.locationId, req.params.locationName);
    res.redirect("/weather");
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}

module.exports = {
  get,
  edit,
  notify,
  getWeatherInfo,
};
