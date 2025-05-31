import { Schema, model } from "mongoose";

// Define schema for navigation items
const NavItemSchema = new Schema({
  label: String,
  link: String,
});

// Define main header schema with logo, nav items, and admin reference
const headerSchema = new Schema({
  logoUrl: String,
  navItems: [NavItemSchema],
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const headerModel =  model("Header", headerSchema);
