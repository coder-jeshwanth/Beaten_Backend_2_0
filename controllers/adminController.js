const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  sendSubscriptionReminderEmail,
  sendSubscriptionActivationEmail,
} = require("../utils/emailService");

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public (should be restricted in production)
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: "Admin registered successfully",
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          token: generateToken(admin._id, "admin"),
        },
      });
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid admin data",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await admin.updateLastLogin();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        token: generateToken(admin._id, "admin"),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin profile retrieved successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if email is being updated and if it already exists
    if (email && email !== req.admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(STATUS_CODES.CONFLICT).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        name: name || req.admin.name,
        email: email || req.admin.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin profile updated successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin only)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!admin) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private (Admin only)
const logout = async (req, res, next) => {
  try {
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics (admin)
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const dashboardAnalytics = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    // Total orders
    const totalOrders = await Order.countDocuments();
    // Total products
    const totalProducts = await Product.countDocuments();
    // Total revenue (only delivered orders)
    const orders = await Order.find();
    const totalRevenue = orders
      .filter((o) => (o.status || "").toLowerCase() === "delivered")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Subscription analytics
    const users = await User.find({}, "subscription");
    const now = new Date();
    const beatenClubMembers = users.filter(
      (user) =>
        user.subscription &&
        user.subscription.isSubscribed &&
        user.subscription.subscriptionExpiry &&
        new Date(user.subscription.subscriptionExpiry) > now
    ).length;

    const totalSavings = users.reduce((total, user) => {
      if (user.subscription && user.subscription.discountsUsed) {
        return total + user.subscription.discountsUsed * 249;
      }
      return total;
    }, 0);

    // Category distribution
    const categoryStats = await Product.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
    ]);
    // Recent activities (last 10 orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name");
    const recentActivities = recentOrders.map((order) => ({
      id: order._id,
      type: "order",
      message: `Order #${order._id.toString().slice(-6)} placed by ${
        order.user?.name || "Unknown"
      }`,
      time: order.createdAt,
      amount: order.totalPrice,
    }));
    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        beatenClub: beatenClubMembers,
        totalSavings: totalSavings,
        categoryStats,
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard analytics",
      error: error.message,
    });
  }
};

// @desc    Get real-time orders data
// @route   GET /api/admin/dashboard/orders/realtime
// @access  Private (Admin only)
const realTimeOrders = async (req, res) => {
  try {
    // Get orders by status for real-time updates
    const newOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({
      status: "processing",
    });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
    const totalOrders = await Order.countDocuments();

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({
      success: true,
      data: {
        newOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        totalOrders,
        todayOrders,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching real-time orders data",
      error: error.message,
    });
  }
};

// @desc    Get real-time sales data
// @route   GET /api/admin/dashboard/sales/realtime
// @access  Private (Admin only)
const realTimeSales = async (req, res) => {
  try {
    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
    });
    const todaySales = todayOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Calculate monthly sales
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = await Order.find({
      createdAt: { $gte: firstDayOfMonth },
      status: "delivered",
    });
    const monthlySales = monthlyOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Calculate total revenue
    const allDeliveredOrders = await Order.find({ status: "delivered" });
    const totalRevenue = allDeliveredOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Calculate GST (assuming 18% GST)
    const gst = totalRevenue * 0.18;
    const paid = totalRevenue - gst;

    res.json({
      success: true,
      data: {
        todaySales,
        monthlySales,
        totalRevenue,
        paid,
        gst,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching real-time sales data",
      error: error.message,
    });
  }
};

