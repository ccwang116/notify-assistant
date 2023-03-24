// const db = require('./db.service');
// const helper = require('../utils/helper.util');
// const config = require('../configs/general.config');
const axios = require("axios");

async function get() {
  const result = await axios.get(`http://localhost:5000/tracks`);
  return { ...result };
}
async function create(body) {
  const payload = {
    stockId: body.stockId,
    tracePrice: [+body.tracePrice],
  };
  const result = await axios.post(`http://localhost:5000/tracks`, payload);
  return { ...result };
}

async function deletePrice(list, price, id) {
  let priceList = list.split("_");
  const payload = {
    tracePrice: priceList.filter((e) => e !== price).map((e) => +e),
  };
  const result = await axios.patch(
    `http://localhost:5000/tracks/${id}`,
    payload
  );
  return { ...result };
}
async function addPrice(list, price, id) {
  let priceList = list.split("_");
  priceList.push(price);
  const payload = { tracePrice: priceList.map((e) => +e) };
  const result = await axios.patch(
    `http://localhost:5000/tracks/${id}`,
    payload
  );
  return { ...result };
}

async function remove(id) {
  const result = await axios.delete(`http://localhost:5000/tracks/${id}`);
  return { ...result };
}

module.exports = {
  get,
  create,
  remove,
  deletePrice,
  addPrice,
};
