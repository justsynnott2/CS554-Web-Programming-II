import mongoose, { Schema } from "mongoose";
import { IMeal, INutritionInfo } from "../types";

const NutritionInfoSchema = new Schema<INutritionInfo>(
  {
    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: [0, "Calories must be at least 0"],
      max: [5000, "Calories cannot exceed 5000"],
    },
    protein: {
      type: Number,
      required: [true, "Protein is required"],
      min: [0, "Protein must be at least 0"],
      max: [1000, "Protein cannot exceed 1000"],
    },
    carbs: {
      type: Number,
      required: [true, "Carbs are required"],
      min: [0, "Carbs must be at least 0"],
      max: [1000, "Carbs cannot exceed 1000"],
    },
    fat: {
      type: Number,
      required: [true, "Fat is required"],
      min: [0, "Fat must be at least 0"],
      max: [1000, "Fat cannot exceed 1000"],
    },
    fiber: {
      type: Number,
      min: [0, "Fiber must be at least 0"],
      max: [1000, "Fiber cannot exceed 1000"],
    },
    sugar: {
      type: Number,
      min: [0, "Sugar must be at least 0"],
      max: [1000, "Sugar cannot exceed 1000"],
    },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Meal name is required"],
      trim: true,
      minlength: [2, "Meal name must be at least 2 characters long"],
      maxlength: [100, "Meal name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    nutrition: {
      type: NutritionInfoSchema,
      required: [true, "Nutrition information is required"],
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      enum: {
        values: ["breakfast", "lunch", "dinner", "snack"],
        message: "{VALUE} is not a valid meal type",
      },
    },
    photos: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: [true, "Meal date is required"],
      default: Date.now,
    },
  },
  { timestamps: true }
);

MealSchema.index({ userId: 1, date: -1 });
MealSchema.index({ mealType: 1 });

const Meal = mongoose.model<IMeal>("Meal", MealSchema);
export default Meal;