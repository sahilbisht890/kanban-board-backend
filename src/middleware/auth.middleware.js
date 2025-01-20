const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


const verifyJWT = async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      console.log('token',token);
  
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized request" ,});
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid Access Token" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Error verifying JWT:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  

  module.exports = verifyJWT;
