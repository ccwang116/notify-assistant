const tracks = require("../services/tracks.service");
const axios = require("axios");

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
    const result = await tracks.create(req.body);
    if (result.status === 201) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while creating`, err);
    next(err);
  }
}

async function deletePrice(req, res, next) {
  try {
    const result = await tracks.deletePrice(
      req.params.priceList,
      req.params.price,
      req.params.id
    );
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
