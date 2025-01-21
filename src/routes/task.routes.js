const express = require("express");
const verifyJWT = require('../middleware/auth.middleware')
const {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTasksByBoard
} = require("../controllers/taskCtrl");

const router = express.Router();

router.post("/create",verifyJWT, createTask);
router.put("/update",verifyJWT, updateTask);
router.delete("/delete",verifyJWT, deleteTask);
router.get("/list",verifyJWT, getTasksByBoard);

module.exports = router;
