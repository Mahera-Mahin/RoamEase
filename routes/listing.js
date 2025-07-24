const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});



const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body.listing);
  if(error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router
  .route("/")
  .get( wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('image'), wrapAsync(listingController.createListing)
  );

  // New Listing Form
router.get("/new", isLoggedIn, listingController.renderNewForm );


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner,  upload.single('image'), wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner,  wrapAsync(listingController.destroyListing)
  );


// Edit Form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;