import TestimonilsModel from "../models/TestimonilsModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createteTimonials = async (req, res) => {
  try {
    const { title, description, head_title } = req.body;
    const adminId = req.user?._id;

    if (!title || !description || !head_title) {
      return res.json({
        success: false,
        message: "Title, head title and description are required",
      });
    }

    let imageFile = null;

    // Upload image if provided
    if (req.file && req.file.path) {
      imageFile = await uploadToCloudinary(req.file.path);
    }

    const testimonial = await TestimonilsModel.create({
      title,
      description,
      head_title,
      image: imageFile, // can be null if not uploaded
      admin: adminId,
    });

    res.status(200).send({
      success: true,
      message: "Testimonial added successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Error in creating testimonial:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const UpdateTimonials = async (req, res) => {
  try {
    const updateFields = {};

    // Update text fields if present
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.head_title) updateFields.head_title = req.body.head_title;
    if (req.body.description) updateFields.description = req.body.description;

    // Only update image if a new file is uploaded
    if (req.file) {
      const imageFile = await uploadToCloudinary(req.file.path);
      updateFields.image = imageFile;
    }

    // Optionally track the admin who made the update
    updateFields.admin = req.user._id;

    // Update the testimonial in DB
    const updatedTestimonial = await TestimonilsModel.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error("Error in updating testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating testimonial",
      error: error.message,
    });
  }
};

export const getAllTestimonials = async (req, res) => {
  const adminId = req.user._id;
  if (!adminId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const testimonil = await TestimonilsModel.find({ admin: adminId });
    if (!testimonil || testimonil.length === 0) {
      return res.json({ success: false, message: "No testimonials found" });
    }
    res.status(200).json({ success: true, testimonil });
  } catch (error) {
    console.log(error);
    res.json("Error in updating testimonila", error);
  }
};

export const DeleteTestimonials = async (req, res) => {
  try {
    const testimonil = await TestimonilsModel.findByIdAndDelete(req.params.id);
    if (!testimonil) {
      return res.json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ success: true, message: "Item Deleted" });
  } catch (error) {
    console.log(error);
    res.json("Error in Deleting testimonils", error);
  }
};
