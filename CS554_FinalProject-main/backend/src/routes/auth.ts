import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {User} from '../models/index';
import {jwtUtils} from '../utils/jwt';
import {handleValidationErrors} from '../utils/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const registerValidation = [
    body('firstName').trim().isLength({min: 2, max: 50}).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').trim().isLength({min: 2, max: 50}).withMessage('Last name must be between 2 and 50 characters'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').trim().isLength({min: 16}).withMessage('Password must be at least 16 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16,}$/).withMessage('Password must include uppercase, lowercase, number, and symbol'),
    body('age').optional().isInt({min: 16, max: 120}).withMessage('Age must be between 16 and 120'),
    body('height').optional().isFloat({min: 24, max: 96}).withMessage('Height must be between 2 and 8 feet'),
    body('weight').optional().isFloat({min: 44, max: 1100}).withMessage('Weight must be between 44 and 1100 lbs'),
];

const loginValidation = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').trim().isLength({min: 16}).withMessage('Password must be at least 16 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16,}$/).withMessage('Password must include uppercase, lowercase, number, and symbol'),
];

router.post('/register', registerValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstName, lastName, email, password, age, height, weight} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            res.status(400).json({success: false, message: 'User already exists'});
            return;
        }
        
        const userData: any = {firstName, lastName, email, password};
        if (age !== undefined && age !== null) userData.age = age;
        if (height !== undefined && height !== null) userData.height = height;
        if (weight !== undefined && weight !== null) userData.weight = weight;
        
        const user = await User.create(userData);
        const token = jwtUtils.generateToken({userId: user._id.toString(), email: user.email});
        res.status(201).json({success: true, message: 'User registered successfully', data: {token, user: {id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, age: user.age, height: user.height, weight: user.weight, createdAt: user.createdAt}}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error registering user', error: error instanceof Error ? error.message: 'Unknown error'});
    }
});

router.post('/login', loginValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+password');
        if (!user){
            res.status(401).json({success: false, message: 'Invalid email or password'});
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid){
            res.status(401).json({success: false, message: 'Invalid email or password'});
            return;
        }
        const token = jwtUtils.generateToken({userId: user._id.toString(), email: user.email});
        res.status(200).json({success: true, message: 'Login successful', data: {token, user: {id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, age: user.age, height: user.height, weight: user.weight, goalWeight: user.goalWeight, profilePicture: user.profilePicture, createdAt: user.createdAt}}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error logging in', error: error instanceof Error ? error.message: 'Unknown error'});
    }
});

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user){
            res.status(404).json({success: false, message: 'User not found'});
            return;
        }
        res.status(200).json({success: true, data: {id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, age: user.age, height: user.height, weight: user.weight, goalWeight: user.goalWeight, profilePicture: user.profilePicture, createdAt: user.createdAt}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching user', error: error instanceof Error ? error.message: 'Unknown error'});
    }
});

export default router;