import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { specialOfferModel } from "../models/specialOfferSchema.js";
import cloudinary from "cloudinary";
import fs from "fs";

// Create a new special offer (with authentication)
export const createSpecialOffer = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Process image upload
    let imageUrl = "";
    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "specialOffers",
        width: 1000,
        crop: "scale",
      });
      imageUrl = result.secure_url;

      // Remove temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Create special offer
    const specialOffer = await specialOfferModel.create({
      title,
      description,
      imageUrl,
      admin: req.user.id,
    });

    return res.status(201).json({
      success: true,
      specialOffer,
      message: "Special offer created successfully",
    });
  } catch (error) {
    console.error("Error creating special offer:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all special offers
export const getAllSpecialOffers = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;
  try {
    const specialOffers = await specialOfferModel
      .find({ admin: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: specialOffers.length,
      specialOffers,
    });
  } catch (error) {
    console.error("Error fetching special offers:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single special offer by ID
export const getSpecialOfferById = catchAsyncErrors(async (req, res, next) => {
  try {
    const specialOfferId = req.params.id;
    const specialOffer = await specialOfferModel.findById(specialOfferId);

    if (!specialOffer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    return res.status(200).json({
      success: true,
      specialOffer,
    });
  } catch (error) {
    console.error("Error fetching special offer:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update special offer
export const updateSpecialOffer = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const specialOfferId = req.params.id;
    const specialOffer = await specialOfferModel.findById(specialOfferId);

    if (!specialOffer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    // Process image upload if provided
    let imageUrl = "";
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (specialOffer.imageUrl) {
        try {
          const publicId = specialOffer.imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`specialOffers/${publicId}`);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "specialOffers",
        width: 1000,
        crop: "scale",
      });
      imageUrl = result.secure_url;

      // Remove temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    const { title, description } = req.body;

    // Update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;

    // Update the special offer
    const updatedSpecialOffer = await specialOfferModel.findByIdAndUpdate(
      specialOfferId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      specialOffer: updatedSpecialOffer,
      message: "Special offer updated successfully",
    });
  } catch (error) {
    console.error("Error updating special offer:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete special offer
export const deleteSpecialOffer = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const specialOfferId = req.params.id;
    const specialOffer = await specialOfferModel.findById(specialOfferId);

    if (!specialOffer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    // Delete image from Cloudinary
    if (specialOffer.imageUrl) {
      try {
        const publicId = specialOffer.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`specialOffers/${publicId}`);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // Delete the special offer
    await specialOfferModel.findByIdAndDelete(specialOfferId);

    return res.status(200).json({
      success: true,
      message: "Special offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting special offer:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create a test endpoint (without authentication) for easier testing
export const createSpecialOfferTest = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Process image upload
      let imageUrl = "";
      if (req.file) {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "specialOffers",
          width: 1000,
          crop: "scale",
        });
        imageUrl = result.secure_url;

        // Remove temp file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      } else if (req.body.imageUrl) {
        // If image URL is provided directly (e.g., from separate upload)
        imageUrl = req.body.imageUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      const { title, description } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      // Create special offer without requiring admin
      const specialOffer = await specialOfferModel.create({
        title,
        description,
        imageUrl,
        admin: "64c8dad213aace0871ad31b8", // Example admin ID for testing
      });

      return res.status(201).json({
        success: true,
        specialOffer,
        message: "Special offer created successfully",
      });
    } catch (error) {
      console.error("Error creating special offer (test):", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Image upload endpoint
export const uploadSpecialOfferImage = catchAsyncErrors(
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "specialOffers",
        width: 1000,
        crop: "scale",
      });

      // Remove temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      return res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
