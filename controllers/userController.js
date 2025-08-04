const User = require("../models/User");

// Manual subscription endpoint for frontend-only Razorpay test/demo
const manualSubscribe = async (req, res) => {
  try {
    console.log("manualSubscribe");
    const userId = req.user.id;
    const { plan, paymentId, subscribedAt, expiry } = req.body;
    // Update user subscription fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "subscription.isSubscribed": true,
        "subscription.subscriptionCost": plan === "year" ? 249 : 24.9,
        "subscription.subscriptionDate": subscribedAt,
        "subscription.subscriptionExpiry": expiry,
        "subscription.subscriptionType": plan === "year" ? "yearly" : "monthly",
        "subscription.paymentId": paymentId,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Subscription saved to database.",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          subscription: updatedUser.subscription,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save subscription.",
    });
  }
};

module.exports = {
  manualSubscribe,
};
