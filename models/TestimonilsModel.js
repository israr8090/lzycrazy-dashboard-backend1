import mongoose from "mongoose";

const TestimonialsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    head_title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonials", TestimonialsSchema);
