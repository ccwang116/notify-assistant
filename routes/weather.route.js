const express = require("express");
const router = express.Router();
const weather = require("../controllers/weather.controller");

router.get("/", weather.get);
//  edit
router.post("/edit", weather.edit);
//notify now
router.get("/:locationId/:locationName", weather.notify);

module.exports = router;
