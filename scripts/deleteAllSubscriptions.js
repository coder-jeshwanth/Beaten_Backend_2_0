const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const deleteAllSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://sunandvemavarapu:NnqszrAB584zCkY9@beaten1.vknkzsa.mongodb.net/?retryWrites=true&w=majority&appName=beaten1");
    console.log("Connected to MongoDB");

    // Find all users with active subscriptions
    const usersWithSubscriptions = await User.find({
      "subscription.isSubscribed": true,
    });

    console.log(
      `Found ${usersWithSubscriptions.length} users with active subscriptions`
    );

    if (usersWithSubscriptions.length === 0) {
      console.log("No users with active subscriptions found");
      process.exit(0);
    }

    // Display users that will have their subscriptions removed
    console.log("\nUsers with active subscriptions:");
    usersWithSubscriptions.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - ${
          user.subscription.subscriptionType
        } subscription`
      );
    });

    // Ask for confirmation
    console.log(
      "\n⚠️  WARNING: This will remove ALL active subscriptions from ALL users!"
    );
    console.log("This action cannot be undone.");

    // For safety, we'll require manual confirmation by uncommenting the line below
    // Uncomment the next line if you want to actually run the deletion
    // const confirmed = true; // Set to true to confirm deletion

    const confirmed = true; // Set to false for safety (change to true to run)

    if (!confirmed) {
      console.log("\n❌ Deletion cancelled for safety. To proceed:");
      console.log("1. Open this script file");
      console.log(
        "2. Change 'const confirmed = false;' to 'const confirmed = true;'"
      );
      console.log("3. Run the script again");
      process.exit(0);
    }

    // Reset all subscription fields to default values
    const updateResult = await User.updateMany(
      { "subscription.isSubscribed": true },
      {
        $set: {
          "subscription.isSubscribed": false,
          "subscription.subscriptionCost": 0,
          "subscription.subscriptionDate": null,
          "subscription.subscriptionExpiry": null,
          "subscription.subscriptionType": "",
          "subscription.discountsUsed": 0,
          "subscription.lastDiscountUsed": null,
        },
      }
    );

    console.log(
      `\n✅ Successfully removed subscriptions from ${updateResult.modifiedCount} users`
    );

    // Verify the changes
    const remainingSubscriptions = await User.find({
      "subscription.isSubscribed": true,
    });

    console.log(
      `\nVerification: ${remainingSubscriptions.length} users still have active subscriptions`
    );

    if (remainingSubscriptions.length === 0) {
      console.log("✅ All subscriptions have been successfully removed!");
    } else {
      console.log(
        "⚠️  Some subscriptions may still exist. Check the database manually."
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error deleting subscriptions:", error);
    process.exit(1);
  }
};

deleteAllSubscriptions();
