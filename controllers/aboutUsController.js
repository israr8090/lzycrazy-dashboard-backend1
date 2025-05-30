import { AboutUs } from "../models/aboutUsModel.js";

// Create AboutUs entry
export const addAboutUs = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    const about = await AboutUs.create({
      title,
      description,
      image,
      user: req.user._id,
    });

    res.status(201).json({ message: "About Us created successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to create About Us", error });
  }
};

// Get all AboutUs entries
export const getAboutUs = async (req, res) => {
  try {
    const data = await AboutUs.find().populate("user", "name email");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch About Us", error });
  }
};

// Update AboutUs
export const updateAboutUs = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const about = await AboutUs.findById(req.params.id);

    if (!about) return res.status(404).json({ message: "About Us not found" });

    if (title) about.title = title;
    if (description) about.description = description;
    if (image) about.image = image;

    await about.save();

    res.json({ message: "About Us updated successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to update About Us", error });
  }
};

// Remove AboutUs image
export const removeAboutImage = async (req, res) => {
  try {
    const about = await AboutUs.findById(req.params.id);
    if (!about) return res.status(404).json({ message: "About Us not found" });

    about.image = "";
    await about.save();

    res.json({ message: "Image removed successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove image", error });
  }
};

// Delete AboutUs entry
export const deleteAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ message: "About Us not found" });

    res.json({ message: "About Us deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete About Us", error });
  }
};
