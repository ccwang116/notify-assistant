const axios = require("axios");

async function get() {
  const result = await axios.get("http://localhost:5000/weather");
  return { ...result };
}
async function edit(body) {
  const payload = {
    locationId: body.locationId,
    locationName: body.currentLocation,
  };
  const result = await axios.patch(`http://localhost:5000/weather/1`, payload);
  return { ...result };
}

module.exports = {
  get,
  edit,
};
