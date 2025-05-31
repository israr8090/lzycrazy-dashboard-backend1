import { bannerModel } from "../models/bannerSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


// GET all banners
export const getBanners = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const banners = await bannerModel.find({ admin: userId }).populate("admin", "fullName email");
    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE banner
export const createBanner = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.file) return next(new ErrorHandler("Image is required", 400));

    // Validate inputs
    if (!title || title.trim() === "") {
      return next(new ErrorHandler("Title is required", 400));
    }

    const imageUrl = await uploadToCloudinary(req.file.path);
    if (!imageUrl) return next(new ErrorHandler("Failed to upload image", 500));

    const banner = await bannerModel.create({
      imageUrl,
      title: title.trim(),
      description: description?.trim(),
      admin: req.user._id,
    });

    res.status(201).json({
      success: true,
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE banner
export const updateBanner = async (req, res, next) => {
  try {
    const { bannerId } = req.params;
    const { title, description } = req.body;

    if (!bannerId) return next(new ErrorHandler("Banner ID is required", 400));

    const banner = await bannerModel.findById(bannerId);
    if (!banner) return next(new ErrorHandler("Banner not found", 404));

    if (title) banner.title = title.trim();
    if (description) banner.description = description.trim();

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path);
      if (!imageUrl) return next(new ErrorHandler("Failed to upload image", 500));
      banner.imageUrl = imageUrl;
    }

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE banner
export const deleteBanner = async (req, res, next) => {
  try {
    const { bannerId } = req.params;

    if (!bannerId) return next(new ErrorHandler("Banner ID is required", 400));

    const banner = await bannerModel.findById(bannerId);
    if (!banner) return next(new ErrorHandler("Banner not found", 404));

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
