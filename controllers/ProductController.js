import ProductModel from "../models/ProductModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createProduct = async (req, res, next) => {
  const { title, description } = req.body;

  console.log("controller header create called");
  if (!req.file) {
    return res.status(400).json({ error: "Logo image is required." });
  }

  try {
    const imageFile = await uploadToCloudinary(req.file.path);

    const products = await ProductModel.create({
      title,
      description,
      image: imageFile,
      admin: req.user._id,
    });

    res.status(201).json({
      message: "Products created successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
