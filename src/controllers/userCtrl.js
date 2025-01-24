const User = require("../models/user.model");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {

    if(!username || !email || !password) {
      return res
      .status(401)
      .json({ success: false, message: "Required Fields are missing!" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Username or Email already exists!" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password : hashpassword,
      habits: [],
    });

    await newUser.save();

   return  res
      .status(200)
      .json({
        success: true,
        message: "User created successfully!",
        user: newUser,
      });


  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred while signing in" });
  }
};



const loginUser = async (req, res) => {

  const { email, password } = req.body;
  try {

    if(!email || !password) {
      return res
      .status(401)
      .json({ success: false, message: "Required Fields are missing!" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Email doesn't exists!" });
    }

    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Password is Wrong" });
    }

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );

    const accessToken = await existingUser.generateAccessToken();
    const refreshToken = await existingUser.generateRefreshToken();

    existingUser.refreshToken = refreshToken;
    await existingUser.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User login successfully!",
        user: loggedInUser,
        accessToken: accessToken,
      });

  } catch (error) {

    console.error(error);

    res
      .status(500)
      .json({ success: false, message: "An error occurred while signing in" });
  }
};


const logoutUser = async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true,
      sameSite:'none'
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json({success : true , message :"User logged Out"});
}


const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    return res.status(401).json({
      success : false ,
      message : "Unauthorized Request"
    })  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          return res.status(401).json({
            success : false ,
            message : "Invalid refresh token"
          })
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          return res.status(401).json({
            success : false ,
            message : "Refresh token is expired or used"
          })
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const accessToken = await user.generateAccessToken();


        const userData = await User.findById(decodedToken?._id).select(
      "-password -refreshToken");
  
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
          {
            success : true ,
            message : "Access token refreshed",
            user : userData
          }
      )
  } catch (error) {
    return res.status(500).json({
      success : false ,
      message : "Server error while refreshing token"
    })
  }

}

const checkAuthentication = (req, res) => {
  if (req.user) {
      return res.status(200).json({success : true , message: 'User authenticated successfully', user: req.user });
  } else {
      return res.status(401).json({success : false , message: 'User is not authenticated' });
  }
};


module.exports = { registerUser  , loginUser , logoutUser , refreshAccessToken , checkAuthentication };
