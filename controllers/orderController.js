const Address = require("../models/Address");
const Order = require("../models/Order");
const User = require("../models/User");
const {getShiprocketToken,generateShiprocketPayload,createShiprocketOrder,cancelShiprocketOrder,assignAWB} = require("./ShipRocket")
const { STATUS_CODES } = require("../utils/constants");
const {
  sendOrderStatusEmail,
  sendOrderConfirmedEmail,
  sendAdminOrderNotification,
  sendAdminOrderStatusNotification,
} = require("../utils/emailService");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log("camed to here");
    console.log("req.body", req.body);
    const { orderItems, shippingAddress, paymentInfo, totalPrice, couponCode } =
      req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No order items",
      });
    }
    if (!shippingAddress) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Shipping address required",
      });
    }
    // Fetch user to check subscription
    const user = await require("../models/User").findById(req.user._id);
    let finalPrice = totalPrice;
    let appliedCoupon = null;
    let discountAmount = 0;
    let subscriptionDiscountAmount = 0;
    let subscriptionApplied = false;

    if (couponCode) {
      const Coupon = require("../models/Coupon");
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Invalid coupon code",
        });
      }
      const now = new Date();
      if (
        coupon.status !== "active" ||
        now < coupon.validFrom ||
        now > coupon.validUntil
      ) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Coupon is not valid at this time",
        });
      }
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Coupon usage limit reached",
        });
      }
      if (totalPrice < coupon.minPurchase) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: `Minimum purchase is $${coupon.minPurchase}`,
        });
      }
      // Calculate discount
      if (coupon.discountType === "flat") {
        discountAmount = coupon.discount;
      } else if (coupon.discountType === "percentage") {
        discountAmount = (totalPrice * coupon.discount) / 100;
      }
      finalPrice = Math.max(0, totalPrice - discountAmount);
      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discount: coupon.discount,
        discountAmount,
      };
      // Optionally, increment usedCount here or after payment confirmation
    }

    // Subscription discount (applied after coupon) - Fixed amount of 249
    if (
      user &&
      user.subscription &&
      user.subscription.isSubscribed &&
      user.subscription.subscriptionExpiry > new Date()
    ) {
      subscriptionDiscountAmount = 249; // Fixed discount amount
      finalPrice = Math.max(0, finalPrice - subscriptionDiscountAmount);
      subscriptionApplied = true;

      // Update user's subscription data to track the discount used
      await require("../models/User").findByIdAndUpdate(req.user._id, {
        $inc: { "subscription.discountsUsed": 1 }, // Track how many times discount was used
        $set: { "subscription.lastDiscountUsed": new Date() },
      });
    }

    // Calculate GST for each order item and add gst field
    const updatedOrderItems = orderItems.map((item) => {
      let gst = 0;
      if (item.price < 999) {
        gst = +((item.price * 5) / 105).toFixed(2); // 5% GST (GST-inclusive)
      } else {
        gst = +((item.price * 12) / 112).toFixed(2); // 12% GST (GST-inclusive)
      }
      return { ...item, gst };
    });

    const order = new Order({
      user: req.user._id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentInfo: {
        ...paymentInfo,
        originalPrice: totalPrice, // Store original price before any discounts
      },
      totalPrice: finalPrice,
      coupon: appliedCoupon,
      subscriptionDiscount: {
        applied: subscriptionApplied,
        amount: subscriptionDiscountAmount,
        subscriptionCost: user?.subscription?.subscriptionCost || 0,
      },
    });
    const createdOrder = await order.save();
    // Send order confirmation email to user
    const populatedOrder = await order.populate("user", "name email");
    if (populatedOrder.user && populatedOrder.user.email) {
      await sendOrderConfirmedEmail(
        populatedOrder.user.email,
        order.orderId,
        populatedOrder.user.name
      );
    }
    const addressData = await Address.findById(shippingAddress);

    // Send admin notification
    await sendAdminOrderNotification({
      orderId: order.orderId,
      userName: populatedOrder.user.name,
      userEmail: populatedOrder.user.email,
      totalPrice: finalPrice,
      orderItems: orderItems,
      shippingAddress: {
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
      },
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Order placed successfully",
      data: createdOrder,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "shippingAddress"
    ); // Populate address details

    // Add originalPrice and subscriptionDiscount to each order
    const ordersWithDiscountInfo = orders.map((order) => {
      let originalPrice = order.totalPrice;
      let subscriptionDiscount = 0;
      if (order.paymentInfo && order.paymentInfo.originalPrice) {
        // If already stored, use it
        originalPrice = order.paymentInfo.originalPrice;
        subscriptionDiscount = originalPrice - order.totalPrice;
      } else if (order._doc && order._doc.originalPrice) {
        // If stored in doc
        originalPrice = order._doc.originalPrice;
        subscriptionDiscount = originalPrice - order.totalPrice;
      }
      // Add totalGstForItem to each orderItem and ensure full image URL
      const orderItemsWithGst = order.orderItems.map((item) => {
        // Extract only the filename and extension from the image path
        let image = item.image;
        if (item.image) {
          // If it's a full URL, extract just the filename
          if (item.image.startsWith('http')) {
            const urlParts = item.image.split('/');
            image = urlParts[urlParts.length - 1]; // Get just the filename
          }
        }
          
        return {
          ...item._doc,
          image,
          totalGstForItem: +(item.gst * item.quantity).toFixed(2),
        };
      });
      // Add totalGstForOrder at order level
      const totalGstForOrder = orderItemsWithGst.reduce(
        (sum, item) => sum + item.totalGstForItem,
        0
      );
      return {
        ...order._doc,
        originalPrice,
        subscriptionDiscount,
        orderItems: orderItemsWithGst,
        totalGstForOrder: +totalGstForOrder.toFixed(2),
      };
    });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: ordersWithDiscountInfo,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "orderItems.product",
        select: "name sku hsn",
      })
      .sort({ createdAt: -1 });

    const ordersWithGst = orders.map((order) => {
      const orderItemsWithGst = order.orderItems.map((item) => {
        // Extract only the filename and extension from the image path
        let image = item.image;
        if (item.image) {
          // If it's a full URL, extract just the filename
          if (item.image.startsWith('http')) {
            const urlParts = item.image.split('/');
            image = urlParts[urlParts.length - 1]; // Get just the filename
          }
        }
        
        return {
          ...item._doc,
          image,
          totalGstForItem: +(item.gst * item.quantity).toFixed(2),
          // Add product details for invoice
          sku: item.product?.sku || "BT-TS BLK-OS-L",
          hsn: item.product?.hsn || "6109",
        };
      });

      const totalGstForOrder = orderItemsWithGst.reduce(
        (sum, item) => sum + item.totalGstForItem,
        0
      );

      return {
        ...order._doc,
        orderItems: orderItemsWithGst,
        totalGstForOrder: +totalGstForOrder.toFixed(2),
        // Add payment method and AWB for invoice
        paymentMethod: order.paymentInfo?.method || "ONLINE",
        awbNumber: order.awbNumber || "AWB-000000000000000",
      };
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: ordersWithGst,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch all orders",
    });
  }
};

