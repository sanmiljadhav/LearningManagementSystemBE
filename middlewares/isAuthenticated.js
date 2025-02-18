import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("IS AUthenticated got called")
    const token = req.cookies.token;

    console.log("Token is", token)

    // if there is no token, we will not give access to the service
    // 401 --> Unauthorized
    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated",
        success: false,
      });
    }

    // if there is token we will verify the token wheather its correct or not
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};

export default isAuthenticated;
