import mongoose from 'mongoose';

const SocialLinkSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  platform: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  link: {
    type: String,
    required: true
  }
});

// Recent post schema - matches recentPosts in Footer.jsx
const RecentPostSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
});
const DayTimeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  day: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  }
});

const FooterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  logoUrl: {
    type: String,
    default: ''
  },
  socialIcons: [SocialLinkSchema],
  recentPosts: [RecentPostSchema],
  dayTimes: [DayTimeSchema],
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true 
});

export const footerModel = mongoose.model('Footer', FooterSchema);
