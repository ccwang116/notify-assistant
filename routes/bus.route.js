const express = require("express");
const router = express.Router();
const bus = require("../controllers/bus.controller");

router.get("/", bus.get);
//  edit
router.post("/edit", bus.edit);
//notify now
router.get("/:routeId/:stopId/:busName/:stopName", bus.notify);

module.exports = router;
