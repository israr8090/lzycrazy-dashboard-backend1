import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { specialOfferModel } from '../models/specialOfferSchema.js';
import cloudinary from 'cloudinary';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Create a new special offer (with authentication)
export const createSpecialOffer = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Process image upload
    let imageUrl = '';
    if (req.file) {
      // Upload image to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.path);;
      
    } else {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }
    
    const { title, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }
    
    // Create special offer with appropriate user/admin association
    const offerData = {
      title,
      description,
      imageUrl,
    };
    
    // Always store user ID
    offerData.user = req.user.id;
    
    // If user is admin, store the same ID in admin field too
    if (req.user.role === 'admin') {
      offerData.admin = req.user.id;
    }
    
    const specialOffer = await specialOfferModel.create(offerData);
    
    return res.status(201).json({
      success: true,
      specialOffer,
      message: "Special offer created successfully"
    });
  } catch (error) {
    console.error('Error creating special offer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all special offers
export const getAllSpecialOffers = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
     
    // Use find instead of findOne to get all offers for this user
    const specialOffers = await specialOfferModel.find({ user: userId }).populate('user', 'fullName email');
   
    return res.status(200).json({
      success: true,
      count: specialOffers.length,
      specialOffers
    });
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return res.status(500).json({
      success: false,
      message: error.message
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
        message: "Special offer not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      specialOffer
    });
  } catch (error) {
    console.error('Error fetching special offer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
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
        message: "Authentication required"
      });
    }
    
    const specialOfferId = req.params.id;
    const specialOffer = await specialOfferModel.findById(specialOfferId);
    
    if (!specialOffer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found"
      });
    }
    
    // Process image upload if provided
    let imageUrl = '';
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (specialOffer.imageUrl) {
        try {
          const publicId = specialOffer.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`specialOffers/${publicId}`);
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
        }
      }
      
      // Upload new image
      imageUrl = await uploadToCloudinary(req.file.path);
      
    }
    
    const { title, description } = req.body;
    
    // Update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    
    // Always update user ID
    updateData.user = req.user.id;
    
    // If user is admin, update admin field too
    if (req.user.role === 'admin') {
      updateData.admin = req.user.id;
    }
    
    // Update the special offer
    const updatedSpecialOffer = await specialOfferModel.findByIdAndUpdate(
      specialOfferId,
      { $set: updateData },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      specialOffer: updatedSpecialOffer,
      message: "Special offer updated successfully"
    });
  } catch (error) {
    console.error('Error updating special offer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
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
        message: "Authentication required"
      });
    }
    
    const specialOfferId = req.params.id;
    const specialOffer = await specialOfferModel.findById(specialOfferId);
    
    if (!specialOffer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found"
      });
    }
    
    // Delete image from Cloudinary
    if (specialOffer.imageUrl) {
      try {
        const publicId = specialOffer.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`specialOffers/${publicId}`);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }
    
    // Delete the special offer
    await specialOfferModel.findByIdAndDelete(specialOfferId);
    
    return res.status(200).json({
      success: true,
      message: "Special offer deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting special offer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoints have been removed for security
