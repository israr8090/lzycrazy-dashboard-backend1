import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { footerModel } from '../models/footerSchema.js';
import { v2 as cloudinary } from 'cloudinary';

// Get footer data
export const getFooter = catchAsyncErrors(async (req, res, next) => {
  const footer = await footerModel.findOne({ user: req.user.id });

  if (!footer) {
    return res.status(200).json({
      success: true,
      footer: null,
      message: "No footer data found for this user"
    });
  }

  res.status(200).json({
    success: true,
    footer
  });
});

// Create or update footer
export const createFooter = catchAsyncErrors(async (req, res, next) => {
  // Process file uploads if any
  let logoUrl = '';
  let footerImage = '';
  
  try {
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
    if (req.files) {
      // Process logo upload
      if (req.files.logo && req.files.logo.length > 0) {
        console.log('Processing logo file:', req.files.logo[0].path);
        const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
          folder: 'footer/logos',
          width: 250,
          crop: 'scale'
        });
        logoUrl = result.secure_url;
        console.log('Logo uploaded successfully:', logoUrl);
      }
      
      // Process footer image upload
      if (req.files.footerImage && req.files.footerImage.length > 0) {
        console.log('Processing footer image file:', req.files.footerImage[0].path);
        const result = await cloudinary.uploader.upload(req.files.footerImage[0].path, {
          folder: 'footer/images',
          width: 1000,
          crop: 'scale'
        });
        footerImage = result.secure_url;
        console.log('Footer image uploaded successfully:', footerImage);
      }
    }
  } catch (error) {
    console.error('File upload error:', error);
    return next(new ErrorHandler(`Error processing file upload: ${error.message}`, 500));
  }
  
  // Extract all form fields from request body
  const { 
    address, phone, description,
    socialIcons, recentPosts, dayTimes
  } = req.body;
  
  // Parse JSON strings if they're provided as strings
  let parsedSocialIcons = [];
  let parsedRecentPosts = [];
  let parsedDayTimes = [];
  
  try {
    if (socialIcons) {
      parsedSocialIcons = typeof socialIcons === 'string' ? JSON.parse(socialIcons) : socialIcons;
    }
    
    if (recentPosts) {
      parsedRecentPosts = typeof recentPosts === 'string' ? JSON.parse(recentPosts) : recentPosts;
    }
    
    if (dayTimes) {
      parsedDayTimes = typeof dayTimes === 'string' ? JSON.parse(dayTimes) : dayTimes;
    }
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return next(new ErrorHandler(`Error parsing form data: ${error.message}`, 400));
  }
  
  // Check if footer already exists for this user
  const existingFooter = await footerModel.findOne({ user: req.user.id });
  
  if (existingFooter) {
    // Update existing footer
    const updateData = {
      address, phone, description
    };
    
    // Add the new array fields if provided
    if (parsedSocialIcons && parsedSocialIcons.length > 0) {
      updateData.socialIcons = parsedSocialIcons;
    }
    
    if (parsedRecentPosts && parsedRecentPosts.length > 0) {
      updateData.recentPosts = parsedRecentPosts;
    }
    
    if (parsedDayTimes && parsedDayTimes.length > 0) {
      updateData.dayTimes = parsedDayTimes;
    }
    
    // Only update image URLs if new ones were uploaded
    if (logoUrl) updateData.logoUrl = logoUrl;
    if (footerImage) updateData.footerImage = footerImage;
    
    const footer = await footerModel.findOneAndUpdate(
      { user: req.user.id },
      updateData,
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      footer,
      message: "Footer updated successfully"
    });
  } else {
    // Create new footer
    const footerData = {
      user: req.user.id,
      address, phone
    };
    
    // Add the new array fields if provided
    if (parsedSocialIcons && parsedSocialIcons.length > 0) {
      footerData.socialIcons = parsedSocialIcons;
    }
    
    if (parsedRecentPosts && parsedRecentPosts.length > 0) {
      footerData.recentPosts = parsedRecentPosts;
    }
    
    if (parsedDayTimes && parsedDayTimes.length > 0) {
      footerData.dayTimes = parsedDayTimes;
    }
    
    // Add image URLs if uploaded or provided in request body
    if (req.body.logoUrl) {
      console.log('Using logoUrl from request body:', req.body.logoUrl);
      footerData.logoUrl = req.body.logoUrl;
    } else if (logoUrl) {
      console.log('Using logoUrl from file upload:', logoUrl);
      footerData.logoUrl = logoUrl;
    }
    if (footerImage) footerData.footerImage = footerImage;
    
    const footer = await footerModel.create(footerData);
    
    return res.status(201).json({
      success: true,
      footer,
      message: "Footer created successfully"
    });
  }
});

