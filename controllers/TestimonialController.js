import TestimonilsModel from "../models/TestimonilsModel.js";

export const createteTimonials = async (req, res) => {
  try {
    const { title, description } = req.body;
    const adminId = req.user?._id;
    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description is required",
      });
    }

    const testimonil = await TestimonilsModel.create({
      title,
      description,
      admin: adminId,
    });

    res.status(200).send({ success: true, message: "Item Addes", testimonil });
  } catch (error) {
    console.log(error);
    res.json("Error in creating testimonila", error);
  }
};

export const UpdateTimonials = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description is required",
      });
    }

    const testimonil = await TestimonilsModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    res
      .status(200)
      .send({ success: true, message: "Item Updated", testimonil });
  } catch (error) {
    console.log(error);
    res.json("Error in updating testimonila", error);
  }
};

export const getAllTestimonials = async (req, res) => {
  const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
  try {
    const testimonil = await TestimonilsModel.find({ admin: userId });
    if (!testimonil || testimonil.length === 0) {
      return res.json({ success: false, message: "No testimonials found" });
    }
    res.status(200).json(testimonil);
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
    res.status(200).json(testimonil);
  } catch (error) {
    console.log(error);
    res.json("Error in Deleting testimonils", error);
  }
};
