const Task = require("../models/task.model");
const Board = require("../models/board.model");
const mongoose = require("mongoose");
const { uploadTaskAttachments } = require("../helpers/cloudinary");


exports.createTask = async (req, res) => {
  try {
    const { title, description, link, dueDate, priority, status, boardId, attachments } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: "title and boardId are required" });
    }

    const uploadedAttachments = await uploadTaskAttachments(attachments);

    const task = new Task({
      title,
      description,
      link,
      attachments: uploadedAttachments,
      dueDate,
      priority,
      status,
      board: boardId,
    });

    await task.save();

    await Board.findByIdAndUpdate(boardId, { $push: { tasks: task._id } });

    res.status(200).json({ message: "Task created successfully", task });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const  taskId  = req.query.taskId;
    const updates = { ...req.body };

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (updates.attachments) {
      const uploadedAttachments = await uploadTaskAttachments(updates.attachments);
      task.attachments = [...(task.attachments || []), ...uploadedAttachments];
      delete updates.attachments;
    }

    if (updates.clearAttachments === true) {
      task.attachments = [];
      delete updates.clearAttachments;
    }

    Object.assign(task, updates);
    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
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

