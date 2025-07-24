const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review= require("../models/review.js");
const Listing = require("../models/listing.js");
const { isReviewAuthor,validateReview, isLoggedIn } = require("../middleware.js");



const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");


// Create Review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
// Delete Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;