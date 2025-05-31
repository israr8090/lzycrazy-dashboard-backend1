import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { footerModel } from '../models/footerSchema.js';
import { v2 as cloudinary } from 'cloudinary';

// Get footer data
export const getFooter = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

  const footer = await footerModel.findOne({ admin: userId });

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
    title, faq, career, address, email, 
    weekday, saturday, terms, phone, privacy 
  } = req.body;
  
  // Check if footer already exists for this user
  const existingFooter = await footerModel.findOne({ admin: req.user.id });
  
  if (existingFooter) {
    // Update existing footer
    const updateData = {
      title, faq, career, address, email,
      weekday, saturday, terms, phone, privacy
    };
    
    // Only update image URLs if new ones were uploaded
    if (logoUrl) updateData.logoUrl = logoUrl;
    if (footerImage) updateData.footerImage = footerImage;
    
    const footer = await footerModel.findOneAndUpdate(
      { admin: req.user.id },
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
      admin: req.user.id,
      title, faq, career, address, email,
      weekday, saturday, terms, phone, privacy
    };
    
    // Add image URLs if uploaded
    if (logoUrl) footerData.logoUrl = logoUrl;
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
    title, faq, career, address, email, 
    weekday, saturday, terms, phone, privacy 
  } = req.body;

  let footer = await footerModel.findOne({ admin: req.user.id });

  if (!footer) {
    return next(new ErrorHandler("Footer not found", 404));
  }

  // Update only provided fields
  const updateData = {};
  
  // Add text fields if provided
  if (title !== undefined) updateData.title = title;
  if (faq !== undefined) updateData.faq = faq;
  if (career !== undefined) updateData.career = career;
  if (address !== undefined) updateData.address = address;
  if (email !== undefined) updateData.email = email;
  if (weekday !== undefined) updateData.weekday = weekday;
  if (saturday !== undefined) updateData.saturday = saturday;
  if (terms !== undefined) updateData.terms = terms;
  if (phone !== undefined) updateData.phone = phone;
  if (privacy !== undefined) updateData.privacy = privacy;
  
  // Add image URLs if uploaded
  if (logoUrl) updateData.logoUrl = logoUrl;
  if (footerImage) updateData.footerImage = footerImage;

  footer = await footerModel.findOneAndUpdate(
    { admin: req.user.id },
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
  const footer = await footerModel.findOne({ admin: req.user.id });

  if (!footer) {
    return next(new ErrorHandler("Footer not found", 404));
  }

  await footerModel.findByIdAndDelete(footer._id);

  res.status(200).json({
    success: true,
    message: "Footer deleted successfully"
  });
});

// Test endpoint for direct form data testing (no authentication required)
export const testFormData = catchAsyncErrors(async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
    // Return received data for verification
    return res.status(200).json({
      success: true,
      message: "Data received successfully",
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
});






