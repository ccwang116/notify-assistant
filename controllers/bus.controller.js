const axios = require("axios");
const dayjs = require("dayjs");

const makeNotify = require("./notify.controller");
const bus = require("../services/bus.service");

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
async function get(req, res, next) {
  try {
    const result = await bus.get();
    if (result.status === 200) {
      const list = result.data;
      res.render("bus", {
        title: "Bus page",
        routeId: list[0].routeId,
        stopId: list[0].stopId,
        form_action: "/bus/edit",
      });
    }
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function edit(req, res, next) {
  try {
    const result = await bus.edit(req.body);
    if (result.status === 200) {
      res.redirect("/bus");
    }
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function notify(req, res, next) {
  try {
    getBusInfo(+req.params.routeId, +req.params.stopId);
    res.redirect("/bus");
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}

module.exports = {
  get,
  edit,
  notify,
  getBusInfo,
};
