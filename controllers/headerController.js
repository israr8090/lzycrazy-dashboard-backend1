import { headerModel } from "../models/headerSchema.js";
import {uploadToCloudinary} from "../utils/cloudinary.js"

const createHeader = async (req, res) => {
  const { title, description } = req.body;
    console.log("controller header create called")
  if (!req.file) {
    return res.status(400).json({ error: "Logo image is required." });
  }

  try {
    const logoUrl = await uploadToCloudinary(req.file.path);

    const header = await headerModel.create({
      title,
      description,
      logoUrl: logoUrl,
      admin: req.user._id
    });

    res.status(201).json({
      message: "Company created successfully",
      header,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {createHeader}
