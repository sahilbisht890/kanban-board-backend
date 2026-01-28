const express = require('express');
const router = express.Router();
const { registerUser  , loginUser , logoutUser , refreshAccessToken , checkAuthentication , verifyEmail} = require('../controllers/userCtrl');
const verifyJWT = require('../middleware/auth.middleware')
const {
  googleAuthRedirect,
  googleAuthCallback,
} = require("../helpers/googleAuth");



router.post('/signup' , registerUser);
router.post('/login',loginUser);
router.get('/logout' ,verifyJWT, logoutUser);
router.get("/refresh-token" ,refreshAccessToken);
router.get("/verify-email/:token", verifyEmail);
router.get("/check-auth", verifyJWT, checkAuthentication);


router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

module.exports = router ;
