const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

// Show all listings
module.exports.index = async (req, res) => {
  const listings = await Listing.find({}).populate("owner");
  res.render("listings/index.ejs", { listings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Show a single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    });

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

function validateListingData(req) {
  const { error } = listingSchema.validate({ listing: req.body.listing });
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
}

// Create a new listing
module.exports.createListing = async (req, res) => {
  try {
    if (req.body.listing.owner) delete req.body.listing.owner;
    validateListingData(req);

    const newListing = new Listing(req.body.listing);

    // Add image (if uploaded)
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Set owner
    newListing.owner = req.user._id;

    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", err.message || "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
  }
};

// Render the edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image?.url?.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

// Update a listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const updatedData = req.body.listing;

  // Update image if new one uploaded
  if (req.file) {
    updatedData.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  // Remove owner from updatedData before validation
  if (updatedData.owner) delete updatedData.owner;
  validateListingData({ body: { listing: updatedData } });

  await Listing.findByIdAndUpdate(id, updatedData, { new: true });
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// Delete a listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};
