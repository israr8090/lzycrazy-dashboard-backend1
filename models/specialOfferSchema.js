import mongoose from 'mongoose';

const SpecialOfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin reference is required']
  }
}, {
  timestamps: true
});

export const specialOfferModel = mongoose.model('SpecialOffer', SpecialOfferSchema);
