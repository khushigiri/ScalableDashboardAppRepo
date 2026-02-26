const PushSubscription = require("../models/PushSubscription");

exports.subscribe = async (req, res) => {
  try {
    const subscription = req.body;

    await PushSubscription.create({
      user: req.user.id,
      subscription,
    });

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};