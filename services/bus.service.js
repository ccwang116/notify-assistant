const axios = require("axios");

async function get() {
  const result = await axios.get("http://localhost:5000/bus");
  return { ...result };
}
async function edit(body) {
  const payload = {
    routeId: +body.routeId,
    stopId: +body.stopId,
  };
  const result = await axios.patch(`http://localhost:5000/bus/1`, payload);
  return { ...result };
}

module.exports = {
  get,
  edit,
};