// @desc    Get order by ID (admin only)
// @route   GET /api/orders/:id
// @access  Admin
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "orderItems.product",
        select: "name sku hsn",
      });

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderItemsWithGst = order.orderItems.map((item) => {
      // Ensure image URL is returned in full
      const image = item.image && !item.image.startsWith('http') 
        ? `https://res.cloudinary.com/di9lv1bgh/image/upload/${item.image}` 
        : item.image;
        
      return {
        ...item._doc,
        image,
        totalGstForItem: +(item.gst * item.quantity).toFixed(2),
        // Add product details for invoice
        sku: item.product?.sku || "BT-TS BLK-OS-L",
        hsn: item.product?.hsn || "6109",
      };
    });

    const totalGstForOrder = orderItemsWithGst.reduce(
      (sum, item) => sum + item.totalGstForItem,
      0
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        ...order._doc,
        orderItems: orderItemsWithGst,
        totalGstForOrder: +totalGstForOrder.toFixed(2),
        // Add payment method and AWB for invoice
        paymentMethod: order.paymentInfo?.method || "ONLINE",
        awbNumber: order.awbNumber || "AWB-000000000000000",
      },
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// @desc    Update order status (admin only)
// @route   PATCH /api/orders/:id/status
// @access  Admin



const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    const shippingAddress = await Address.findById(order.shippingAddress);

    if (!shippingAddress) {
      return res.status(404).json({ success: false, message: "Shipping address not found" });
    }

   if (status === "processing") {
     try {
        const orderPayload = await generateShiprocketPayload(order, shippingAddress);
        if (orderPayload) {
          const shiprocketOrder = await createShiprocketOrder(orderPayload);
          if (shiprocketOrder?.order_id) {
            order.shiprocketShipmentId = shiprocketOrder.order_id;
            await order.save(); 
          } else {
            console.warn("⚠️ No shipment_id returned from Shiprocket.");
          }
        }
         else {
                 console.warn("❗ Order payload generation failed or returned null.");
               }
       } catch (error) {
        console.error("🚨 Error creating Shiprocket order:", error.response?.data || error.message);
     }
   }   
   
    const oldStatus = order.status;
    order.status = status;

    await order.save({ validateModifiedOnly: true })

    if (
      status === "delivered" &&
      order.orderItems &&
      order.orderItems.length > 0
    ) {
      const Product = require("../models/Product");
      for (const item of order.orderItems) {

        const product = await Product.findById(item.product);
        if (product) {
          // Increase soldCount by the quantity ordered
          product.soldCount = (product.soldCount || 0) + (item.quantity || 1);
          // Decrease stockQuantity by the quantity ordered, but not below 0
          product.stockQuantity = Math.max(
            0,
            (product.stockQuantity || 0) - (item.quantity || 1)
          );
          await product.save();
        }
      }
    }

    // If status is return_approved, update stockQuantity and soldCount for each product
    if (
      status === "return_approved" &&
      order.orderItems &&
      order.orderItems.length > 0
    ) {
      const Product = require("../models/Product");
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          // Increase stockQuantity by the quantity returned
          product.stockQuantity =
            (product.stockQuantity || 0) + (item.quantity || 1);
          // Decrease soldCount by the quantity returned, but not below 0
          product.soldCount = Math.max(
            0,
            (product.soldCount || 0) - (item.quantity || 1)
          );
          await product.save();
          console.log("product updated for return");
        }
      }
    }

    // Send email notification to user
    if (order.user && order.user.email) {
      if (status === 'delivered') {
        // For delivered orders, include full order data for invoice generation
        const fullOrder = await Order.findById(req.params.id)
          .populate("user", "name email")
          .populate("shippingAddress");
        
        await sendOrderStatusEmail(
          order.user.email,
          status,
          order.orderId,
          order.user.name,
          fullOrder
        );
      } else {
        await sendOrderStatusEmail(
          order.user.email,
          status,
          order.orderId,
          order.user.name
        );
      }
    }

    // Send admin notification for status change
    await sendAdminOrderStatusNotification({
      orderId: order.orderId,
      userName: order.user.name,
      userEmail: order.user.email,
      oldStatus: oldStatus,
      newStatus: status,
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.log(error)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

// @desc    Get a single order for the logged-in user
// @route   GET /api/orders/my/:id
// @access  Private
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("shippingAddress");
    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }
    const orderItemsWithGst = order.orderItems.map((item) => {
      // Ensure image URL is returned in full
      const image = item.image && !item.image.startsWith('http') 
        ? `https://res.cloudinary.com/di9lv1bgh/image/upload/${item.image}` 
        : item.image;
        
      return {
        ...item._doc,
        image,
        totalGstForItem: +(item.gst * item.quantity).toFixed(2),
      };
    });
    const totalGstForOrder = orderItemsWithGst.reduce(
      (sum, item) => sum + item.totalGstForItem,
      0
    );
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: {
        ...order._doc,
        orderItems: orderItemsWithGst,
        totalGstForOrder: +totalGstForOrder.toFixed(2),
      },
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// @desc    Cancel order (user only)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("user", "name email");

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled (only pending, processing, or no status)
    if (order.status && !["pending", "processing"].includes(order.status)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

  // Cancel ShipRocket order if it exists
if (order.shiprocketShipmentId) {
  try {
    const data = await cancelShiprocketOrder(order.shiprocketShipmentId);
  } catch (error) {
    console.error("❌ Failed to cancel Shiprocket order:", error.response?.data || error.message);
  }
}


    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    // Send email notification to user
    if (order.user && order.user.email) {
      await sendOrderStatusEmail(
        order.user.email,
        "cancelled",
        order.orderId,
        order.user.name
      );
    }

    // Send admin notification for order cancellation
    await sendAdminOrderStatusNotification({
      orderId: order.orderId,
      userName: order.user.name,
      userEmail: order.user.email,
      oldStatus: order.status,
      newStatus: "cancelled",
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  }
};

// @desc    Delete subscription by email (admin only)
// @route   DELETE /api/orders/subscription/:email
// @access  Private (Admin)
const deleteSubscriptionByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: `User with email ${email} not found`,
      });
    }

    if (!user.subscription || !user.subscription.isSubscribed) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `User ${user.name} (${email}) does not have an active subscription`,
      });
    }

    // Store user info for response
    const userName = user.name;
    const subscriptionType = user.subscription.subscriptionType;
    const subscriptionExpiry = user.subscription.subscriptionExpiry;

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

    // Send admin notification for subscription deletion
    await sendAdminOrderStatusNotification({
      orderId: "SUBSCRIPTION_DELETION",
      userName: userName,
      userEmail: email,
      oldStatus: "active",
      newStatus: "deleted",
      additionalInfo: `Subscription deleted: ${subscriptionType} - was expiring ${subscriptionExpiry}`,
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `Successfully removed subscription from ${userName} (${email})`,
      data: {
        userName,
        userEmail: email,
        deletedSubscription: {
          type: subscriptionType,
          expiry: subscriptionExpiry,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to delete subscription",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrderById,
  cancelOrder,
  deleteSubscriptionByEmail,
};
