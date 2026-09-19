const crypto = require("crypto");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const SERVICE_FEE_RATE = 0.05;

// Lazily initialise Razorpay only when keys are present — no crash when keys are absent
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  const Razorpay = require("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// @desc    Create a Razorpay order (or simulate one when keys not configured)
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { propertyId, checkIn, checkOut, guests } = req.body;

  if (!propertyId || !checkIn || !checkOut || !guests) {
    throw new ApiError(400, "propertyId, checkIn, checkOut and guests are required");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    throw new ApiError(400, "Invalid check-in or check-out date");
  }
  if (checkInDate < today) {
    throw new ApiError(400, "Cannot book dates in the past");
  }
  if (checkOutDate <= checkInDate) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  const property = await Property.findById(propertyId);
  if (!property || !property.isActive) {
    throw new ApiError(404, "Property not found");
  }
  if (property.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own property");
  }
  if (Number(guests) > property.guests) {
    throw new ApiError(400, `This property allows a maximum of ${property.guests} guests`);
  }

  const conflict = await Booking.findOne({
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });
  if (conflict) {
    throw new ApiError(409, "These dates are no longer available for this property");
  }

  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = property.pricePerNight;
  const cleaningFee = property.cleaningFee || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const razorpay = getRazorpay();

  if (razorpay) {
    // Real Razorpay order — amount in paise
    const rzpOrder = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        propertyId: propertyId.toString(),
        userId: req.user._id.toString(),
        checkIn,
        checkOut,
        guests: String(guests),
      },
    });

    return sendSuccess(res, 200, "Order created", {
      mode: "razorpay",
      orderId: rzpOrder.id,
      amount: totalPrice,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      // Booking summary to display on frontend
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      totalPrice,
      propertyTitle: property.title,
    });
  }

  // Demo mode — no Razorpay keys configured
  const demoOrderId = `demo_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return sendSuccess(res, 200, "Order created (demo mode)", {
    mode: "demo",
    orderId: demoOrderId,
    amount: totalPrice,
    currency: "INR",
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    totalPrice,
    propertyTitle: property.title,
  });
});

// @desc    Verify Razorpay payment signature and confirm booking
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    // booking details needed to persist
    propertyId,
    checkIn,
    checkOut,
    guests,
  } = req.body;

  if (!propertyId || !checkIn || !checkOut || !guests || !razorpay_order_id) {
    throw new ApiError(400, "Missing required booking or payment fields");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const property = await Property.findById(propertyId);
  if (!property || !property.isActive) {
    throw new ApiError(404, "Property not found");
  }

  // Re-confirm no date conflict (race condition guard)
  const conflict = await Booking.findOne({
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });
  if (conflict) {
    throw new ApiError(409, "These dates are no longer available");
  }

  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = property.pricePerNight;
  const cleaningFee = property.cleaningFee || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const isDemoOrder = razorpay_order_id.startsWith("demo_order_");

  let paymentStatus = "pending";
  let bookingStatus = "pending";

  if (isDemoOrder) {
    // Demo mode — accept as "paid" without real verification
    paymentStatus = "demo_paid";
    bookingStatus = "confirmed";
  } else {
    // Real Razorpay — verify HMAC signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new ApiError(500, "Payment verification is not configured on this server");
    }
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Payment verification failed — invalid signature");
    }
    paymentStatus = "paid";
    bookingStatus = "confirmed";
  }

  const booking = await Booking.create({
    user: req.user._id,
    property: propertyId,
    host: property.host,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: Number(guests),
    nights,
    pricePerNight,
    cleaningFee,
    serviceFee,
    totalPrice,
    status: bookingStatus,
    paymentStatus,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id || null,
  });

  sendSuccess(res, 201, "Booking confirmed", { booking, paymentStatus });
});

module.exports = { createOrder, verifyPayment };
