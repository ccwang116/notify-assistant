const express = require("express");
const router = express.Router();
const tracks = require("../controllers/tracks.controller");

/* GET */
router.get("/", tracks.get);

module.exports = router;
