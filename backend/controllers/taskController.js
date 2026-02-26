

const Task = require("../models/Task");


exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || !priority) {
      return res.status(400).json({ message: "Title and priority required" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      user: req.user.id,
    });


    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//Update Tasks
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { title, description, status, priority, dueDate } = req.body;

    // 🔥 Do NOT validate title/priority here
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};





