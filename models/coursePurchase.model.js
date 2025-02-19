import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true

        //konse user ne ye course purchase kiya

    },
    amount:{
        type:Number,
        required:true

        // Amount of the Purchase course
    },
    status:{
        type:String,
        enum:['pending', 'completed', 'failed'],
        default:'pending'

        // if course is purchased successfully then the status will be completed
        // and jaise hi purchase order lagayega pending ho jayega
    },
    paymentId: {
        type:String,
        required:true
    }
}, {timestamps: true});

export const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema)