import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("Error:", error);
    if (error?.name === "MulterError") {
        const message =
            error.code === "LIMIT_FILE_SIZE"
                ? "Uploaded file is too large"
                : error.message || "File upload error";
        res.status(400).json({ success: false, message });
        return;
    }
    if (typeof error?.message === "string" && error.message.toLowerCase().includes("invalid file type")) {
        res.status(400).json({ success: false, message: error.message });
        return;
    }
    if (error instanceof mongoose.Error.ValidationError){
        const messages = Object.values(error.errors).map((err) => err.message);
        res.status(400).json({success: false, message: 'Validation Error', errors: messages});
        return;
    }
    if (error.code === 11000){
        const field = Object.keys(error.keyPattern)[0];
        res.status(409).json({success: false, message: `${field} already exists`});
        return;
    }
    if (error instanceof mongoose.Error.CastError){
        res.status(400).json({success: false, message: 'Invalid ID format'});
        return;
    }
    if (error.name === 'TokenExpiredError'){
        res.status(401).json({success: false, message: 'Token expired'});
        return;
    }
    res.status(error.statusCode || 500).json({success: false, message: error.message || 'Internal Server Error', ...(process.env.NODE_ENV === 'development' && {stack: error.stack})});
};

const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({success: false, message: `Route  ${req.originalUrl} not found`});
};

export {errorHandler, notFoundHandler};