const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Define the schema for a Listing
const listingSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  image: {
    url: String,
    filename: String
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"]
  },
  location: {
    type: String,
    required: [true, "Location is required"]
  },
  country: {
    type: String,
    required: [true, "Country is required"]
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

// Middleware: Delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.reviews && doc.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
