import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the user's email is already present

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // if there is no user then I will register the user
    // Hash the password and store the user

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully !!!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the user with that email exists in the DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email and password",
      });
    }

    // if user is present, check if the password matches

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email and password",
      });
    }

    // If password matches, generate Token and give it to user
    // We will set that token in a cookie
    // If the token is present in the cookie then he dosent needs to login again
    // If the token dosent exists in the cookie then user has to login again

    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token","",{maxAge:0}).json({
        message:"Logged out successfully",
        success:true
    })
    //when cookie is not having token, user gets logged out
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout user",
    });
  }
};



// Need Authentication
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;  // if user is loggedIn and Authenticated we will get the logged in user id
        const user = await User.findById(userId).select("-password");

        if (!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }

        return res.status(200).json({
            success:true,
            user,
            message:"User profile fetched successfully"
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to Load User",
          });
        
    }
}

// Need Authentication
export const updateProfile = async (req,res) =>{
    try {
        const userId = req.id;
        console.log("REQBODY", req.body)
        const {name, email} = req.body;
        const profilePhoto = req.file;
        console.log("PROFILE PHOTO", profilePhoto)

        
        
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            })

        }

        // extract the Public Id of the old image from the url if it exists
        if(user.photoUrl){

            const publicId = user.photoUrl.split("/").pop().split(".")[0] //extract public Id
            deleteMediaFromCloudinary(publicId);

        }

        // upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url;

        const updatedData = {name, email, photoUrl}
        // Update the User
        const updatedUser =  await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password")

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully...!!"
        })




        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to Update Profile",
          });
        
    }
}
