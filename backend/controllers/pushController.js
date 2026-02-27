// const PushSubscription = require("../models/PushSubscription");

// exports.subscribe = async (req, res) => {
//   try {
//     const subscription = req.body;

//     await PushSubscription.create({
//       user: req.user.id,
//       subscription,
//     });

//     res.status(201).json({ message: "Subscribed successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

const PushSubscription = require("../models/PushSubscription");

exports.subscribe = async (req, res) => {
  try {
    const subscription = req.body;

    // Check if subscription already exists for this endpoint
    const existing = await PushSubscription.findOne({
      "subscription.endpoint": subscription.endpoint,
    });

    if (existing) {
      return res.status(200).json({ message: "Already subscribed" });
    }

    await PushSubscription.create({
      user: req.user.id,
      subscription,
    });

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};