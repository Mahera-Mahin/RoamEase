const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");
const sampleListings = require("./data.js");

// MongoDB connection string
const MONGO_URI = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Database initialized successfully!");
}).catch(err => {
    console.error("Error initializing database:", err);
});

async function main() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB for initialization");
        await initDB();
        await mongoose.connection.close();
    } catch (err) {
        console.error("Error during database initialization:", err);
        process.exit(1);
    }
}

async function initDB() {
    await Listing.deleteMany({});

    // Get a user to assign as owner
    let user = await User.findOne();
    if (!user) {
        user = new User({
            username: "admin",
            email: "admin@example.com"
        });
        await user.save();
    }

    // Assign listings to user without geometry
    const listingsWithOwner = sampleListings.map(listing => {
        return {
            ...listing,
            owner: user._id
        };
    });

    await Listing.insertMany(listingsWithOwner);
    console.log("Sample listings added to the database");
}
