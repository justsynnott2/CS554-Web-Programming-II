export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  goalWeight?: number;
  profilePicture?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface Workout {
  _id: string;
  userId: string;
  title: string;
  split: string;
  exercises: Exercise[];
  media?: string[];
  date: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutFormData {
  title: string;
  split: string;
  exercises: Exercise[];
  media?: File[];
  removedMedia?: string[];
  date?: string;
  duration?: number;
  notes?: string;
}



export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface Meal {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  nutrition: NutritionInfo;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  photos?: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealFormData {
  name: string;
  description?: string;
  nutrition: NutritionInfo;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  photos?: File[];
  removedPhotos?: string[];
  date?: string;
}

export interface Measurement {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
}

export interface Progress {
  _id: string;
  userId: string;
  type: "weight" | "pr" | "measurement" | "photo";
  date: string;
  weight?: number;
  exercise?: string;
  prValue?: number;
  measurement?: Measurement;
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressFormData {
  type: "weight" | "pr" | "measurement" | "photo";
  date?: string;
  weight?: number;
  exercise?: string;
  prValue?: number;
  measurement?: Measurement;
  photos?: File[];
  notes?: string;
}

export interface WeightProgress {
  _id: string;
  userId: string;
  date: string;
  weight: number;
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightProgressFormData {
  date?: string;
  weight: number;
  photos?: File[];
  notes?: string;
}

export interface PRExercise {
  _id: string;
  userId: string;
  name: string;
  unit: "lbs" | "reps" | "time";
  createdAt: string;
  updatedAt: string;
}

export interface PRProgress {
  _id: string;
  userId: string;
  prExerciseId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface PRHistoryResponse {
  exercise: PRExercise;
  prs: PRProgress[];
  current: PRProgress | null;
}

export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Reply {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: UserPublic;
}

export interface Comment {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  replies?: Reply[];
  user?: UserPublic;
}

export interface Post {
  _id: string;
  userId: string;
  type: "workout" | "meal" | "progress";
  content: string;
  workoutId?: Workout;
  mealId?: Meal;
  progressId?: WeightProgress | PRProgress;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  user?: UserPublic;
}

export interface PostFormData {
  type: "workout" | "meal" | "progress";
  content: string;
  workoutId?: string;
  mealId?: string;
  progressId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers?: number;
  totalWorkouts?: number;
  totalMeals?: number;
  totalEntries?: number;
  totalPosts?: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

export interface FoodItem {
  name: string;
  image: string;
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  servings: number;
}
