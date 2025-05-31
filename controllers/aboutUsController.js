import { AboutUs } from "../models/aboutUsModel.js";

// Create AboutUs entry with image upload
export const addAboutUs = async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { title, description } = req.body;

    // Validation: title और description जरूर चाहिए
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    let image = "";

    if (req.file) {
      image = req.file.path;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const aboutData = {
      title,
      description,
      image,
    };

    if (req.user && req.user._id) {
      aboutData.user = req.user._id;
    } else {
      console.warn("Warning: No user found in request");
      // चाहें तो unauthorized error भी भेज सकते हैं:
      // return res.status(401).json({ message: "Unauthorized, please login" });
    }

    const about = await AboutUs.create(aboutData);

    res.status(201).json({ message: "About Us created successfully", about });
  } catch (error) {
    console.error("Error in addAboutUs:", error);
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

// Update AboutUs entry with optional image upload
export const updateAboutUs = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description && !req.file && !req.body.image) {
      return res.status(400).json({ message: "At least one field is required to update" });
    }

    const about = await AboutUs.findById(req.params.id);
    if (!about) return res.status(404).json({ message: "About Us not found" });

    if (title) about.title = title;
    if (description) about.description = description;

    if (req.file) {
      about.image = req.file.path;
    } else if (req.body.image) {
      about.image = req.body.image;
    }

    await about.save();

    res.json({ message: "About Us updated successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to update About Us", error });
  }
};

// Remove AboutUs image (clear the image field)
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
