const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },

    // Premium subscription fields
    subscription: {
      isSubscribed: {
        type: Boolean,
        default: false,
      },
      subscriptionCost: {
        type: Number,
        default: 0,
      },
      subscriptionDate: {
        type: Date,
        default: null,
      },
      subscriptionExpiry: {
        type: Date,
        default: null,
      },
      subscriptionType: {
        type: String,
        enum: ["yearly", "monthly", ""],
        default: "",
      },
      discountsUsed: {
        type: Number,
        default: 0,
      },
      lastDiscountUsed: {
        type: Date,
        default: null,
      },
    },
    addressBook: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    returns: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        reason: { type: String, required: true },

        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "return_rejected"],
          default: "pending",
        },
        rejectionReason: { type: String, default: "" },
        date: { type: Date, default: Date.now },
        received: { type: Boolean, default: false },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