// Update footer - separate endpoint for partial updates
export const updateFooter = catchAsyncErrors(async (req, res, next) => {
  // Process file uploads if any
  let logoUrl = '';
  let footerImage = '';
  
  try {
    if (req.files) {
      console.log('Update - Files received:', Object.keys(req.files));
      
      // Process logo upload
      if (req.files.logo && req.files.logo.length > 0) {
        console.log('Update - Processing logo file:', req.files.logo[0].path);
        const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
          folder: 'footer/logos',
          width: 250,
          crop: 'scale'
        });
        logoUrl = result.secure_url;
        console.log('Update - Logo uploaded successfully:', logoUrl);
      }
      
      // Process footer image upload
      if (req.files.footerImage && req.files.footerImage.length > 0) {
        console.log('Update - Processing footer image file:', req.files.footerImage[0].path);
        const result = await cloudinary.uploader.upload(req.files.footerImage[0].path, {
          folder: 'footer/images',
          width: 1000,
          crop: 'scale'
        });
        footerImage = result.secure_url;
        console.log('Update - Footer image uploaded successfully:', footerImage);
      }
    }
  } catch (error) {
    console.error('Update - File upload error:', error);
    return next(new ErrorHandler(`Error processing file upload: ${error.message}`, 500));
  }

  // Get all fields from the request body
  const { 
    address, phone, description,
    socialIcons, recentPosts, dayTimes
  } = req.body;
  
  // Parse JSON strings if they're provided as strings
  let parsedSocialIcons = [];
  let parsedRecentPosts = [];
  let parsedDayTimes = [];
  
  try {
    if (socialIcons) {
      parsedSocialIcons = typeof socialIcons === 'string' ? JSON.parse(socialIcons) : socialIcons;
    }
    
    if (recentPosts) {
      parsedRecentPosts = typeof recentPosts === 'string' ? JSON.parse(recentPosts) : recentPosts;
    }
    
    if (dayTimes) {
      parsedDayTimes = typeof dayTimes === 'string' ? JSON.parse(dayTimes) : dayTimes;
    }
  } catch (error) {
    console.error('Error parsing JSON data in updateFooter:', error);
    return next(new ErrorHandler(`Error parsing form data: ${error.message}`, 400));
  }

  let footer = await footerModel.findOne({ user: req.user.id });

  if (!footer) {
    return next(new ErrorHandler("Footer not found", 404));
  }

  // Update only provided fields
  const updateData = {};
  
  // Add text fields if provided
  if (address !== undefined) updateData.address = address;
  if (phone !== undefined) updateData.phone = phone;
  if (description !== undefined) updateData.description = description;
  
  // Add the new array fields if provided
  if (socialIcons) {
    updateData.socialIcons = parsedSocialIcons;
  }
  
  if (recentPosts) {
    updateData.recentPosts = parsedRecentPosts;
  }
  
  if (dayTimes) {
    updateData.dayTimes = parsedDayTimes;
  }
  
  // Add image URLs if uploaded
  if (logoUrl) updateData.logoUrl = logoUrl;
  if (footerImage) updateData.footerImage = footerImage;

  footer = await footerModel.findOneAndUpdate(
    { user: req.user.id },
    { $set: updateData },
    { new: true }
  );

  res.status(200).json({
    success: true,
    footer,
    message: "Footer updated successfully"
  });
});

// Delete footer
export const deleteFooter = catchAsyncErrors(async (req, res, next) => {
  const footer = await footerModel.findOne({ user: req.user.id });

  if (!footer) {
    return next(new ErrorHandler("Footer not found", 404));
  }

  await footerModel.findByIdAndDelete(footer._id);

  res.status(200).json({
    success: true,
    message: "Footer deleted successfully"
  });
});

