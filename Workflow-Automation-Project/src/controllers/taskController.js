import Task from "../models/taskModel.js";

// =============================
//  CREATE A TASK
// =============================
export const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };
    const task = await Task.create(taskData);
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  VIEW TASKS (For User)
// =============================
export const viewTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  UPDATE TASK STATE
// =============================
export const updateTaskState = async (req, res) => {
  try {
    const { id } = req.params;   //Sends req param
    const { state } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.state = state;
    await task.save();

    res.status(200).json({ success: true, message: "✅ Task state updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  GET ALL TASKS (Admin Only)
// =============================
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  DELETE A TASK (Admin Only)
// =============================
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.status(200).json({ success: true, message: "🗑 Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  TASK SUMMARY REPORT
// =============================
export const getTaskSummary = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const pending = await Task.countDocuments({ state: "Pending" });
    const inProgress = await Task.countDocuments({ state: "In Progress" });
    const completed = await Task.countDocuments({ state: "Completed" });

    res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        inProgress,
        completed,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) + "%" : "0%",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
//  USER-WISE TASK STATS (Bonus)
// =============================
export const getUserTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          totalTasks: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$state", "Completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$state", "Pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$state", "In Progress"] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

