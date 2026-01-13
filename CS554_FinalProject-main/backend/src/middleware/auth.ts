import {Request, Response, NextFunction} from 'express';
import { jwtUtils, SERVER_START_TIME_SEC } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({success: false, message: 'No token provided. Authentication required.'});
            return;
        }
        const token = authHeader.substring(7);
        const decoded = jwtUtils.verifyToken(token);
        if (!decoded) {
            res.status(401).json({success: false, message: 'Invalid or expired token.'});
            return;
        }
        if (!decoded.iat || decoded.iat < SERVER_START_TIME_SEC) {
            res.status(401).json({success: false, message: 'Token is no longer valid. Please log in again.'});
            return;
        }
        req.user = {userId: decoded.userId, email: decoded.email};
        next();
    } catch (error) {
        res.status(500).json({success: false, message: 'Authentication error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')){
            const token = authHeader.substring(7);
            const decoded = jwtUtils.verifyToken(token);
            if (decoded && decoded.iat && decoded.iat >= SERVER_START_TIME_SEC){
                req.user = {userId: decoded.userId, email: decoded.email};
            }
        }
        next();
    } catch (error) {
        next();
    }
};