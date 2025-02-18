import multer from "multer"

const upload = multer({dest: "upload"})

// dest ke andar jo paas karoge us naam ka folder banega and uske andar sare images aayenge

export default upload;
