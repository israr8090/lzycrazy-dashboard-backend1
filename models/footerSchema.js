import mongoose from 'mongoose';

// Main Footer schema - matches fields from Footer.jsx component
const FooterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // File uploads
  logoUrl: {
    type: String,
    default: ''
  },
  footerImage: {
    type: String,
    default: ''
  },
  // Basic info
  title: {
    type: String,
    default: ''
  },
  // Description items
  faq: {
    type: String,
    default: ''
  },
  career: {
    type: String,
    default: ''
  },
  // Contact information
  address: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  // Business hours
  weekday: {
    type: String,
    default: ''
  },
  saturday: {
    type: String,
    default: ''
  },
  // Legal links
  terms: {
    type: String,
    default: ''
  },
  privacy: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

export const footerModel = mongoose.model('Footer', FooterSchema);
