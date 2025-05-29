import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { userModel } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';


//--New user register
export const rgisterUser = catchAsyncErrors(async (req, res, next) => {

    //--for Avatar and Resume, if they are provided in the request body. Else, return an error message.
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler('Avatar, Resume and Resume Pdf are Required!', 400));
    };

    const { avatar, resume } = req.files;
    // console.log(avatar, resume)
    //--for Avatar
    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
            folder: 'AVATARS',
        }
    );

    if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error(
            "Cloudinary Error",
            cloudinaryResponseForAvatar.error || "Unknown Cloudinary Error"
        );
    };

    //--for Resume
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {
            folder: 'My_Resume',
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
    };

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
            url: cloudinaryResponseForAvatar.secure_url
        },
        resume: {
            public_id: cloudinaryResponseForResume.public_id,
            url: cloudinaryResponseForResume.secure_url
        },
    });

    //--generate JWT token
    generateToken(user, "User Registered Successfully..", 201, res);

});

//--user login--
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !await user.comparePassword(password)) {
        return next(new ErrorHandler('Invalid email or password', 401));
    };

    //--generate JWT token
    generateToken(user, "User Logged In Successfully..", 200, res);

});

//--user logout--
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "User Logged Out Successfully!",
        sameSite: "None",
        secure: true,
    })
});

//-get user for admin--
export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

//--update user--
export const updateUser = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        linkedinURL: req.body.linkedinURL,
        twitterURL: req.body.twitterURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
    };

    //--for Avatar
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await userModel.findById(req.user.id);
        const profileImageId = user.avatar.public_id;

        await cloudinary.uploader.destroy(profileImageId);

        const cloudinaryResponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {
                folder: 'AVATARS'
            }
        );
        newUserData.avatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        };
    };

    //--for Resume
    if (req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await userModel.findById(req.user.id);
        const resumeId = user.avatar.public_id;

        await cloudinary.uploader.destroy(resumeId);

        const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {
                folder: 'My_Resume'
            }
        );
        newUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        };
    };

    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,  //-
        runValidators: true,  //-
        useFindAndModify: false  //-
    });

    res.status(200).json({
        success: true,
        message: "User Updated Successfully!",
        user: updatedUser
    });
});

//--update Password--
export const updatePassword = catchAsyncErrors(async (req, res, next) => {

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler('Please provide all fields', 400));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler('New password and confirm password do not match', 400));
    };

    const user = await userModel.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(currentPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid current password', 400));
    };

    user.password = newPassword;  //--
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Updated Successfully!"
    });

});

//--Forgot Password--
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new ErrorHandler('Please provide an email', 400));
    }

    //--Check if user exists with that email
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return next(new ErrorHandler('No user is registered with the email', 404));
    };

    const resetToken = user.getResetPasswordToken();    

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

    const message = `To Reset your password follow the below given link :\n\n${resetPasswordUrl}\n\n This link will expire in 15 minutes.\n\nif 
    you did not request this please ignore this email.`;

    try {

        await sendEmail({
            email: user.email,
            subject: "Reset Your Password",
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully!`
        });

    } catch (error) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
});

//--Reset Password--
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    //--
    const { token } = req.params;
    const {password, confirmPassword} = req.body;

    if (!password || !confirmPassword) {
        return next(new ErrorHandler('Please provide password and confirm password', 400));
    }
    
    //--
    if (password !== confirmPassword) {
        return next(new ErrorHandler('Password and Confirm Password do not match', 400));
    }

    //--
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    //--
    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    //--
    if (!user) {
        return next(new ErrorHandler('Invalid Token or Token Expired', 400));
    };

    

    user.password = password;  //--

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();  //--

    generateToken(user, "Reset Password Successfully!", 200, res);  //--

});