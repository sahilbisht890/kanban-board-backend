const express = require("express");
const verifyJWT = require('../middleware/auth.middleware')
const { createBoard, getBoards } = require("../controllers/boardCtrl");
const router = express.Router();

router.post("/create", verifyJWT, createBoard);
router.get("/", verifyJWT, getBoards);

module.exports = router;
