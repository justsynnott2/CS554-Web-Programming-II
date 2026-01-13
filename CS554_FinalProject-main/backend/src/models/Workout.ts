import mongoose, { Schema } from "mongoose";
import { IWorkout, IExercise } from "../types";

const ExerciseSchema = new Schema<IExercise>(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      minlength: [2, "Exercise name must be at least 2 characters long"],
      maxlength: [100, "Exercise name cannot exceed 100 characters"],
    },
    sets: {
      type: Number,
      required: [true, "Number of sets is required"],
      min: [1, "Number of sets must be at least 1"],
      max: [10, "Number of sets cannot exceed 10"],
    },
    reps: {
      type: Number,
      required: [true, "Number of reps is required"],
      min: [1, "Number of reps must be at least 1"],
      max: [100, "Number of reps cannot exceed 100"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight must be at least 0"],
      max: [1000, "Weight cannot exceed 1000"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Workout title is required"],
      trim: true,
      minlength: [2, "Workout title must be at least 2 characters long"],
      maxlength: [100, "Workout title cannot exceed 100 characters"],
    },
    split: {
      type: String,
      required: [true, "Workout split is required"],
      enum: {
        values: [
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
        ],
        message: "{VALUE} is not a valid split type",
      },
    },
    exercises: {
      type: [ExerciseSchema],
      validate: {
        validator: function (exercises: IExercise[]) {
          return exercises.length > 0;
        },
        message: "Workout must have at least one exercise",
      },
    },

    media: {
      type: [String],
      default: [],
    },

    date: {
      type: Date,
      required: [true, "Workout date is required"],
      default: Date.now,
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"],
      max: [600, "Duration cannot exceed 600 minutes"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, date: -1 });
WorkoutSchema.index({ split: 1 });

const Workout = mongoose.model<IWorkout>("Workout", WorkoutSchema);
export default Workout;
