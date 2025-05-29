
import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { userModel } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';

// Register User (without avatar and resume)
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { fullName, email, phone, password, role } = req.body;

    const user = await userModel.create({
        fullName,
        email,
        phone,
        password,
        role,
    });

    generateToken(user, "User Registered Successfully", 201, res);

});

// Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    generateToken(user, "User Logged In Successfully", 200, res);

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


// Update Password
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

// Forgot Password
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

// Reset Password
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
})
