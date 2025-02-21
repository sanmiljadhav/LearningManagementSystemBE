import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";
import { razorpay } from "../utils/razorpay.js";
import { User } from "../models/user.model.js";
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

    await Course.findByIdAndUpdate(
      updatedPurchase.courseId,
      { $addToSet: { enrolledStudents: updatedPurchase.userId } }, // Use $addToSet to avoid duplicates
      { new: true }
    );

    await User.findByIdAndUpdate(
      updatedPurchase.userId,
      { $addToSet: { enrolledCourses: updatedPurchase.courseId } }, // Use $addToSet to avoid duplicates
      { new: true }
    );

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getCourseDetailWithPurchaseStatus = async (req,res)=>{
  try {

    const {courseId} = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId).populate({path:"creator"}).populate({path:"lectures"})
    
    // check if user has purchased the course or not if there is something in purchased it will be true otherwise it would be false
    const purchased = await CoursePurchase.findOne({userId, courseId})

    if (!course){
      return res.status(404).json({message:"course not found"})
    }

    return res.status(200).json({
      course,
      purchased: purchased ? true: false
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get the course detail with purchase status",
    });
    
  }
}


export const getAllPurchasedCourse = async (req,res) =>{
  try {

    const purchasedCourse = await CoursePurchase.find({status:"completed"}).populate("courseId");

    if(!purchasedCourse){
      return res.status(404).json({
        purchasedCourse:[]

      })
    }

    return res.status(200).json({
      purchasedCourse
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get the Purchased courses",
    });
    
  }
}
