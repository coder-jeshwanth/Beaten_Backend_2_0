const User = require("../models/User");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
// // Create subscription order
// const createSubscription = async (req, res) => {
//   try {
//     const { plan } = req.body;
//     const userId = req.user.id;
//     // Check if user already has an active subscription
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.subscription.isSubscribed && user.subscription.subscriptionExpiry > new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "You already have an active premium subscription",
//       });
//     }

//     // Set subscription amount based on plan
//     const amount = plan === "year" ? 24900 : 2490; // Amount in paise (₹249 for yearly, ₹24.90 for monthly)
//     const subscriptionCost = plan === "year" ? 249 : 24.90;

//     // Create Razorpay order
//     const options = {
//       amount: amount,
//       currency: "INR",
//       receipt: `premium_${userId}_${Date.now()}`,
//       notes: {
//         userId: userId,
//         plan: plan,
//         subscriptionCost: subscriptionCost,
//       },
//     };

//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       success: true,
//       data: {
//         orderId: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         subscriptionCost: subscriptionCost,
//       },
//     });
//   } catch (error) {
//     console.error("Create subscription error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create subscription order",
//     });
//   }
// };

// // Verify payment and activate subscription
// const verifyPayment = async (req, res) => {
//   try {
//     const { orderId, paymentId, signature } = req.body;
//     const userId = req.user.id;

//     // Verify payment signature
//     const text = orderId + "|" + paymentId;
//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(text)
//       .digest("hex");

//     if (generated_signature !== signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature",
//       });
//     }

//     // Get order details from Razorpay
//     const order = await razorpay.orders.fetch(orderId);
//     const plan = order.notes.plan;
//     const subscriptionCost = order.notes.subscriptionCost;

//     // Calculate subscription expiry
//     const subscriptionDate = new Date();
//     const subscriptionExpiry = new Date();
//     if (plan === "year") {
//       subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);
//     } else {
//       subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);
//     }

//     // Update user subscription
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         "subscription.isSubscribed": true,
//         "subscription.subscriptionCost": subscriptionCost,
//         "subscription.subscriptionDate": subscriptionDate,
//         "subscription.subscriptionExpiry": subscriptionExpiry,
//         "subscription.subscriptionType": plan === "year" ? "yearly" : "monthly",
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Premium subscription activated successfully",
//       data: {
//         user: {
//           id: updatedUser._id,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           subscription: updatedUser.subscription,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to verify payment",
//     });
//   }
// };

// // Get subscription status
// const getSubscriptionStatus = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Check if subscription is still valid
//     const isActive = user.subscription.isSubscribed &&
//                     user.subscription.subscriptionExpiry > new Date();

//     res.status(200).json({
//       success: true,
//       data: {
//         subscription: {
//           isSubscribed: isActive,
//           subscriptionCost: user.subscription.subscriptionCost,
//           subscriptionDate: user.subscription.subscriptionDate,
//           subscriptionExpiry: user.subscription.subscriptionExpiry,
//           subscriptionType: user.subscription.subscriptionType,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Get subscription status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get subscription status",
//     });
//   }
// };

// // Cancel subscription
// const cancelSubscription = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.subscription.isSubscribed) {
//       return res.status(400).json({
//         success: false,
//         message: "No active subscription found",
//       });
//     }

//     // Update subscription status
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         "subscription.isSubscribed": false,
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Subscription cancelled successfully",
//       data: {
//         user: {
//           id: updatedUser._id,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           subscription: updatedUser.subscription,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Cancel subscription error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to cancel subscription",
//     });
//   }
// };

module.exports = {
  //   createSubscription,
  //   verifyPayment,
  //   getSubscriptionStatus,
  //   cancelSubscription,
};
