const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { subscribe } = require("../controllers/pushController");

router.post("/subscribe", authMiddleware, subscribe);

module.exports = router;