require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/push", require("./routes/pushRoutes"));

app.listen(5000, () => {
  console.log("Server running");
});

const webPush = require("web-push");

webPush.setVapidDetails(
  "mailto:your-email@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const cron = require("node-cron");
const Task = require("./models/Task");
const PushSubscription = require("./models/PushSubscription");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const in30Minutes = new Date(now.getTime() + 30 * 60000);

  const tasks = await Task.find({
    dueDate: { $lte: in30Minutes, $gte: now },
    status: { $ne: "completed" },
  });

  for (let task of tasks) {
    const subscriptions = await PushSubscription.find({
      user: task.user,
    });

    for (let sub of subscriptions) {
      await webPush.sendNotification(
        sub.subscription,
        JSON.stringify({
          title: "Task Reminder ⏰",
          body: `Your task "${task.title}" is due in 30 minutes!`,
        })
      );
    }
  }
});