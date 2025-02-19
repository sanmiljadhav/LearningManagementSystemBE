import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";
import { razorpay } from "../utils/razorpay.js";
import crypto from 'crypto'

export const createOrder = async (req, res) => {
  try {
    const userId = req.id;

    console.log("USER ID IS", userId)
    const { courseId, currency } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const amount = course.coursePrice;

    const options = {
      amount: amount * 100, // Convert amount to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    // Save order details in MongoDB with "pending" status
    const purchase = new CoursePurchase({
      courseId,
      userId,
      amount,
      status: "pending",
      paymentId: order.id, // Store the Razorpay Order ID
    });

    await purchase.save();

    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate signature for verification
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Update CoursePurchase status to "completed"
    const updatedPurchase = await CoursePurchase.findOneAndUpdate(
      { paymentId: order_id },
      { status: "completed" }
    );

    if (!updatedPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
