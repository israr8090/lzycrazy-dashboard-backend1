import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bannerSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const bannerModel =  model("Banner", bannerSchema);