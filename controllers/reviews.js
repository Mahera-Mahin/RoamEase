const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id); // we don't modify listing fields!
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    await newReview.save();

    // Just push ID and save listing without triggering validation
    await Listing.updateOne({ _id: listing._id }, { $push: { reviews: newReview._id } });

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while adding the review.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

module.exports.destroyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    
    // Remove review from listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting the review.");
    res.redirect(`/listings/${req.params.id}`);
  }
};
