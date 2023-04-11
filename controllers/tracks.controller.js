const dayjs = require("dayjs");
const tracks = require("../services/tracks.service");
const axios = require("axios");
const makeNotify = require("./notify.controller");

async function get(req, res, next) {
  try {
    const result = await tracks.get();
    if (result.status === 200) {
      const list = result.data;
      res.render("stock", {
        initialValue: { stockId: "", tracePrice: "" },
        title: "Stock Tracker",
        results: list,
        form_action: "/tracks",
      });
    }
  } catch (err) {
    console.error(`Error while creating`, err);
    next(err);
  }
}
async function create(req, res, next) {
  try {
    let result = {};
    const total = await tracks.get();
    const list = total.data;
    //如追蹤股票已存在，則改為增加價格
    if (list.some((e) => e.stockId === req.body.stockId)) {
      const theStock = list.find((e) => e.stockId === req.body.stockId);
      result = await tracks.addPrice(
        theStock.tracePrice.join("_"),
        req.body.tracePrice,
        theStock.id
      );
    } else {
      result = await tracks.create(req.body);
    }
    if (result.status === 201 || result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while creating`, err);
    next(err);
  }
}

async function deletePrice(req, res, next) {
  let priceList = req.params.priceList.split("_");
  try {
    let result = {};
    //如股票已剩下一個價格，則移除該追蹤單
    if (priceList.length === 1) {
      result = await tracks.remove(req.params.id);
    } else {
      result = await tracks.deletePrice(
        req.params.priceList,
        req.params.price,
        req.params.id
      );
    }
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while deletePrice`, err.message);
    next(err);
  }
}
async function addPrice(req, res, next) {
  try {
    const result = await tracks.addPrice(
      req.params.priceList,
      req.body.tracePrice,
      req.params.id
    );
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while addPrice`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await tracks.remove(req.params.id);
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while deleting `, err.message);
    next(err);
  }
}

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
const getStockInfo = async (stockId, tracePriceList) => {
  const response = await axios.get(
    `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockId}.tw&json=1&delay=0`
  );

  if (response.status === 200) {
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
    return { status: response.status, message: { stockName, price } };
  } else {
    console.error(response);
    return { status: response.status, message: response };
  }
};
const notifyTotal = (stockList) => {
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
  makeNotify(`台股目前追蹤\n${totalQuery}`);
};
module.exports = {
  get,
  create,
  deletePrice,
  addPrice,
  remove,
  getStockInfo,
  notifyTotal,
};
