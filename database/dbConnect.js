import mongoose from "mongoose";

const connectDB = async () =>{
    try{

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo Connected')

    }catch(error){

        console.log('Error occured in connecting DB', error)

    };
    
}

export default connectDB;