// @desc    Get subscription analytics (real-time)
// @route   GET /api/admin/dashboard/subscriptions
// @access  Private (Admin only)
const subscriptionAnalytics = async (req, res) => {
  try {
    // Get all users with subscription data
    const users = await User.find({}, "subscription");

    // Calculate Beaten Club members (active subscriptions)
    const now = new Date();
    const beatenClubMembers = users.filter(
      (user) =>
        user.subscription &&
        user.subscription.isSubscribed &&
        user.subscription.subscriptionExpiry &&
        new Date(user.subscription.subscriptionExpiry) > now
    ).length;

    // Calculate total savings from discounts used
    const totalSavings = users.reduce((total, user) => {
      if (user.subscription && user.subscription.discountsUsed) {
        // Each discount used is worth ₹249 (as per the subscription model)
        return total + user.subscription.discountsUsed * 249;
      }
      return total;
    }, 0);

    // Additional subscription statistics
    const totalSubscriptions = users.filter(
      (user) => user.subscription && user.subscription.isSubscribed
    ).length;

    const expiredSubscriptions = users.filter(
      (user) =>
        user.subscription &&
        user.subscription.isSubscribed &&
        user.subscription.subscriptionExpiry &&
        new Date(user.subscription.subscriptionExpiry) <= now
    ).length;

    const activeSubscriptions = beatenClubMembers; // Same as beatenClubMembers

    res.json({
      success: true,
      data: {
        beatenClub: beatenClubMembers,
        totalSavings: totalSavings,
        totalSubscriptions: totalSubscriptions,
        expiredSubscriptions: expiredSubscriptions,
        activeSubscriptions: activeSubscriptions,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscription analytics",
      error: error.message,
    });
  }
};

// @desc    Get all subscriptions (detailed list for admin table)
// @route   GET /api/admin/dashboard/subscription-list
// @access  Private (Admin only)
const getAllSubscriptions = async (req, res) => {
  try {
    const users = await User.find({}, "name email subscription");
    const subscriptions = users
      .filter(
        (user) =>
          user.subscription &&
          user.subscription.isSubscribed &&
          user.subscription.subscriptionExpiry
      )
      .map((user) => ({
        name: user.name,
        email: user.email,
        type: user.subscription.subscriptionType || "Premium",
        subscriptionEnd: user.subscription.subscriptionExpiry,
      }));
    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message,
    });
  }
};

// @desc    Get cached dashboard analytics
// @route   GET /api/admin/dashboard/cached
// @access  Private (Admin only)
const cachedAnalytics = async (req, res) => {
  try {
    // Return cached/static data for fallback
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        todaySales: 25840,
        monthlySales: 215780,
        paid: 190340,
        gst: 190340,
        newOrders: 12,
        processingOrders: 8,
        deliveredOrders: 172,
        cancelledOrders: 4,
        beatenClub: 250,
        totalSavings: 62350,
        categoryStats: [],
        recentActivities: [],
        isCached: true,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cached analytics",
      error: error.message,
    });
  }
};

// @desc    Send subscription reminder email to a user
// @route   POST /api/admin/dashboard/send-subscription-reminder
// @access  Private (Admin only)
const sendSubscriptionReminder = async (req, res) => {
  try {
    const { email, name, subscriptionEnd } = req.body;
    if (!email || !name || !subscriptionEnd) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    const result = await sendSubscriptionReminderEmail(
      email,
      name,
      subscriptionEnd
    );
    if (result) {
      res.json({ success: true, message: "Reminder email sent successfully." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to send reminder email." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send reminder email.",
    });
  }
};

// @desc    Add member to subscription by email
// @route   POST /api/admin/dashboard/add-member
// @access  Private (Admin only)
const addMemberToSubscription = async (req, res) => {
  try {
    const {
      email,
      subscriptionType = "yearly",
      subscriptionCost = 249,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate subscription cost
    if (subscriptionCost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Subscription cost must be greater than 0",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Check if user already has an active subscription
    if (user.subscription && user.subscription.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "User already has an active subscription",
      });
    }

    // Calculate subscription expiry date
    const now = new Date();
    const subscriptionDate = now;
    let subscriptionExpiry;

    if (subscriptionType === "yearly") {
      subscriptionExpiry = new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      );
    } else if (subscriptionType === "monthly") {
      subscriptionExpiry = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription type. Must be 'yearly' or 'monthly'",
      });
    }

    // Update user subscription
    user.subscription = {
      isSubscribed: true,
      subscriptionCost: subscriptionCost,
      subscriptionDate: subscriptionDate,
      subscriptionExpiry: subscriptionExpiry,
      subscriptionType: subscriptionType,
      discountsUsed: 0,
      lastDiscountUsed: null,
    };

    await user.save();

    // Send subscription activation email
    sendSubscriptionActivationEmail(
      user.email,
      user.name,
      subscriptionType,
      subscriptionExpiry,
      subscriptionCost
    ).catch(console.error); // Don't fail the request if email fails

    res.status(200).json({
      success: true,
      message: `Successfully added ${user.name} to ${subscriptionType} subscription`,
      data: {
        name: user.name,
        email: user.email,
        subscriptionType: subscriptionType,
        subscriptionExpiry: subscriptionExpiry,
        subscriptionCost: subscriptionCost,
      },
    });
  } catch (error) {
    console.error("Error adding member to subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error adding member to subscription",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  dashboardAnalytics,
  realTimeOrders,
  realTimeSales,
  subscriptionAnalytics,
  getAllSubscriptions,
  cachedAnalytics,
  sendSubscriptionReminder,
  addMemberToSubscription,
};
