if( process.env.NODE_ENV != "production"){
  require("dotenv").config();
}
console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");

// Models
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const port = process.env.PORT || 3000;
const dburl = process.env.ATLASDB_URL;
async function main() {
  try {
    await mongoose.connect(dburl);
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Run DB connection
main();

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true })); //  Form data parser
app.use(methodOverride("_method"));              //  To support PUT/DELETE via forms
app.use(express.static(path.join(__dirname, "public"))); // ✅ Static files


const store = MongoStore.create({
  mongoUrl: dburl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo Store", err);
});

// Session & Flash Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET, // Should be stored in .env in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};


app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // Ensure currentUser is always defined, even if req.user is undefined
  res.locals.currentUser = req.user || null; // Or an empty object: req.user || {};
  next();
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings/:id/reviews", reviewsRouter);
app.use("/listings", listingRouter);
app.use("/", userRouter);

// 404 Not Found Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});
