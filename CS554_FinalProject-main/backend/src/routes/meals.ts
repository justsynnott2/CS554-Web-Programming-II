import express, { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { Meal } from "../models/index";
import { authenticate } from "../middleware/auth";
import { handleValidationErrors, isValidObjectId } from "../utils/validation";
import { cacheUtils } from "../config/redis";
import multer from "multer";
import { minioUtils } from "../config/minio";
import { getNutritionInfoEdamam } from "../helpers/nutritionApi";
import fs from "fs";
import os from "os";
import path from "path";

const router = express.Router();

const uploadDir = path.join(os.tmpdir(), "meal-photos");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeBase = path.basename(file.originalname).replace(/[^\w.-]/g, "_");
      cb(null, `${Date.now()}-${safeBase}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only JPG/PNG/WebP images are allowed."));
  },
});

const clearMealCache = async (userId: string): Promise<void> => {
  try {
    await cacheUtils.delPattern(`meals:*`);
    await cacheUtils.delPattern(`meals:user:${userId}:*`);
  } catch (e) {
    try {
      await cacheUtils.delPattern(`meals:user:${userId}:*`);
    } catch {}
  }
};

const normalizeMealBody = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (typeof (req.body as any).nutrition === "string") {
      (req.body as any).nutrition = JSON.parse((req.body as any).nutrition);
    }

    if (typeof (req.body as any).removedPhotos === "string") {
      try {
        (req.body as any).removedPhotos = JSON.parse((req.body as any).removedPhotos);
      } catch {
        (req.body as any).removedPhotos = [];
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

const mealValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Meal name must be between 2 and 100 characters"),
  body("mealType")
    .isIn(["breakfast", "lunch", "dinner", "snack"])
    .withMessage("Invalid meal type"),

  body("nutrition").custom((value) => {
    if (!value || typeof value !== "object") throw new Error("Nutrition is required");
    const nums = ["calories", "protein", "carbs", "fat"];
    for (const k of nums) {
      const v = (value as any)[k];
      if (typeof v !== "number" || Number.isNaN(v)) throw new Error(`Nutrition.${k} must be a number`);
      if (v < 0) throw new Error(`Nutrition.${k} must be >= 0`);
    }
    if ((value as any).calories > 5000) throw new Error("Nutrition.calories must be <= 5000");
    return true;
  }),

  body("date").optional().isISO8601().withMessage("Invalid date format"),
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
  upload.array("photos", 5),
  normalizeMealBody,
  mealValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { name, description, nutrition, mealType, date } = req.body;
      const files = req.files as Express.Multer.File[];

      const photoUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = minioUtils.generatefileName(file.originalname, userId);
          const stream = fs.createReadStream(file.path);
          await minioUtils.uploadStream(fileName, stream, file.size, file.mimetype);
          const fileUrl = await minioUtils.getFileUrl(fileName);
          photoUrls.push(fileUrl);
          fs.unlink(file.path, () => {});
        }
      }

      const meal = await Meal.create({
        userId,
        name,
        description,
        nutrition,
        mealType,
        photos: photoUrls,
        date: date ? new Date(date) : new Date(),
      });

      await clearMealCache(userId);

      res.status(201).json({
        success: true,
        message: "Meal created successfully",
        data: meal,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating meal",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, mealType, startDate, endDate, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    query.userId = userId ? userId : req.user?.userId;

    if (mealType) query.mealType = mealType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const cacheKey = `meals:user:${query.userId}:type:${query.mealType || "all"}:start:${startDate || "none"}:end:${endDate || "none"}:page:${pageNum}:limit:${limitNum}`;
    const cachedData = await cacheUtils.get(cacheKey);
    if (cachedData) {
      res.status(200).json({ success: true, data: cachedData, cached: true });
      return;
    }

    const meals = await Meal.find(query).sort({ date: -1 }).skip(skip).limit(limitNum);
    const total = await Meal.countDocuments(query);

    const responseData = {
      meals,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMeals: total,
        hasMore: skip + meals.length < total,
      },
    };

    await cacheUtils.set(cacheKey, responseData, 300);
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching meals",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/search-food", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    if (!q.trim()) {
      res.status(400).json({ success: false, message: "Missing query ?q=" });
      return;
    }

    const cacheKey = `edamam:search:${q.toLowerCase().trim()}`;
    const cached = await cacheUtils.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached, cached: true });
      return;
    }

    const accountUser = req.user?.userId || req.user?.email || "anonymous";
    const results = await getNutritionInfoEdamam(q, accountUser);
    await cacheUtils.set(cacheKey, results, 3600);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    const e = err as any;
    const status = typeof e?.status === "number" ? e.status : 500;

    res.status(status).json({
      success: false,
      message: "Error searching food",
      error: e instanceof Error ? e.message : e,
      ...(process.env.NODE_ENV === "development" && e?.details ? { details: e.details } : {}),
    });
  }
});

router.get(
  "/:mealId",
  authenticate,
  param("mealId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid meal ID");
    return true;
  }),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { mealId } = req.params;
      const meal = await Meal.findById(mealId);
      if (!meal) {
        res.status(404).json({ success: false, message: "Meal not found" });
        return;
      }
      res.status(200).json({ success: true, data: meal });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching meal",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.put(
  "/:mealId",
  authenticate,
  upload.array("photos", 5),
  normalizeMealBody,
  param("mealId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid meal ID");
    return true;
  }),
  mealValidation,
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { mealId } = req.params;
      const userId = req.user?.userId;

      const meal = await Meal.findById(mealId);
      if (!meal) {
        res.status(404).json({ success: false, message: "Meal not found" });
        return;
      }

      if (meal.userId !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized to update this meal" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const removedPhotos: string[] = Array.isArray((req.body as any).removedPhotos)
        ? (req.body as any).removedPhotos
        : [];

      const existing = Array.isArray(meal.photos) ? meal.photos : [];
      const keep = existing.filter((u) => !removedPhotos.includes(u));

      if (removedPhotos.length > 0) {
        for (const url of removedPhotos) {
          const objectName = extractObjectNameFromPresignedUrl(url);
          if (objectName) {
            try {
              await minioUtils.deleteFile(objectName);
            } catch {}
          }
        }
      }

      const newPhotoUrls: string[] = [];
      if (files && files.length > 0 && userId) {
        for (const file of files) {
          const fileName = minioUtils.generatefileName(file.originalname, userId);
          const stream = fs.createReadStream(file.path);
          await minioUtils.uploadStream(fileName, stream, file.size, file.mimetype);
          const fileUrl = await minioUtils.getFileUrl(fileName);
          newPhotoUrls.push(fileUrl);
          fs.unlink(file.path, () => {});
        }
      }

      const { name, description, nutrition, mealType, date } = req.body;

      meal.name = name;
      meal.description = description;
      meal.nutrition = nutrition;
      meal.mealType = mealType;
      meal.date = date ? new Date(date) : meal.date;
      meal.photos = [...keep, ...newPhotoUrls];

      const saved = await meal.save();
      if (userId) await clearMealCache(userId);

      res.status(200).json({ success: true, message: "Meal updated successfully", data: saved });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating meal",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.delete(
  "/:mealId",
  authenticate,
  param("mealId").custom((value) => {
    if (!isValidObjectId(value)) throw new Error("Invalid meal ID");
    return true;
  }),
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { mealId } = req.params;
      const userId = req.user?.userId;

      const meal = await Meal.findById(mealId);
      if (!meal) {
        res.status(404).json({ success: false, message: "Meal not found" });
        return;
      }

      if (meal.userId !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized to delete this meal" });
        return;
      }

      if (meal.photos && meal.photos.length > 0) {
        for (const url of meal.photos) {
          const objectName = extractObjectNameFromPresignedUrl(url);
          if (objectName) {
            try {
              await minioUtils.deleteFile(objectName);
            } catch {}
          }
        }
      }

      await Meal.findByIdAndDelete(mealId);
      if (userId) await clearMealCache(userId);

      res.status(200).json({ success: true, message: "Meal deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting meal",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
