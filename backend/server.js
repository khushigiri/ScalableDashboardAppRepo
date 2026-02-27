require("dotenv").config();

const express = require("express");
const cors = require("cors");
const webPush = require("web-push");
const cron = require("node-cron");

const connectDB = require("./config/db");
const Task = require("./models/Task");
const PushSubscription = require("./models/PushSubscription");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/push", require("./routes/pushRoutes"));

webPush.setVapidDetails(
  "mailto:your-email@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running");
    });

    startCron(); // start cron after DB
  } catch (error) {
    console.error(error);
  }
};

const startCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Cron running...");

    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60000);

    const tasks = await Task.find({
      dueDate: { $lte: in30Minutes, $gte: now },
      status: { $ne: "completed" },
      reminderSent: false,
    });

    console.log("Tasks found:", tasks.length);

    for (let task of tasks) {
      const subscriptions = await PushSubscription.find({
        user: task.user,
      });

      for (let sub of subscriptions) {
        try {
          await webPush.sendNotification(
            sub.subscription,
            JSON.stringify({
              title: "Task Reminder ⏰",
              body: `Your task "${task.title}" is due in 30 minutes!`,
            })
          );
        } catch (error) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error("Push error:", error);
          }
        }
      }

      await Task.updateOne(
        { _id: task._id },
        { $set: { reminderSent: true } }
      );
    }
  });
};

startServer();