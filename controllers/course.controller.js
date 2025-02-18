import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category are required",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      course,
      message: "Course created",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    // Because ADMIN ne jo course create kiya hai wo hi usko dikhna chahiye
    const courses = await Course.find({ creator: userId });

    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found",
      });
    }

    return res.status(200).json({
      courses,
      success: true,
      message: "Course found successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get the course",
    });
  }
};

// Edit the course

export const editCourse = async (req, res) => {
  // courseTitle: "",
  // subTitle: "",
  // description: "",
  // category: "",
  // courseLevel: "",
  // coursePrice: "",
  // courseThumbnail: "",

  try {
    console.log("REQ BODY", req.body);
    console.log("REQ PARAMS", req.params);

    const courseId = req.params.courseId;

    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // If course mil jata hai to,
    // Existing thumbnail ko delete karna padega and new thumbnail update karna padega
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); // delete old Image
      }

      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    //

    const updatedData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
    });
    return res.status(200).json({
      course,
      message: "Updated the course successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Updated the course",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      course,
      message: "Course Found Successfully By Id",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get the course by id",
    });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;

    const { courseId } = req.params;
    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    //create lecture

    //While creating lecture make sure that u are passing LectureId in course Tables Lecture key

    const lecture = await Lecture.create({ lectureTitle });
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found for this Lecture",
      });
    }

    if (course) {
      course.lectures.push(lecture._id); //save the Lecture Id in course table lectures key array
      await course.save();
    }

    return res.status(201).json({
      lecture,
      message: "Lecture created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

export const getLecturesForAParticularCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    // This will contain lectures actual data
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      lectures: course.lectures,
      message: "Lectures fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures for a particular course",
    });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;

    if (!lectureTitle){
      return res.status(404).json({
        message: "Please provide lecture title",
      });

    }
    // We will also receive the Video Information
    // Here u will receive video URL and public Id and where you will get it
    // When the video is uploaded on cloudinary then from cloudinary we will get the video Url and Public Id
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture Not Found",
      });
    }

    // update Lecture

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = lecture.publicId;
    if (isPreviewFree) lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    // Ensure the course still has the lecture id if it was not already added

    const course = await Course.findById(courseId);

    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      lecture,
      message: "Lecture updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Edit lecture for a particular course",
    });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    // Note: Lecture delete karne ke baad me uska video bhi delete karunga jo
    // cloudinary pe uploaded hai

    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    // Also remove lecture reference from the associated course

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    ); //Find the course that contains this lecture id, and remove the lectureId from the lectures array

    return res.status(200).json({
      success: true,
      message: "Lecture removed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Remove lecture for a particular course",
    });
  }
};



export const getLectureById = async (req,res) =>{
  try {

    console.log("IN GET LECTURE BY ID")

    const {lectureId} = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    return res.status(200).json({
      success:true,
      lecture,
      message:"Lecture found successfully"
    })

    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get Lecture by id",
    });
    
  }
}


export const togglePublishCourse = async (req, res) =>{
  try {
    const {courseId} = req.params;
    const {publish} = req.query; 
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        message:"Could not find the course!!"
      })
    }

    // Publish the status of the course based on query parameter
    course.isPublished= publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message:`Course is ${statusMessage}`
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Publish the course",
    });
    
  }
}




// student
export const getPublishedCourses = async (req,res) =>{
  try {

    const courses = await Course.find({isPublished: 1}).populate({path:"creator", select:"name photoUrl"})
    if(!courses){
      return res.status(404).json({
        message: "Course not found...",
      });

    }

    return res.status(200).json({
      courses,
      message: "Found the published courses",
    });

    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Publish the course",
    });
    
  }
}
