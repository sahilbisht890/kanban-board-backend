const express = require('express');
const router = express.Router();
const { registerUser  , loginUser , logoutUser , refreshAccessToken , checkAuthentication} = require('../controllers/userCtrl');
const verifyJWT = require('../middleware/auth.middleware')


router.post('/signup' , registerUser);
router.post('/login',loginUser);
router.get('/logout' ,verifyJWT, logoutUser);
router.get("/refresh-token" ,refreshAccessToken);
router.get("/check-auth", verifyJWT, checkAuthentication);

module.exports = router ;
