import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import {IUser} from "../types";

const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters long"],
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters long"],
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [16, "Password must be at least 16 characters long"],
            validate: {
                validator: function (value: string) {
                    if (typeof value === 'string' && /^\$2[aby]\$/.test(value)) return true;
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16,}$/.test(value);
                },
                message: "Password must be at least 16 characters long and include uppercase, lowercase, number, and symbol",
            },
            select: false,
        },
        age: {
            type: Number,
            min: [16, "Age must be at least 18"],
            max: [120, "Age cannot exceed 120"],
        },
        height: {
            type: Number,
            min: [24, "Height must be at least 2 feet"],
            max: [96, "Height cannot exceed 8 feet"],
        },
        weight: {
            type: Number,
            min: [44, "Weight must be at least 44 lbs"],
            max: [1100, "Weight cannot exceed 1100 lbs"],
        },
        goalWeight: {
            type: Number,
            min: [44, "Weight must be at least 44 lbs"],
            max: [1100, "Weight cannot exceed 1100 lbs"],
        },
        profilePicture: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error: any) {
      next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      return false;
    }
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;