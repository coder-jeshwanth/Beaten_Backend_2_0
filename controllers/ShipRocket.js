// shiprocketService.js
import axios from "axios";

const SHIPROCKET_API_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_API_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let shiprocketToken = null;

export const getShiprocketToken = async () => {
  if (shiprocketToken) return shiprocketToken;

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: SHIPROCKET_API_EMAIL,
      password: SHIPROCKET_API_PASSWORD,
    }
  );
  shiprocketToken = response.data.token;
  return shiprocketToken;
};

const shiprocketRequest = async (method, url, data = {}) => {
  const token = await getShiprocketToken();

  return axios({
    method,
    url: `https://apiv2.shiprocket.in${url}`,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// ✅ Create Order
export const createShiprocketOrder = async (orderPayload) => {
  const res = await shiprocketRequest(
    "POST",
    "/v1/external/orders/create/adhoc",
    orderPayload
  );
  return res.data;
};

// Cancel
export const cancelShiprocketOrder = async (shiprocketOrderId) => {
  try {
    const res = await shiprocketRequest("POST", "/v1/external/orders/cancel", {
      ids: [Number(shiprocketOrderId)], // ✅ ensure it's a number
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};




// ✅ Assign AWB
export const assignAWB = async (shipmentId) => {
  const res = await shiprocketRequest("POST", "/v1/external/courier/assign/awb", {
    shipment_id: shipmentId,
  });
  return res.data;
};

// ✅ Generate Pickup
export const generatePickup = async (shipmentId) => {
  const res = await shiprocketRequest("POST", "/v1/external/courier/generate/pickup", {
    shipment_id: shipmentId,
  });
  return res.data;
};

// ✅ Generate Label
export const generateLabel = async (shipmentId) => {
  const res = await shiprocketRequest(
    "GET",
    `/v1/external/courier/generate/label?shipment_id=${shipmentId}`
  );
  return res.data;
};

// ✅ Generate Invoice
export const generateInvoice = async (shipmentId) => {
  const res = await shiprocketRequest(
    "GET",
    `/v1/external/orders/print/invoice?shipment_id=${shipmentId}`
  );
  return res.data;
};

// ✅ Generate Manifest
export const generateManifest = async (shipmentId) => {
  const res = await shiprocketRequest("POST", "/v1/external/manifests/generate", {
    shipment_id: shipmentId,
  });
  return res.data;
};

export const printManifest = async (shipmentId) => {
  const res = await shiprocketRequest(
    "GET",
    `/v1/external/manifests/print?shipment_id=${shipmentId}`
  );
  return res.data;
};

// ✅ Track Shipment
export const trackShipmentByAWB = async (awbCode) => {
  const res = await shiprocketRequest(
    "GET",
    `/v1/external/courier/track/awb/${awbCode}`
  );
  return res.data;
};


export const generateShiprocketPayload = (order, shippingAddress) => {
  const isCOD = order.paymentInfo?.method?.toLowerCase() === "cod";
  const paymentMethod = isCOD ? "COD" : "Prepaid";

  // Split full name into first and last name
  const fullName = shippingAddress.name || order.user.name || "Customer";
  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.length > 0 ? lastNameParts.join(" ") : "."; // fallback if no last name

  return {
    order_id: order.orderId || order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split("T")[0],

    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: shippingAddress.address,
    billing_city: shippingAddress.city,
    billing_pincode: shippingAddress.postalCode,
    billing_state: shippingAddress.state,
    billing_country: shippingAddress.country || "India",
    billing_email: order.user.email,
    billing_phone: shippingAddress.phone,

    shipping_is_billing: true,

    order_items: order.orderItems.map(item => ({
      name: item.name,
      sku: item.product.toString(),
      units: item.quantity,
      selling_price: item.price,
    })),

    payment_method: paymentMethod,
    sub_total: order.totalPrice,

    shipping_charges: 0,
    discount: 0,
    total_discount: 0,

    length: 10,
    breadth: 15,
    height: 5,
    weight: 0.5,

    comment: "Auto-created from dashboard",
    pickup_location: "Beaten Apparels"
  };
};
