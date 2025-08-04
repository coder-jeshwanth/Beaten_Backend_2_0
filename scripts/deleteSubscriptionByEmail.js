const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const deleteSubscriptionByEmail = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    if (!email) {
      console.error(
        "❌ Email is required. Usage: node deleteSubscriptionByEmail.js <email>"
      );
      process.exit(1);
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (!user.subscription || !user.subscription.isSubscribed) {
      console.log(
        `❌ User ${user.name} (${email}) does not have an active subscription`
      );
      process.exit(1);
    }

    console.log(`\nFound user: ${user.name} (${email})`);
    console.log(
      `Current subscription: ${user.subscription.subscriptionType} - expires ${user.subscription.subscriptionExpiry}`
    );

    // Ask for confirmation
    console.log(
      "\n⚠️  WARNING: This will remove the subscription for this user!"
    );
    console.log("This action cannot be undone.");

    // For safety, we'll require manual confirmation
    const confirmed = false; // Set to true to confirm deletion

    if (!confirmed) {
      console.log("\n❌ Deletion cancelled for safety. To proceed:");
      console.log("1. Open this script file");
      console.log(
        "2. Change 'const confirmed = false;' to 'const confirmed = true;'"
      );
      console.log(
        "3. Run the script again with: node deleteSubscriptionByEmail.js <email>"
      );
      process.exit(0);
    }

    // Reset subscription fields to default values
    user.subscription = {
      isSubscribed: false,
      subscriptionCost: 0,
      subscriptionDate: null,
      subscriptionExpiry: null,
      subscriptionType: "",
      discountsUsed: 0,
      lastDiscountUsed: null,
    };

    await user.save();

    console.log(
      `\n✅ Successfully removed subscription from ${user.name} (${email})`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error deleting subscription:", error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
deleteSubscriptionByEmail(email);
