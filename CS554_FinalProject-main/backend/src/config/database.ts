import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set. Please check your .env file.');
        }
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

export default connectDB;