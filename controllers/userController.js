import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { userModel } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";

//--New user register
export const rgisterUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(
      new ErrorHandler("Avatar, Resume and Resume Pdf are Required!", 400)
    );
  }

  const { avatar, resume } = req.files;
  // console.log(avatar, resume)
  //--for Avatar
  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: "AVATARS",
    }
  );

  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponseForAvatar.error || "Unknown Cloudinary Error"
    );
  }

  //--for Resume
  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    {
      folder: "My_Resume",
      // public_id: `${Date.now()}-${avatar.originalname}`,
      // width: 200,
      // height: 200,
      // crop: 'fill'
    }
  );

  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    console.error(
      "Cloudinary Error",
      cloudinaryResponseForResume.error || "Unknown Cloudinary Error"
    );
  }

  //--
  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    linkedinURL,
    twitterURL,
    instagramURL,
    facebookURL,
  } = req.body;

  const user = await userModel.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    linkedinURL,
    twitterURL,
    instagramURL,
    facebookURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });

  //--generate JWT token
  generateToken(user, "User Registered Successfully..", 201, res);
});

//--user login--
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  //--generate JWT token
  generateToken(user, "User Logged In Successfully..", 200, res);
});

//--user logout--
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User Logged Out Successfully!",
      sameSite: "None",
      secure: true,
    });
});

//-get user for admin--
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//--update user--
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
  };

  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    newUserData,
    {
      new: true, //-
      runValidators: true, //-
      useFindAndModify: false, //-
    }
  );

  res.status(200).json({
    success: true,
    message: "User Updated Successfully!",
    user: updatedUser,
  });
});

//--update Password--
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please provide all fields", 400));
  }

  const user = await userModel.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid current password", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match", 400)
    );
  }

  user.password = newPassword; //--
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated Successfully!",
  });
});

//--Forgot Password--
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.DESHBOARD_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is :- \n\n ${resetPasswordUrl} \n\n if 
    you've not request for this please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Deshboard Recovery Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully!`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new ErrorHandler("error.message", 500));
  }
});

//--Reset Password--
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  //--
  const { token } = req.params;

  //--
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  //--
  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  //--
  if (!user) {
    return next(new ErrorHandler("Invalid Token or Token Expired", 400));
  }

  //--
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match", 400)
    );
  }

  user.password = req.body.password; //--

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); //--

  generateToken(user, "Reset Password Successfully!", 200, res); //--
});
