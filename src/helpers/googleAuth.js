const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");


const redirectURI = process.env.BACKEND_URL + "/api/auth/google/callback";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectURI
);


const googleAuthRedirect = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent",
  });

  return res.redirect(url);
};

const googleAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=google`);
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const response = await client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });

    const { email, name, picture, verified_email } = response.data;

    if (!verified_email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=unverified`);
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        isVerified: true,
        authProvider: "google",
        avatar: picture,
      });
    }

    // Generate tokens (your existing logic)
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    // Set cookies and redirect
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .redirect(`${process.env.FRONTEND_URL}`);

  } catch (error) {
    console.error("Google OAuth Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google`);
  }
};

module.exports = {
  googleAuthRedirect,
  googleAuthCallback,
};
