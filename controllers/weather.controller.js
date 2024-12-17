const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const makeNotify = require("./notify.controller");
const stickerMap = require("../weather-sticker.json");
const weather = require("../services/weather.service");
dayjs.extend(utc);
dayjs.extend(timezone);

const getWeatherInfo = async (locationId, locationName) => {
  const getValue = (list, key, valueKey) => {
    return list.find((e) => e.ElementName === key)?.Time[0]?.ElementValue[0][
      valueKey
    ];
  };
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-093?Authorization=${
    process.env["CWB_AUTHORIZATION"]
  }&locationId=${locationId}&LocationName=${locationName}&startTime=${dayjs()
    .tz("Asia/Taipei")
    .format("YYYY-MM-DDT06:00:00")}`;
  try {
    const response = await axios.get(url);
    const success = response.data.success;
    if (success !== "true") {
      await makeNotify(
        `No weather data, ${response.status + "," + response.message}`
      );
      return { status: response.status, message: response.message };
    }
    const locationName =
      response.data.records.Locations[0].Location[0].LocationName;
    const contentList =
      response.data.records.Locations[0].Location[0].WeatherElement;
    const PoP12h = getValue(
      contentList,
      "12小時降雨機率",
      "ProbabilityOfPrecipitation"
    );
    const MinT =
      getValue(contentList, "最低溫度", "MinTemperature") ||
      getValue(contentList, "平均溫度", "Temperature");
    const MaxT =
      getValue(contentList, "最高溫度", "MaxTemperature") ||
      getValue(contentList, "平均溫度", "Temperature");
    const description = getValue(contentList, "WeatherDescription", "");
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
    await makeNotify(
      `${locationName}天氣:\n溫度${MinT}~${MaxT}度，降雨機率${PoP12h}%`,
      true,
      stickerMap[stickerIdx]
    );
    return { status: response.status, message: contentList };
  } catch (error) {
    console.error(error);
    await makeNotify(`天氣error, ${error.status},${error.message}`);
    return { status: error.status, message: error };
  }
};

async function get(req, res, next) {
  try {
    const result = await weather.get();
    const list = result.data;
    res.render("weather", {
      title: "Weather page",
      locationId: list[0].locationId,
      currentLocation: list[0].locationName,
      form_action: "/weather/edit",
    });
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function edit(req, res, next) {
  try {
    await weather.edit(req.body);
    res.redirect("/weather");
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
