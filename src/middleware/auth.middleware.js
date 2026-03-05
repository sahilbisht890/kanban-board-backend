const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require("../utils/logger");


const verifyJWT = async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
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
      logger.error({ err: error }, "Error verifying JWT");
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  

  module.exports = verifyJWT;
