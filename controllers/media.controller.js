import { uploadMedia } from "../utils/cloudinary.js"

export const uploadVideo = async (req, res) => {

    try {
        console.log("In upload video route")
        const result = await uploadMedia(req.file.path);

        return res.status(200).json({
            success:true,
            message:"File uploaded successfully",
            data:result
        })

        
    } catch (error) {

        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error in uploading the file",
        });
        
    }

}