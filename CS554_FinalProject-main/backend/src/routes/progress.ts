import express, {Request, Response} from 'express';
import {body, param} from 'express-validator';
import {Progress, WeightProgress, PRExercise, PRProgress} from '../models/index';
import {authenticate} from '../middleware/auth';
import {handleValidationErrors, isValidObjectId} from '../utils/validation';
import {cacheUtils} from '../config/redis';
import multer from 'multer';
import { minioUtils } from '../config/minio';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'));
        }
    },
});

const progressValidation = [
    body('type').isIn(['weight', 'pr', 'measurement', 'photo']).withMessage('Invalid progress type'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('weight').if(body('type').equals('weight')).isFloat({min: 0.1, max: 1100}).withMessage('Invalid weight value'),
    body('exercise').if(body('type').equals('pr')).trim().notEmpty().withMessage('Exercise name is required'),
    body('prValue').if(body('type').equals('pr')).isFloat({min: 0, max: 1000}).withMessage('Invalid PR value')
];

const weightProgressValidation = [
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('weight').isFloat({ min: 0.1, max: 1100 }).withMessage('Invalid weight value'),
];

const prExerciseValidation = [
    body('name').trim().notEmpty().withMessage('Exercise name is required'),
    body('unit').optional().isIn(['lbs', 'reps', 'time']).withMessage('Invalid unit'),
];

const prExerciseUpdateValidation = [
    body('name').optional().trim().notEmpty().withMessage('Exercise name cannot be empty'),
    body('unit').optional().isIn(['lbs', 'reps', 'time']).withMessage('Invalid unit'),
];

const prProgressValidation = [
    body('prExerciseId').custom(isValidObjectId).withMessage('Invalid PR exercise ID'),
    body('value').isFloat({ min: 0.0001 }).withMessage('Invalid PR value'),
];


router.post('/weight', authenticate, upload.array('photos', 5), weightProgressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, weight, notes } = req.body;
        const userId = req.user?.userId;
        const files = req.files as Express.Multer.File[];
        const photoUrls: string[] = [];
        if (files?.length) {
            for (const file of files) {
                const fileName = minioUtils.generatefileName(file.originalname, userId!);
                await minioUtils.uploadFile(fileName, file.buffer, file.mimetype);
                photoUrls.push(`${req.protocol}://${req.get('host')}/api/files/${encodeURIComponent(fileName)}`);
            }
        }

        const entry = await WeightProgress.create({userId, weight, date: date || new Date(), photos: photoUrls, notes});
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(201).json({success: true, message: 'Weight entry created', data: entry,});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating weight entry', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/weight', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {startDate, endDate, page = 1, limit = 20} = req.query;
        const userId = req.user?.userId;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const query: any = {userId};
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }
        const cacheKey = `weight-progress:${userId}:page:${pageNum}`;
        const cached = await cacheUtils.get(cacheKey);
        if (cached) {
            res.status(200).json({ success: true, data: cached });
            return;
        }
        const entries = await WeightProgress.find(query).sort({date: -1}).skip(skip).limit(limitNum);
        const total = await WeightProgress.countDocuments(query);
        const response = {entries, pagination: {currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalEntries: total}};
        await cacheUtils.set(cacheKey, response, 300);
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching weight progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/weight/:progressId', authenticate, param('progressId').custom(isValidObjectId), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const { progressId } = req.params;
        const userId = req.user!.userId;
        const progress = await WeightProgress.findById(progressId);
        if (!progress) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        if (progress.userId !== userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching weight entry', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.put('/weight/:progressId', authenticate, param('progressId').custom(isValidObjectId), weightProgressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user!.userId;
        const {weight, date, notes} = req.body;
        const progress = await WeightProgress.findById(progressId);
        if (!progress) {
            res.status(404).json({ success: false, message: 'Entry not found' });
            return;
        }
        if (progress.userId !== userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const updated = await WeightProgress.findByIdAndUpdate(progressId, {weight, date, notes}, {new: true, runValidators: true});
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(200).json({success: true, message: 'Weight entry updated', data: updated});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating weight entry', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/weight/:progressId', authenticate, param('progressId').custom(isValidObjectId), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user!.userId;
        const progress = await WeightProgress.findById(progressId);
        if (!progress) {
            res.status(404).json({success: false, message: 'Entry not found'});
            return;
        }
        if (progress.userId !== userId) {
            res.status(403).json({success: false, message: 'Unauthorized'});
            return;
        }
        if (progress.photos?.length) {
            for (const photoUrl of progress.photos) {
                const fileName = photoUrl.split('/').pop();
                if (fileName) await minioUtils.deleteFile(fileName);
            }
        }
        await WeightProgress.findByIdAndDelete(progressId);
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(200).json({success: true, message: 'Weight entry deleted'});
    } catch (error) {
      res.status(500).json({success: false, message: 'Error deleting weight entry', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});


router.get('/pr/exercises', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const exercises = await PRExercise.find({ userId }).sort({ name: 1 });
        res.status(200).json({success: true, data: exercises});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching PR exercises'});
    }
});

