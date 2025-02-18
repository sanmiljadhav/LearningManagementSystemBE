import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import { uploadVideo } from "../controllers/media.controller.js";

const router = express.Router()


router.route("/upload-video").post(isAuthenticated, upload.single("file"),uploadVideo)

export default router;