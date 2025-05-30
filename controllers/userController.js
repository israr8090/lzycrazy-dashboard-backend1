import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { userModel } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// Register User with Image Upload
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { fullName, email, phone, password, role, image } = req.body;

    let imageUrl = "";
    if (image) {
        const uploaded = await cloudinary.uploader.upload(image, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });
        imageUrl = uploaded.secure_url;
    }

    const user = await userModel.create({
        fullName,
        email,
        phone,
        password,
        role,
        image: imageUrl,
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
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  generateToken(user, "User Logged In Successfully", 200, res);
});

//Logout User
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      message: "User Logged Out Successfully!",
    });
});

// Get My Profile
export const getMyProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ success: true, user });
});

// Get All Users
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await userModel.find();
  res.status(200).json({ success: true, users });
});

// Admin Dashboard
export const getAdminDashboard = catchAsyncErrors(async (req, res, next) => {
  const totalUsers = await userModel.countDocuments();
  res.status(200).json({
    success: true,
    message: "Admin Dashboard Data",
    data: { totalUsers },
  });
});

// SuperAdmin Dashboard
export const getSuperAdminDashboard = catchAsyncErrors(async (req, res, next) => {
    const totalUsers = await userModel.countDocuments();
    res.status(200).json({
      success: true,
      message: "SuperAdmin Dashboard Data",
      data: { totalUsers },
    });
  }
);


// Update User Profile (with optional image)
export const updateUser = catchAsyncErrors(async (req, res, next) => {
    const updateData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
    };

    if (req.body.image) {
        const uploaded = await cloudinary.uploader.upload(req.body.image, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });
        updateData.image = uploaded.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
    });

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

    const resetURL = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const message = `Your password reset link is: \n\n ${resetURL} \n\n If you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Reset email sent to ${user.email}`,
        });

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorHandler('Email could not be sent', 500));
    }
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');


  //--
  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });


    if (password !== confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();


  generateToken(user, "Reset Password Successfully!", 200, res); //--
});