// Test endpoint with proper async handling for file uploads and DB operations
export const testFormData = async (req, res) => {
  try {
    console.log('Test endpoint hit!');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    

    let logoUrl = '';
    let footerImage = '';
    

    if (req.files) {
      try {
        // Process logo upload
        if (req.files.logo && req.files.logo.length > 0) {
          console.log('Processing logo file:', req.files.logo[0].path);
          const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
            folder: 'footer/logos',
            width: 250,
            crop: 'scale'
          });
          logoUrl = result.secure_url;
          console.log('Logo uploaded successfully:', logoUrl);
        }
        
        // Process footer image upload
        if (req.files.footerImage && req.files.footerImage.length > 0) {
          console.log('Processing footer image file:', req.files.footerImage[0].path);
          const result = await cloudinary.uploader.upload(req.files.footerImage[0].path, {
            folder: 'footer/images',
            width: 1000,
            crop: 'scale'
          });
          footerImage = result.secure_url;
          console.log('Footer image uploaded successfully:', footerImage);
        }
      } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({
          success: false,
          message: `Error processing file upload: ${error.message}`
        });
      }
    }
    
    // Extract form fields from request body
    const { address, phone, description } = req.body;
    
    // Parse JSON strings if they're provided as strings - wrap in try/catch for safety
    let parsedSocialIcons = [];
    let parsedRecentPosts = [];
    let parsedDayTimes = [];
    
    try {
      // Handle socialIcons field
      if (req.body.socialIcons) {
        parsedSocialIcons = typeof req.body.socialIcons === 'string' 
          ? JSON.parse(req.body.socialIcons) 
          : req.body.socialIcons;
        console.log('Parsed social icons:', parsedSocialIcons);
      }
      
      // Handle recentPosts field
      if (req.body.recentPosts) {
        parsedRecentPosts = typeof req.body.recentPosts === 'string' 
          ? JSON.parse(req.body.recentPosts) 
          : req.body.recentPosts;
        console.log('Parsed recent posts:', parsedRecentPosts);
      }
      
      // Handle dayTimes field
      if (req.body.dayTimes) {
        parsedDayTimes = typeof req.body.dayTimes === 'string' 
          ? JSON.parse(req.body.dayTimes) 
          : req.body.dayTimes;
        console.log('Parsed working days/times:', parsedDayTimes);
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      return res.status(400).json({
        success: false,
        message: `Error parsing form data: ${error.message}`
      });
    }
    
    const footerData = {
      address: address || '',
      phone: phone || '',
      description: description || ''
    };
    
    // Check for logoUrl directly from frontend
    console.log('Checking if logoUrl exists in request body:', req.body.logoUrl);
    
    // Add arrays only if they have content
    if (parsedSocialIcons && parsedSocialIcons.length > 0) {
      footerData.socialIcons = parsedSocialIcons;
    }
    
    if (parsedRecentPosts && parsedRecentPosts.length > 0) {
      footerData.recentPosts = parsedRecentPosts;
    }
    
    if (parsedDayTimes && parsedDayTimes.length > 0) {
      footerData.dayTimes = parsedDayTimes;
    }
    
    // Add image URLs if uploaded or provided in request body
    if (req.body.logoUrl) {
      console.log('Using logoUrl from request body:', req.body.logoUrl);
      footerData.logoUrl = req.body.logoUrl;
    } else if (logoUrl) {
      console.log('Using logoUrl from file upload:', logoUrl);
      footerData.logoUrl = logoUrl;
    }
    if (footerImage) footerData.footerImage = footerImage;
    
    console.log('Saving footer data:', footerData);
    
    // Check if footer already exists - there should only be one footer per user
    // For test endpoint, we'll check if any footer exists at all
    const existingFooter = await footerModel.findOne();
    
    let footer;
    if (existingFooter) {
      // Update existing footer instead of creating a new one
      console.log('Footer already exists, updating instead of creating new one');
      footer = await footerModel.findByIdAndUpdate(
        existingFooter._id,
        footerData,
        { new: true }
      );
    } else {
      // Create new footer if none exists
      footer = await footerModel.create(footerData);
    }
    
    // Return received data for verification
    return res.status(201).json({
      success: true,
      message: "Footer data added successfully",
      footer,
      body: req.body,
      files: req.files ? Object.keys(req.files) : []
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all footers (test endpoint without authentication)
export const getAllFootersTest = catchAsyncErrors(async (req, res) => {
  try {
    const footers = await footerModel.find();
    
    return res.status(200).json({
      success: true,
      count: footers.length,
      footers
    });
  } catch (error) {
    console.error('Error fetching all footers:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete footer (test endpoint without authentication)
export const deleteFooterTest = catchAsyncErrors(async (req, res) => {
  try {
    // Find the first footer (there should only be one per the business logic)
    const footer = await footerModel.findOne();
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: "No footer found to delete"
      });
    }
    
    await footerModel.findByIdAndDelete(footer._id);
    
    return res.status(200).json({
      success: true,
      message: "Footer deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting footer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Ultra simple test endpoint that does absolutely nothing but respond
export const debugFormData = (req, res) => {
  // Just return a success response without any processing
  return res.status(200).json({
    success: true,
    message: 'Debug endpoint successful - No processing done'
  });
};

// Dedicated endpoint for file uploads only
export const uploadFooterImage = async (req, res) => {
  try {
    console.log('File upload endpoint hit!');
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
    if (!req.files || !req.files.logo) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }
    
    // Process logo upload
    console.log('Processing logo file:', req.files.logo[0].path);
    const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
      folder: 'footer/logos',
      width: 250,
      crop: 'scale'
    });
    
    const logoUrl = result.secure_url;
    console.log('Logo uploaded successfully to Cloudinary:', logoUrl);
    
    // Return the Cloudinary URL
    return res.status(200).json({
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: `Error uploading file: ${error.message}`
    });
  }
};

// Get most recent footer (test endpoint without authentication)
export const getFooterTest = catchAsyncErrors(async (req, res) => {
  try {
    // Get the most recent footer entry
    const footer = await footerModel.findOne().sort({ createdAt: -1 });
    
    if (!footer) {
      return res.status(200).json({
        success: true,
        footer: null,
        message: "No footer data found"
      });
    }
    
    return res.status(200).json({
      success: true,
      footer
    });
  } catch (error) {
    console.error('Error fetching footer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update footer function is defined below

// Update footer (test endpoint without authentication)
export const updateFooterTest = catchAsyncErrors(async (req, res, next) => {
  try {
    // Find the first footer (there should only be one per the business logic)
    const footer = await footerModel.findOne();
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: "No footer found to update"
      });
    }
    
    // Process file uploads if any
    let logoUrl = '';
    let footerImage = '';
    
    if (req.files) {
      // Process logo upload
      if (req.files.logo && req.files.logo.length > 0) {
        console.log('Processing logo file:', req.files.logo[0].path);
        const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
          folder: 'footer/logos',
          width: 250,
          crop: 'scale'
        });
        logoUrl = result.secure_url;
      }
      
      // Process footer image upload
      if (req.files.footerImage && req.files.footerImage.length > 0) {
        console.log('Processing footer image file:', req.files.footerImage[0].path);
        const result = await cloudinary.uploader.upload(req.files.footerImage[0].path, {
          folder: 'footer/images',
          width: 1000,
          crop: 'scale'
        });
        footerImage = result.secure_url;
      }
    }
    
    // Get all fields from the request body
    const { 
      address, phone, socialIcons, recentPosts, dayTimes, logoUrl: receivedLogoUrl 
    } = req.body;
    
    // Parse JSON strings if they're provided as strings
    let parsedSocialIcons = [];
    let parsedRecentPosts = [];
    let parsedDayTimes = [];
    
    if (socialIcons) {
      parsedSocialIcons = typeof socialIcons === 'string' ? JSON.parse(socialIcons) : socialIcons;
      console.log('Test update - Social icons:', parsedSocialIcons);
    }
    
    if (recentPosts) {
      parsedRecentPosts = typeof recentPosts === 'string' ? JSON.parse(recentPosts) : recentPosts;
      console.log('Test update - Recent posts:', parsedRecentPosts);
    }
    
    if (dayTimes) {
      parsedDayTimes = typeof dayTimes === 'string' ? JSON.parse(dayTimes) : dayTimes;
      console.log('Test update - Working days/times:', parsedDayTimes);
    }
    
    // Update only provided fields
    const updateData = {};
    
    // Add text fields if provided
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    
    // Add the new array fields if provided
    if (socialIcons) {
      updateData.socialIcons = parsedSocialIcons;
    }
    
    if (recentPosts) {
      updateData.recentPosts = parsedRecentPosts;
    }
    
    if (dayTimes) {
      updateData.dayTimes = parsedDayTimes;
    }
    
    // Add image URLs if uploaded or provided in request body
    if (receivedLogoUrl) {
      console.log('Using logoUrl from request body in update:', receivedLogoUrl);
      updateData.logoUrl = receivedLogoUrl;
    } else if (logoUrl) {
      console.log('Using logoUrl from file upload in update:', logoUrl);
      updateData.logoUrl = logoUrl;
    }
    
    if (footerImage) updateData.footerImage = footerImage;
    
    try {
      const updatedFooter = await footerModel.findByIdAndUpdate(
        footerId,
        { $set: updateData },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        footer: updatedFooter,
        message: "Footer updated successfully"
      });
    } catch (error) {
      console.error('Error updating footer:', error);
      return res.status(500).json({
        success: false,
        message: `Error updating footer: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Error updating footer:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
