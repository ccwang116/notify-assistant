const express = require("express");
const router = express.Router();
const bus = require("../controllers/bus.controller");
const { requireEditable } = require("../utils/db.util");

router.get("/", bus.get);
//  edit
router.post("/edit", requireEditable, bus.edit);
//notify now
router.get("/:routeId/:stopId/:busName?/:stopName?", bus.notify);

module.exports = router;
