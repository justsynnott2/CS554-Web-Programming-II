import mongoose, {Schema} from 'mongoose';
import {IProgress, IWeightProgress, IPRExercise, IPRProgress} from '../types';

const MeasurementSchema = new Schema(
    {
        chest: {type: Number, min: 0},
        waist: {type: Number, min: 0},
        hips: {type: Number, min: 0},
        arms: {type: Number, min: 0},
        legs: {type: Number, min: 0},
    },
    {_id: false}
);

const ProgressSchema = new Schema<IProgress>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Progress type is required'],
            enum: {values: ['weight', 'pr', 'measurement', 'photo'], message: '{VALUE} is not a valid progress type'},
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
        },
        weight: {
            type: Number,
            min: [0.1, 'Weight must be greater than 0'],
            max: [1100, 'Weight cannot exceed 1100 lbs'],
            required: function (this: IProgress){return this.type === 'weight';},
        },
        exercise: {
            type: String,
            trim: true,
            required: function (this: IProgress){return this.type === 'pr';},
        },
        prValue: {
            type: Number,
            min: [0.0001, 'PR value must be greater than 0'],
            max: [100, 'PR value cannot exceed 100'],
            required: function (this: IProgress){return this.type === 'pr';},
        },
        measurement: {
            type: MeasurementSchema,
            required: function (this: IProgress){return this.type === 'measurement';},
        },
        photos: {
            type: [String],
            default: [],
            validate: {
                validator: function (this: IProgress, photos: string[]){
                    if (this.type === 'photo') return photos.length > 0;
                    return true;
                },
                message: 'Photo type progress must have at least one photo',
            },
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {timestamps: true,}
);

ProgressSchema.index({UserId: 1, date: -1});
ProgressSchema.index({type: 1});

const WeightProgressSchema = new Schema<IWeightProgress>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
        },
        weight: {
            type: Number,
            min: [0.1, 'Weight must be greater than 0'],
            max: [1100, 'Weight cannot exceed 1100 lbs'],
            required: [true, 'Weight is required'],
        },
        photos: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {timestamps: true,}
);

WeightProgressSchema.index({userId: 1, date: -1});

const PRExerciseSchema = new Schema<IPRExercise>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Exercise name is required'],
            trim: true,
        },
        unit: {
            type: String,
            enum: ['lbs', 'reps', 'time'],
            default: 'lbs',
        },
    },
    { timestamps: true }
);

PRExerciseSchema.index({userId: 1, name: 1}, {unique: true});

const PRProgressSchema = new Schema<IPRProgress>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        prExerciseId: {
            type: String,
            required: [true, 'PR Exercise ID is required'],
            ref: 'PRExercise',
            index: true,
        },
        value: {
            type: Number,
            required: [true, 'PR value is required'],
            min: [0.0001, 'PR value must be greater than 0'],
        },
    },
    { timestamps: true }
);

PRProgressSchema.index({userId: 1, prExerciseId: 1, createdAt: -1});

const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
const WeightProgress = mongoose.model<IWeightProgress>('WeightProgress', WeightProgressSchema);
const PRExercise = mongoose.model<IPRExercise>('PRExercise', PRExerciseSchema);
const PRProgress = mongoose.model<IPRProgress>('PRProgress', PRProgressSchema);
export {Progress, WeightProgress, PRExercise, PRProgress};