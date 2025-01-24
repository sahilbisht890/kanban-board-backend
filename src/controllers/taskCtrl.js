const Task = require("../models/task.model");
const Board = require("../models/board.model");
const mongoose = require("mongoose");


exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status , boardId } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      board: boardId,
    });

    await task.save();

    await Board.findByIdAndUpdate(boardId, { $push: { tasks: task._id } });

    res.status(200).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const  taskId  = req.query.taskId;
    console.log('taskId' , taskId);
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId  = req.query.taskId;

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Board.findByIdAndUpdate(task.board, { $pull: { tasks: task._id } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.getTasksByBoard = async (req, res) => {
  try {
    const boardId  = req.query.boardId; 

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: "Invalid board ID" });
    }

    const tasks = await Task.find({ board: boardId }).select("-__v").sort({updatedAt : -1});

    res.status(200).json({ message: "Task list successfully fetched", data: tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

