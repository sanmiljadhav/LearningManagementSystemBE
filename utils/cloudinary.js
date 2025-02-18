import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

// Media can be photo or video
export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    return uploadResponse;
  } catch (error) {
    console.log(error);
  }
};

// Why we need to delete

// If we are deleting a profile photo
// If we are updating a profile photo, then jo purani wali photo jo upload hochucki hai
// Usko delete Karna padega na, taki purani wali faltu ka space na le

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};


export const deleteVideoFromCloudinary = async (publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId, {resource_type:"video"});
    } catch (error) {
      console.log(error);
    }
  };
