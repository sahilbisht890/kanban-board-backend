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
router.delete("/:taskId",verifyJWT, deleteTask);
router.put("/status/:taskId",verifyJWT, updateTaskStatus);
router.get("/tasks/:board_id",verifyJWT, getTasksByBoard);

module.exports = router;