router.post('/pr/exercises', authenticate, prExerciseValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, unit = 'lbs'} = req.body;
        const userId = req.user!.userId;
        const exercise = await PRExercise.create({userId, name, unit});
        res.status(201).json({success: true, data: exercise});
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({success: false, message: 'Exercise already exists'});
            return;
        }
        res.status(500).json({success: false, message: 'Error creating PR exercise', error: error.message});
    }
});

router.put('/pr/exercises/:exerciseId', authenticate, param('exerciseId').custom(isValidObjectId), prExerciseUpdateValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {exerciseId} = req.params;
        const {name, unit} = req.body;
        const userId = req.user!.userId;
        const exercise = await PRExercise.findById(exerciseId);
        if (!exercise || exercise.userId !== userId) {
            res.status(404).json({success: false, message: 'Exercise not found'});
            return;
        }

        if (unit && unit !== exercise.unit) {
            const hasPRs = await PRProgress.exists({prExerciseId: exerciseId});
            if (hasPRs) {
                res.status(400).json({success: false, message: 'Cannot change unit after PRs have been recorded'});
                return;
            }
        }

        if (name !== undefined) exercise.name = name;
        if (unit !== undefined) exercise.unit = unit;

        await exercise.save();
        res.status(200).json({success: true, data: exercise});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating PR exercise', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/pr/exercises/:exerciseId', authenticate, param('exerciseId').custom(isValidObjectId), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {exerciseId} = req.params;
        const userId = req.user!.userId;
        const exercise = await PRExercise.findById(exerciseId);
        if (!exercise || exercise.userId !== userId) {
            res.status(404).json({ success: false, message: 'Exercise not found' });
            return;
        }
        await PRProgress.deleteMany({ prExerciseId: exerciseId });
        await PRExercise.findByIdAndDelete(exerciseId);
        res.status(200).json({success: true, message: 'Exercise deleted'});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting PR exercise'});
    }
});


router.get('/pr/progress/:exerciseId', authenticate, param('exerciseId').custom(isValidObjectId), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {exerciseId} = req.params;
        const userId = req.user!.userId;
        const exercise = await PRExercise.findById(exerciseId);
        if (!exercise || exercise.userId !== userId) {
            res.status(404).json({success: false, message: 'PR exercise not found'});
            return;
        }
        const prs = await PRProgress.find({userId, prExerciseId: exerciseId}).sort({ createdAt: -1 });
        res.status(200).json({success: true, data: {exercise, prs, current: prs[0] || null}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching PR history', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.post('/pr/progress', authenticate, prProgressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {prExerciseId, value} = req.body;
        const userId = req.user!.userId;
        const exercise = await PRExercise.findById(prExerciseId);
        if (!exercise || exercise.userId !== userId) {
            res.status(404).json({success: false, message: 'PR exercise not found'});
            return;
        }

        const numericValue = Number(value);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            res.status(400).json({ success: false, message: 'PR value must be greater than 0' });
            return;
        }
        if (exercise.unit === 'reps' || exercise.unit === 'time') {
            if (!Number.isInteger(numericValue)) {
                res.status(400).json({ success: false, message: 'PR value must be a whole number' });
                return;
            }
        }

        const pr = await PRProgress.create({userId, prExerciseId, value});
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(201).json({success: true, message: 'PR recorded', data: pr});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error recording PR', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/pr/progress/:prId', authenticate, param('prId').custom(isValidObjectId), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {prId} = req.params;
        const userId = req.user!.userId;
        const pr = await PRProgress.findById(prId);
        if (!pr || pr.userId !== userId) {
            res.status(404).json({success: false, message: 'PR not found'});
            return;
        }
        await PRProgress.findByIdAndDelete(prId);
        res.status(200).json({success: true, message: 'PR deleted successfully'});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting PR'});
    }
});


