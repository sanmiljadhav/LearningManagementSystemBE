import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { verifyPayment, createOrder } from "../controllers/razorpay.controller.js";

const router = express.Router();

router.route("/checkout/createOrder").post(isAuthenticated, createOrder);
router.route('/verify-payment').post(isAuthenticated,verifyPayment)
// router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPurchaseStatus);

// router.route("/").get(isAuthenticated,getAllPurchasedCourse);

export default router;