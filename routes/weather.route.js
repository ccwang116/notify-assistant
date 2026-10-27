const express = require("express");
const router = express.Router();
const weather = require("../controllers/weather.controller");
const { requireEditable } = require("../utils/db.util");

router.get("/", weather.get);
//  edit
router.post("/edit", requireEditable, weather.edit);
//notify now
router.get("/:locationId/:locationName", weather.notify);

module.exports = router;
