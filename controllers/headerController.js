
import { headerModel } from '../models/headerSchema.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Validation for NavItems 
function validateNavItems(arr) {
  if (!Array.isArray(arr)) return false;
  for (const item of arr) {
    if (
      typeof item.label !== 'string' ||
      item.label.trim() === '' ||
      typeof item.link !== 'string' ||
      item.link.trim() === ''
    ) {
      return false;
    }
    // Optionally, ensure link is a URL or path
    if (!item.link.startsWith('/')) return false;
  }
  return true;
}



/**
 * GET /api/header
 * Returns the header (logoUrl + navItems) for the authenticated admin.
 */
export const getHeader = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const header = await headerModel.findOne({ admin: userId }).populate('admin', 'fullName email');
    if (!header) {
      return res.status(404).json({ error: 'Header not found.' });
    }
    res.status(200).json(header);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/header
 * Creates a new header document for the authenticated admin.
 * Expects:
 *   - req.file (logo image)
 *   - req.body.navItems: JSON array of { label, link }
 */
export const createHeader = async (req, res) => {
  // check if header already exists 
  const existingHeader = await headerModel.findOne({ admin: req.user._id });
  if (existingHeader) {
    return res.status(400).json({ error: 'Header already exists. Use PUT to update the header.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Logo image is required.' });
  }
// console.log("req.body", req.body.navItems);
  let navItems = [];
  if (req.body.navItems) {
    try {
      navItems = JSON.parse(req.body.navItems);
    } catch {
      return res.status(400).json({ error: 'Invalid navItems JSON.' });
    }
    if(!validateNavItems(navItems)){
      return res.status(400).json({ error: 'Invalid navItems format. Each item must have a label and link.' });
    }
  }

  try {
    const logoUrl = await uploadToCloudinary(req.file.path);
    if(!logoUrl){
      return res.status(500).json({ error: 'Failed to upload logo image.' });
    }

    const header = await headerModel.create({
      logoUrl,
      navItems,
      admin: req.user._id,
    });
    res.status(201).json({ message: 'Header created.', header });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/header
 * Updates the existing header for this admin.
 * If a new logo file is provided, replaces it.
 * Expects same body as POST.
 */
export const updateHeader = async (req, res) => {
  try {
    if (!req.file && !req.body.navItems) {
      return res
      .status(400)
      .json({ error: 'Nothing to update—send a new logo or navItems.' });
    }

    const header = await headerModel.findOne({ admin: req.user._id });
    if (!header) {
      return res.status(404).json({ error: 'Header not found.' });
    }

    // Parse navItems if provided
    if (req.body.navItems) {
      try {
        header.navItems = JSON.parse(req.body.navItems);
      } catch {
        return res.status(400).json({ error: 'Invalid navItems JSON.' });
      }
      if(!validateNavItems(header.navItems)){
        return res.status(400).json({ error: 'Invalid navItems format. Each item must have a label and link.' });
      }
    }

    // If user uploaded a new logo, upload & replace
    if (req.file) {
      const newLogoUrl = await uploadToCloudinary(req.file.path);
      if(!newLogoUrl){
        return res.status(500).json({ error: 'Failed to upload logo image.' });
      }
      header.logoUrl = newLogoUrl;
    }

    await header.save();
    res.json({ message: 'Header updated.', header });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/header
 * Deletes the header for this admin.
 */
export const deleteHeader = async (req, res) => {
  try {
    const deleted = await headerModel.findOneAndDelete({ admin: req.user._id });
    if (!deleted) {
      return res.status(404).json({ error: 'Header not found.' });
    }
    res.json({ message: 'Header deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
