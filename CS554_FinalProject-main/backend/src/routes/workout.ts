import express, { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { Workout } from "../models/index";
import { authenticate } from "../middleware/auth";
import { handleValidationErrors, isValidObjectId } from "../utils/validation";
import { cacheUtils } from "../config/redis";
import multer from "multer";
import { minioUtils } from "../config/minio";
import fs from "fs";
import os from "os";
import path from "path";

const router = express.Router();

const uploadDir = path.join(os.tmpdir(), "workout-media");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeBase = path.basename(file.originalname).replace(/[^\w.-]/g, "_");
      cb(null, `${Date.now()}-${safeBase}`);
    },
  }),
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else
      cb(
        new Error(
          "Invalid file type. Only JPG/PNG/WebP images and MP4/WebM/MOV videos are allowed."
        )
      );
  },
});

const clearWorkoutCache = async (userId: string): Promise<void> => {
  try {
    await cacheUtils.delPattern(`workouts:*`);
    await cacheUtils.del(`workouts:user:${userId}`);
  } catch (error) {
    console.error("Error clearing workout cache:", error);
    try {
      await cacheUtils.del(`workouts:user:${userId}`);
    } catch (e) {
      console.error("Error clearing workout cache:", e);
    }
  }
};

const normalizeWorkoutBody = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (typeof req.body.exercises === "string") {
      req.body.exercises = JSON.parse(req.body.exercises);
    }

    if (typeof req.body.duration === "string") {
      req.body.duration = req.body.duration ? Number(req.body.duration) : undefined;
    }

    if (typeof req.body.removedMedia === "string") {
      try {
        req.body.removedMedia = JSON.parse(req.body.removedMedia);
      } catch {
        req.body.removedMedia = [];
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

const workoutValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("split")
    .trim()
    .isIn([
      "Push",
      "Pull",
      "Legs",
      "Upper Body",
      "Lower Body",
      "Full Body",
      "Chest",
      "Back",
      "Shoulders",
      "Arms",
      "Core",
      "Cardio",
      "Other",
    ])
    .withMessage("Invalid split type"),

  body("exercises")
    .custom((value) => Array.isArray(value) && value.length > 0)
    .withMessage("Exercises must have at least one exercise"),

  body("exercises.*.name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Exercise name must be between 1 and 100 characters"),

  body("exercises.*.sets")
    .isInt({ min: 1, max: 10 })
    .withMessage("Sets must be between 1 and 10"),

  body("exercises.*.reps")
    .isInt({ min: 1, max: 50 })
    .withMessage("Reps must be between 1 and 50"),

  body("exercises.*.weight")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Weight must be between 0 and 1000 lbs"),

  body("date").optional().isISO8601().withMessage("Invalid date format"),

  body("duration")
    .optional()
    .isInt({ min: 0, max: 180 })
    .withMessage("Duration must be between 0 and 180 minutes"),
];

const extractObjectNameFromPresignedUrl = (url: string): string | null => {
  const noQuery = url.split("?")[0];
  const parts = noQuery.split("/");
  const last = parts[parts.length - 1];
  return last || null;
};

router.post(
  "/",
  authenticate,
  upload.array("media", 5),
  normalizeWorkoutBody,
  workoutValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { title, split, exercises, date, duration, notes } = req.body;
      const files = req.files as Express.Multer.File[];

      const mediaUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = minioUtils.generatefileName(file.originalname, userId);
          const stream = fs.createReadStream(file.path);
          await minioUtils.uploadStream(fileName, stream, file.size, file.mimetype);
          const fileUrl = await minioUtils.getFileUrl(fileName);
          mediaUrls.push(fileUrl);
          fs.unlink(file.path, () => {});
        }
      }

      const workout = await Workout.create({
        userId,
        title,
        split,
        exercises,
        date: date ? new Date(date) : new Date(),
        duration,
        notes,
        media: mediaUrls,
      });

      await clearWorkoutCache(userId);

      res.status(201).json({
        success: true,
        message: "Workout created successfully",
        data: workout,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating workout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, split, startDate, endDate, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    query.userId = userId ? userId : req.user?.userId;

    if (split) query.split = split;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const workouts = await Workout.find(query).sort({ date: -1 }).skip(skip).limit(limitNum);
    const total = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        workouts,
        total,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalWorkouts: total,
          hasMore: skip + workouts.length < total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching workouts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get(
  "/:workoutId",
  authenticate,
  param("workoutId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid workout ID");
    return true;
  }),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { workoutId } = req.params;
      const workout = await Workout.findById(workoutId);
      if (!workout) {
        res.status(404).json({ success: false, message: "Workout not found" });
        return;
      }
      res.status(200).json({ success: true, data: workout });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching workout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.put(
  "/:workoutId",
  authenticate,
  upload.array("media", 5),
  normalizeWorkoutBody,
  param("workoutId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid workout ID");
    return true;
  }),
  workoutValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { workoutId } = req.params;
      const userId = req.user?.userId;

      const workout = await Workout.findById(workoutId);
      if (!workout) {
        res.status(404).json({ success: false, message: "Workout not found" });
        return;
      }

      if (workout.userId !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized to update this workout" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const removedMedia: string[] = Array.isArray(req.body.removedMedia) ? req.body.removedMedia : [];

      const existing = Array.isArray(workout.media) ? workout.media : [];
      const keep = existing.filter((u) => !removedMedia.includes(u));

      if (removedMedia.length > 0) {
        for (const url of removedMedia) {
          const objectName = extractObjectNameFromPresignedUrl(url);
          if (objectName) {
            try {
              await minioUtils.deleteFile(objectName);
            } catch {}
          }
        }
      }

      const newMediaUrls: string[] = [];
      if (files && files.length > 0 && userId) {
        for (const file of files) {
          const fileName = minioUtils.generatefileName(file.originalname, userId);
          const stream = fs.createReadStream(file.path);
          await minioUtils.uploadStream(fileName, stream, file.size, file.mimetype);
          const fileUrl = await minioUtils.getFileUrl(fileName);
          newMediaUrls.push(fileUrl);
          fs.unlink(file.path, () => {});
        }
      }

      const { title, split, exercises, date, duration, notes } = req.body;

      workout.title = title;
      workout.split = split;
      workout.exercises = exercises;
      workout.date = date ? new Date(date) : workout.date;
      workout.duration = typeof duration === "number" ? duration : workout.duration;
      workout.notes = notes;
      workout.media = [...keep, ...newMediaUrls];

      const saved = await workout.save();

      if (userId) await clearWorkoutCache(userId);

      res.status(200).json({ success: true, message: "Workout updated successfully", data: saved });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating workout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.delete(
  "/:workoutId",
  authenticate,
  param("workoutId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid workout ID");
    return true;
  }),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { workoutId } = req.params;
      const userId = req.user?.userId;

      const workout = await Workout.findById(workoutId);
      if (!workout) {
        res.status(404).json({ success: false, message: "Workout not found" });
        return;
      }

      if (workout.userId !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized to delete this workout" });
        return;
      }

      if (workout.media && workout.media.length > 0) {
        for (const url of workout.media) {
          const objectName = extractObjectNameFromPresignedUrl(url);
          if (objectName) await minioUtils.deleteFile(objectName);
        }
      }

      await Workout.findByIdAndDelete(workoutId);

      if (userId) await clearWorkoutCache(userId);

      res.status(200).json({ success: true, message: "Workout deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting workout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
