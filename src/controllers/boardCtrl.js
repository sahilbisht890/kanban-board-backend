const Board = require("../models/board.model")
const mongoose = require("mongoose");

exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const board = new Board({
      name,
      owner: userId,
    });

    await board.save();
    res.status(200).json({ message: "Board created successfully", data : board });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getBoards = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const boards = await Board.aggregate([
        {
          $match: { owner: userId },
        },
        {
          $lookup: {
            from: "tasks", 
            localField: "tasks",
            foreignField: "_id",
            as: "tasks", 
          },
        },
        {
          $sort: { updatedAt: -1 }, 
        },
        {
          $project: {
            name: 1, 
            totalTasks: { $size: "$tasks" }, 
            todoTasks: {
              $size: {
                $filter: {
                  input: "$tasks",
                  as: "task",
                  cond: { $eq: ["$$task.status", "to-do"] },
                },
              },
            },
            inProgressTasks: {
              $size: {
                $filter: {
                  input: "$tasks",
                  as: "task",
                  cond: { $eq: ["$$task.status", "in-progress"] }, 
                },
              },
            },
            doneTasks: {
              $size: {
                $filter: {
                  input: "$tasks",
                  as: "task",
                  cond: { $eq: ["$$task.status", "done"] }, 
                },
              },
            },
          },
        },
      ]);
  
      res.status(200).json({message : "Board list successfully fetched", data : boards});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  