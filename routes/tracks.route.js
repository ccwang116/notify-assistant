const express = require("express");
const router = express.Router();
const tracks = require("../controllers/tracks.controller");
const { requireEditable } = require("../utils/db.util");

router.use(requireEditable);

/* POST create a track */
router.post("/", tracks.create);

/* DELETE a track */
router.get("/:id/delete", tracks.remove);

//  delete a price of a stock
router.get("/:id/delete/:price/:priceList", tracks.deletePrice);

//  add a price of a stock
router.post("/:id/edit/:priceList", tracks.addPrice);

module.exports = router;
