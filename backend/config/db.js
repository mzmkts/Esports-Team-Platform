const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:");
        console.error(err.message);
        console.error(err);

        process.exit(1);
    }
};

module.exports = connectDB;