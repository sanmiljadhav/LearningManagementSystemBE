import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCreatorCourses, getLectureById, getLecturesForAParticularCourse, getPublishedCourses, removeLecture, togglePublishCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js"


const router = express.Router()


router.route("/").post(isAuthenticated,createCourse)
router.route("/").get(isAuthenticated,getCreatorCourses)
router.route("/publishedCourses").get(isAuthenticated, getPublishedCourses) // after togglePublishCourse
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"),editCourse)
router.route("/:courseId").get(isAuthenticated,getCourseById)
router.route("/:courseId/lecture").post(isAuthenticated,createLecture)
router.route("/:courseId/lecture").get(isAuthenticated,getLecturesForAParticularCourse)
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated,editLecture)
router.route("/lecture/:lectureId").delete(isAuthenticated,removeLecture)
router.route("/lecture/:lectureId").get(isAuthenticated,getLectureById)
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);







export default router;