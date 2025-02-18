import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle:{
        type:String,
        required:true
    },
    
    videoUrl:{
        type:String, //Because Lecture will have video
    },
    publicId:{
        type:String
    },
    isPreviewFree: {type:Boolean}
}, {timestamps:true})

export const Lecture = mongoose.model("Lecture", lectureSchema);


// we will not make lecture controller instead add every controllers in lecture controller