const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/cs554-finalproject';

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  age: Number,
  height: Number,
  weight: Number,
  profilePicture: String,
}, { timestamps: true });

const WorkoutSchema = new mongoose.Schema({
  userId: String,
  title: String,
  split: String,
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    notes: String,
  }],
  date: Date,
  duration: Number,
  notes: String,
}, { timestamps: true });

const MealSchema = new mongoose.Schema({
  userId: String,
  name: String,
  description: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
  mealType: String,
  photos: [String],
  date: Date,
}, { timestamps: true });

const ProgressSchema = new mongoose.Schema({
  userId: String,
  type: String,
  date: Date,
  weight: Number,
  exercise: String,
  prValue: Number,
  measurement: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    legs: Number,
  },
  photos: [String],
  notes: String,
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  userId: String,
  type: String,
  content: String,
  workoutId: String,
  mealId: String,
  progressId: String,
  likes: [String],
  comments: [{
    userId: String,
    text: String,
    createdAt: Date,
  }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Workout = mongoose.model('Workout', WorkoutSchema);
const Meal = mongoose.model('Meal', MealSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const Post = mongoose.model('Post', PostSchema);

const seedData = async () => {
  let exitCode = 0;
  try {
    console.log('Starting database seed...');

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const forceReseed = String(process.env.SEED_FORCE || '').toLowerCase() === 'true';
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !forceReseed) {
      console.log(`Seed skipped: database already has ${existingUsers} user(s). Set SEED_FORCE=true to wipe + reseed.`);
      return;
    }

    await User.deleteMany({});
    await Workout.deleteMany({});
    await Meal.deleteMany({});
    await Progress.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('PasswordPassword@123', 10);
    
    const users = await User.insertMany([
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: hashedPassword, age: 25, height: 71, weight: 165.3 },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: hashedPassword, age: 28, height: 65, weight: 132.3 },
      { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', password: hashedPassword, age: 32, height: 69, weight: 176.4 },
      { firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com', password: hashedPassword, age: 24, height: 67, weight: 143.3 },
      { firstName: 'David', lastName: 'Brown', email: 'david@example.com', password: hashedPassword, age: 30, height: 73, weight: 198.4 },
      { firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com', password: hashedPassword, age: 27, height: 63, weight: 121.3 },
      { firstName: 'Chris', lastName: 'Wilson', email: 'chris@example.com', password: hashedPassword, age: 29, height: 70, weight: 172.0 },
      { firstName: 'Amanda', lastName: 'Taylor', email: 'amanda@example.com', password: hashedPassword, age: 26, height: 66, weight: 136.7 },
      { firstName: 'James', lastName: 'Martinez', email: 'james@example.com', password: hashedPassword, age: 31, height: 72, weight: 187.4 },
      { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa@example.com', password: hashedPassword, age: 23, height: 64, weight: 127.9 },
      { firstName: 'Vaibhav', lastName: 'Ganeriwala', email: 'vaibhav@ganeriwala.com', password: hashedPassword, age: 23, height: 64, weight: 127.9 },
    ]);
    console.log(`Created ${users.length} users`);

    console.log('Creating workouts...');
    const workouts = await Workout.insertMany([
      {
        userId: users[0]._id.toString(),
        title: 'Leg Day Blast',
        split: 'Legs',
        exercises: [
          { name: 'Squats', sets: 4, reps: 10, weight: 100 },
          { name: 'Leg Press', sets: 3, reps: 12, weight: 150 },
          { name: 'Leg Curls', sets: 3, reps: 15, weight: 50 },
        ],
        date: new Date('2025-12-01'),
        duration: 60,
        notes: 'Great leg session!',
      },
      {
        userId: users[1]._id.toString(),
        title: 'Upper Body Power',
        split: 'Upper Body',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 80 },
          { name: 'Rows', sets: 4, reps: 10, weight: 70 },
          { name: 'Shoulder Press', sets: 3, reps: 12, weight: 40 },
        ],
        date: new Date('2025-12-01'),
        duration: 55,
        notes: 'Felt strong today',
      },
      {
        userId: users[2]._id.toString(),
        title: 'Push Day',
        split: 'Push',
        exercises: [
          { name: 'Bench Press', sets: 5, reps: 5, weight: 100 },
          { name: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 30 },
          { name: 'Tricep Dips', sets: 3, reps: 15, weight: 0 },
        ],
        date: new Date('2025-12-02'),
        duration: 65,
        notes: 'New PR on bench!',
      },
      {
        userId: users[3]._id.toString(),
        title: 'Pull Day',
        split: 'Pull',
        exercises: [
          { name: 'Deadlifts', sets: 4, reps: 6, weight: 120 },
          { name: 'Pull-ups', sets: 4, reps: 10, weight: 0 },
          { name: 'Barbell Rows', sets: 3, reps: 12, weight: 60 },
        ],
        date: new Date('2025-12-02'),
        duration: 70,
        notes: 'Back is sore!',
      },
      {
        userId: users[4]._id.toString(),
        title: 'Chest and Triceps',
        split: 'Chest',
        exercises: [
          { name: 'Flat Bench Press', sets: 4, reps: 8, weight: 90 },
          { name: 'Cable Flyes', sets: 3, reps: 15, weight: 20 },
          { name: 'Tricep Pushdowns', sets: 4, reps: 12, weight: 30 },
        ],
        date: new Date('2025-11-30'),
        duration: 50,
        notes: 'Good pump',
      },
      {
        userId: users[5]._id.toString(),
        title: 'Back and Biceps',
        split: 'Back',
        exercises: [
          { name: 'Lat Pulldowns', sets: 4, reps: 12, weight: 60 },
          { name: 'Seated Rows', sets: 4, reps: 10, weight: 70 },
          { name: 'Bicep Curls', sets: 3, reps: 15, weight: 15 },
        ],
        date: new Date('2025-11-29'),
        duration: 55,
        notes: 'Arms are pumped!',
      },
      {
        userId: users[6]._id.toString(),
        title: 'Full Body Workout',
        split: 'Full Body',
        exercises: [
          { name: 'Squats', sets: 3, reps: 10, weight: 80 },
          { name: 'Bench Press', sets: 3, reps: 10, weight: 70 },
          { name: 'Rows', sets: 3, reps: 10, weight: 60 },
        ],
        date: new Date('2025-11-28'),
        duration: 60,
        notes: 'Total body burn',
      },
      {
        userId: users[7]._id.toString(),
        title: 'Shoulder Day',
        split: 'Shoulders',
        exercises: [
          { name: 'Military Press', sets: 4, reps: 8, weight: 50 },
          { name: 'Lateral Raises', sets: 4, reps: 15, weight: 10 },
          { name: 'Face Pulls', sets: 3, reps: 20, weight: 15 },
        ],
        date: new Date('2025-11-27'),
        duration: 45,
        notes: 'Shoulders on fire!',
      },
      {
        userId: users[8]._id.toString(),
        title: 'Cardio Session',
        split: 'Cardio',
        exercises: [
          { name: 'Running', sets: 1, reps: 30, weight: 0, notes: '30 minutes' },
          { name: 'Jump Rope', sets: 3, reps: 100, weight: 0 },
        ],
        date: new Date('2025-11-26'),
        duration: 40,
        notes: 'Good cardio day',
      },
      {
        userId: users[9]._id.toString(),
        title: 'Core Workout',
        split: 'Core',
        exercises: [
          { name: 'Planks', sets: 3, reps: 60, weight: 0, notes: '60 seconds each' },
          { name: 'Russian Twists', sets: 3, reps: 30, weight: 10 },
          { name: 'Leg Raises', sets: 3, reps: 15, weight: 0 },
        ],
        date: new Date('2025-11-25'),
        duration: 30,
        notes: 'Ab burner!',
      },
    ]);
    console.log(`Created ${workouts.length} workouts`);

    console.log('Creating meals...');
    const meals = await Meal.insertMany([
      {
        userId: users[0]._id.toString(),
        name: 'Chicken and Rice',
        description: 'Grilled chicken breast with brown rice',
        mealType: 'lunch',
        nutrition: { calories: 450, protein: 40, carbs: 50, fat: 10, fiber: 5, sugar: 2 },
        date: new Date('2025-12-03'),
      },
      {
        userId: users[1]._id.toString(),
        name: 'Protein Smoothie',
        description: 'Banana, protein powder, almond milk',
        mealType: 'breakfast',
        nutrition: { calories: 300, protein: 30, carbs: 35, fat: 8, fiber: 4, sugar: 15 },
        date: new Date('2025-12-03'),
      },
      {
        userId: users[2]._id.toString(),
        name: 'Salmon and Vegetables',
        description: 'Baked salmon with steamed broccoli',
        mealType: 'dinner',
        nutrition: { calories: 500, protein: 45, carbs: 30, fat: 20, fiber: 8, sugar: 5 },
        date: new Date('2025-12-02'),
      },
      {
        userId: users[3]._id.toString(),
        name: 'Greek Yogurt Bowl',
        description: 'Greek yogurt with berries and granola',
        mealType: 'snack',
        nutrition: { calories: 250, protein: 20, carbs: 30, fat: 6, fiber: 5, sugar: 18 },
        date: new Date('2025-12-02'),
      },
      {
        userId: users[4]._id.toString(),
        name: 'Beef Stir Fry',
        description: 'Lean beef with mixed vegetables',
        mealType: 'dinner',
        nutrition: { calories: 550, protein: 50, carbs: 40, fat: 18, fiber: 7, sugar: 8 },
        date: new Date('2025-12-01'),
      },
      {
        userId: users[5]._id.toString(),
        name: 'Oatmeal with Protein',
        description: 'Oats with protein powder and berries',
        mealType: 'breakfast',
        nutrition: { calories: 350, protein: 25, carbs: 45, fat: 8, fiber: 8, sugar: 12 },
        date: new Date('2025-12-01'),
      },
      {
        userId: users[6]._id.toString(),
        name: 'Turkey Sandwich',
        description: 'Whole wheat bread with turkey and veggies',
        mealType: 'lunch',
        nutrition: { calories: 400, protein: 35, carbs: 45, fat: 10, fiber: 6, sugar: 5 },
        date: new Date('2025-11-30'),
      },
      {
        userId: users[7]._id.toString(),
        name: 'Egg White Omelet',
        description: 'Egg whites with spinach and mushrooms',
        mealType: 'breakfast',
        nutrition: { calories: 200, protein: 25, carbs: 10, fat: 5, fiber: 3, sugar: 2 },
        date: new Date('2025-11-30'),
      },
      {
        userId: users[8]._id.toString(),
        name: 'Quinoa Bowl',
        description: 'Quinoa with chicken and vegetables',
        mealType: 'lunch',
        nutrition: { calories: 480, protein: 38, carbs: 52, fat: 12, fiber: 9, sugar: 4 },
        date: new Date('2025-11-29'),
      },
      {
        userId: users[9]._id.toString(),
        name: 'Protein Bar',
        description: 'High protein snack bar',
        mealType: 'snack',
        nutrition: { calories: 220, protein: 20, carbs: 25, fat: 7, fiber: 3, sugar: 10 },
        date: new Date('2025-11-29'),
      },
    ]);
    console.log(`Created ${meals.length} meals`);

    console.log('Creating progress entries...');
    const progressEntries = await Progress.insertMany([
      {
        userId: users[0]._id.toString(),
        type: 'weight',
        weight: 75,
        date: new Date('2025-12-03'),
        notes: 'Starting weight',
      },
      {
        userId: users[1]._id.toString(),
        type: 'weight',
        weight: 60,
        date: new Date('2025-12-03'),
        notes: 'Maintaining well',
      },
      {
        userId: users[2]._id.toString(),
        type: 'pr',
        exercise: 'Bench Press',
        prValue: 100,
        date: new Date('2025-12-02'),
        notes: 'New bench PR!',
      },
      {
        userId: users[3]._id.toString(),
        type: 'pr',
        exercise: 'Deadlift',
        prValue: 140,
        date: new Date('2025-12-02'),
        notes: 'Finally hit 140kg!',
      },
      {
        userId: users[4]._id.toString(),
        type: 'measurement',
        measurement: { chest: 100, waist: 85, hips: 95, arms: 38, legs: 60 },
        date: new Date('2025-12-01'),
        notes: 'Monthly measurements',
      },
      {
        userId: users[5]._id.toString(),
        type: 'weight',
        weight: 55,
        date: new Date('2025-12-01'),
        notes: 'Down 1kg this month',
      },
      {
        userId: users[6]._id.toString(),
        type: 'pr',
        exercise: 'Squat',
        prValue: 120,
        date: new Date('2025-11-30'),
        notes: 'Squat PR achieved!',
      },
      {
        userId: users[7]._id.toString(),
        type: 'measurement',
        measurement: { chest: 90, waist: 70, hips: 92, arms: 32, legs: 55 },
        date: new Date('2025-11-30'),
        notes: 'Good progress',
      },
      {
        userId: users[8]._id.toString(),
        type: 'weight',
        weight: 85,
        date: new Date('2025-11-29'),
        notes: 'Bulk going well',
      },
      {
        userId: users[9]._id.toString(),
        type: 'pr',
        exercise: 'Overhead Press',
        prValue: 50,
        date: new Date('2025-11-29'),
        notes: '50kg press!',
      },
    ]);
    console.log(`Created ${progressEntries.length} progress entries`);

    console.log('Creating posts...');
    const posts = await Post.insertMany([
      {
        userId: users[0]._id.toString(),
        type: 'workout',
        content: 'Crushed leg day today! 💪',
        workoutId: workouts[0]._id.toString(),
        likes: [users[1]._id.toString(), users[2]._id.toString()],
        comments: [
          { userId: users[1]._id.toString(), text: 'Great job!', createdAt: new Date() },
        ],
      },
      {
        userId: users[1]._id.toString(),
        type: 'workout',
        content: 'Upper body workout done! Feeling strong 🔥',
        workoutId: workouts[1]._id.toString(),
        likes: [users[0]._id.toString()],
        comments: [],
      },
      {
        userId: users[2]._id.toString(),
        type: 'workout',
        content: 'New bench press PR! 100kg! 🎉',
        workoutId: workouts[2]._id.toString(),
        likes: [users[0]._id.toString(), users[1]._id.toString(), users[3]._id.toString()],
        comments: [
          { userId: users[0]._id.toString(), text: 'Awesome!', createdAt: new Date() },
          { userId: users[3]._id.toString(), text: 'Congrats!', createdAt: new Date() },
        ],
      },
      {
        userId: users[3]._id.toString(),
        type: 'meal',
        content: 'Healthy lunch prep for the week 🥗',
        mealId: meals[3]._id.toString(),
        likes: [users[4]._id.toString()],
        comments: [],
      },
      {
        userId: users[4]._id.toString(),
        type: 'progress',
        content: 'Monthly measurements looking good! 📏',
        progressId: progressEntries[4]._id.toString(),
        likes: [users[5]._id.toString(), users[6]._id.toString()],
        comments: [
          { userId: users[5]._id.toString(), text: 'Keep it up!', createdAt: new Date() },
        ],
      },
      {
        userId: users[5]._id.toString(),
        type: 'meal',
        content: 'Perfect breakfast to start the day! 🍳',
        mealId: meals[5]._id.toString(),
        likes: [users[7]._id.toString()],
        comments: [],
      },
      {
        userId: users[6]._id.toString(),
        type: 'workout',
        content: 'Full body workout complete! 💯',
        workoutId: workouts[6]._id.toString(),
        likes: [],
        comments: [],
      },
      {
        userId: users[7]._id.toString(),
        type: 'progress',
        content: 'Hit a new squat PR today! 120kg! 🏋️',
        progressId: progressEntries[6]._id.toString(),
        likes: [users[8]._id.toString(), users[9]._id.toString()],
        comments: [
          { userId: users[8]._id.toString(), text: 'Beast mode!', createdAt: new Date() },
        ],
      },
      {
        userId: users[8]._id.toString(),
        type: 'meal',
        content: 'Quinoa bowl for lunch - so good! 😋',
        mealId: meals[8]._id.toString(),
        likes: [users[9]._id.toString()],
        comments: [],
      },
      {
        userId: users[9]._id.toString(),
        type: 'workout',
        content: 'Core day was brutal but worth it! 🔥',
        workoutId: workouts[9]._id.toString(),
        likes: [users[0]._id.toString(), users[1]._id.toString()],
        comments: [
          { userId: users[1]._id.toString(), text: 'Nice work!', createdAt: new Date() },
        ],
      },
    ]);
    console.log(`Created ${posts.length} posts`);

    console.log('Database seeded successfully!');
    console.log(`Summary: ${users.length} users, ${workouts.length} workouts, ${meals.length} meals, ${progressEntries.length} progress entries, ${posts.length} posts`);
    console.log('Default password for all users: PasswordPassword@123');

  } catch (error) {
    exitCode = 1;
    console.error('Error seeding database:', error);
  } finally {
    try {
      await mongoose.connection.close();
    } catch (e) {
    }
    console.log('Disconnected from MongoDB');
    process.exit(exitCode);
  }
};

seedData();