router.post('/', authenticate, upload.array('photos', 5), progressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {type, date, weight, exercise, prValue, measurement, notes} = req.body;
        const userId = req.user?.userId;
        const files = req.files as Express.Multer.File[];
        const measurementData = measurement && typeof measurement === 'string' ? JSON.parse(measurement) : measurement;
        const photoUrls: string[] = [];
        if (files && files.length > 0){
            for (const file of files){
                const fileName = minioUtils.generatefileName(file.originalname, userId!);
                await minioUtils.uploadFile(fileName, file.buffer, file.mimetype);
                const fileUrl = `${req.protocol}://${req.get('host')}/api/files/${encodeURIComponent(fileName)}`;
                photoUrls.push(fileUrl);
            }
        }
        const progress = await Progress.create({userId, type, date: date || new Date(), ...(weight && {weight}), ...(exercise && {exercise}), ...(prValue && {prValue}), ...(measurement && {measurement: measurementData}), photos: photoUrls, notes});
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(201).json({success: true, message: 'Progress created successfully', data: progress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, type, startDate, endDate, page = 1, limit = 20} = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const query: any = {};
        if (userId){
            query.userId = userId;
        }
        else {
            query.userId = req.user?.userId;
        }
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (typeof startDate === 'string') query.date.$gte = new Date(startDate);
            if (typeof endDate === 'string') query.date.$lte = new Date(endDate);
        }
        const cacheKey = `progress:${JSON.stringify(query)}:page:${pageNum}`;
        const cachedData = await cacheUtils.get(cacheKey);
        if (cachedData){
            res.status(200).json({success: true, message: 'Progress fetched successfully', data: cachedData, total: cachedData.length, page: pageNum, limit: limitNum});
            return;
        }
        const progressEntries = await Progress.find(query).sort({date: -1}).skip(skip).limit(limitNum);
        const total = await Progress.countDocuments(query);
        const responseData = {progressEntries, pagination: {currentPage: pageNum, totalPages: Math.ceil(total/limitNum), totalEntries: total, hasMore: skip + progressEntries.length < total}};
        await cacheUtils.set(cacheKey, responseData, 300);
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/:progressId', authenticate, param('progressId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        res.status(200).json({success: true, data: progress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.put('/:progressId', authenticate, param('progressId').custom((value => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
})), progressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user?.userId;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        if (progress.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to update this progress'});
            return;
        }
        const updatedProgress = await Progress.findByIdAndUpdate(progressId, req.body, {new: true, runValidators: true});
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(200).json({success: true, message: 'Progress updated successfully', data: updatedProgress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/:progressId', authenticate, param('progressId').custom((value => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
})), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user?.userId;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        if (progress.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to delete this progress'});
            return;
        }
        if (progress.photos && progress.photos.length > 0){
            for (const photoUrl of progress.photos){
                const fileName  = photoUrl.split('/').pop()!;
                if (fileName) await minioUtils.deleteFile(fileName);
            }
        }
        await Progress.findByIdAndDelete(progressId);
        await cacheUtils.delPattern(`weight-progress:${userId}:*`);
        res.status(200).json({success: true, message: 'Progress deleted successfully'});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

export default router;