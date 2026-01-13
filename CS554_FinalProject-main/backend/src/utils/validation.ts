import { validationResult, ValidationError } from "express-validator";
import {Request, Response, NextFunction} from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const errorMessages = errors.array().map((error: ValidationError) => {
            if (error.type === 'field') return `${error.path}: ${error.msg}`;
            return error.msg;
        });
        res.status(400).json({success: false, message: 'Validation failed', errors: errorMessages,});
        return;
    }
    next();
};

export const isValidObjectId = (id: string): boolean => {return /^[0-9a-fA-F]{24}$/.test(id);};

export const sanitizeInput = (input: string): string => {return input.trim().replace(/[<>]/g, '');};