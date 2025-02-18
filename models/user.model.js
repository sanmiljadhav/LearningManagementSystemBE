import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true

    },
    role:{
        type:String,
        enum:["instructor", "student"],
        default:"student"   

    },
    enrolledCourses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'

    }],
    photoUrl:{
        type:String,
        default:""
    }
}, {timestamps:true})

export const User = mongoose.model("User", userSchema);

//suppose u have diffrent possibilities for user than u use enum or keep the values in enum
// If you use other values for role than enum than it will fail



// For enrolled courses
//User ne kitne course purchase kiye hai
// For enrolled courses I will take an array because User multiple courses me enroll karr sakta hai
// and I will reference User and course, and keep course id in the enrolled course

// For photo Url
// User will have a photo Url