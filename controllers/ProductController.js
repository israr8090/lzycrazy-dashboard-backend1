import ProductModel from "../models/ProductModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createProduct = async (req, res, next) => {
  try {
    const { title, price } = req.body;
    const imageFile = await uploadToCloudinary(req.file.path);
    if (!imageFile) {
      return res.json({ message: "Image not seleted" });
    }
    const products = await ProductModel.create({
      title,
      price,
      image: imageFile,
      admin: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Products created successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateProduct = async (req, res, next) => {
  try {
    const updateFields = {};

    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.price) updateFields.price = req.body.price;

    // If a new image file is uploaded
    if (req.file) {
      const imageFile = await uploadToCloudinary(req.file.path);
      updateFields.image = imageFile;
    }

    updateFields.admin = req.user._id; // Optional, if you always want to track the last editor

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      products: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const DeleteProducts = async (req, res) => {
  try {
    const products = await ProductModel.findByIdAndDelete(req.params.id);
    if (products && products.length === 0) {
      res.json({ success: false, message: "Products not found" });
    }

    res.status(201).json({ success: true, message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const adminId = req.user?._id; // Get the user ID from the middleware

    if (!adminId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const products = await ProductModel.find({ admin: adminId });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
