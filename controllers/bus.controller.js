const axios = require("axios");
const dayjs = require("dayjs");

const { makeNotify, reply } = require("./notify.controller");
const bus = require("../services/bus.service");

const getBusInfo = (routeId, stopId,busName="指定號碼",stopName="指定的站") => {
  axios
    .get(
      `https://pda.5284.gov.taipei/MQS/RouteDyna?routeid=${routeId}&nocache=${dayjs().valueOf()}`,
    )
    .then((response) => {
      const stop = response.data.Stop.find((ele) => ele.id === stopId);
      const infoList = stop.n1.split(",");
      const count = Math.floor(infoList[7] / 60);
      if (count === -1) {
        makeNotify(`${busName}公車${stopName}無資訊`);
      } else {
        makeNotify(`公車資訊\n${busName}公車還有 ${count} 分鐘抵達${stopName}`);
      }
      return { status: response.status, message: "OK" };
    })
    .catch((error) => {
      console.error(error);
      return { status: error.status, message: error };
    });
};
const getBusInfoReply = (replyToken, routeId, stopId) => {
  axios
    .get(
      `https://pda.5284.gov.taipei/MQS/RouteDyna?routeid=${routeId}&nocache=${dayjs().valueOf()}`,
    )
    .then((response) => {
      const stop = response.data.Stop.find((ele) => ele.id === stopId);
      const infoList = stop.n1.split(",");
      const count = Math.floor(infoList[7] / 60);
      if (count === -1) {
        reply(replyToken, `227公車台北橋站無資訊`);
      } else {
        reply(replyToken, `公車資訊\n227公車往永和方向還有 ${count} 分鐘抵達台北橋站`);
      }
      return { status: response.status, message: "OK" };
    })
    .catch((error) => {
      console.error(error);
      return { status: error.status, message: error };
    });
};
async function get(req, res, next) {
  try {
    const result = await bus.get();
    const list = result.data;
    res.render("bus", {
      title: "Bus page",
      routeId: list[0].routeId,
      stopId: list[0].stopId,
      form_action: "/bus/edit",
    });
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function edit(req, res, next) {
  try {
    const result = await bus.edit(req.body);
    res.redirect("/bus");
  } catch (err) {
    console.error(`Error`, err);
    next(err);
  }
}
async function notify(req, res, next) {
  try {
    getBusInfo(+req.params.routeId, +req.params.stopId,req.params.busName,req.params.stopName);
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
  getBusInfoReply,
};
