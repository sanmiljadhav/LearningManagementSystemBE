// import Razorpay from "razorpay"
// key_id:rzp_test_sKz8VYa6lomMmV,
// key_secret:4d13Nw48iOS6qMild8eVSEuL

import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})