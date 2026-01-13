import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

import MealForm from "../components/MealForm";
import MealList from "../components/MealList";
import { Meal } from "../types";
import { mealService } from "../services/mealService";

const Meals: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mealsUpdated, setMealsUpdated] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const formatDailySummaryData = (value: number) =>
    Number.isFinite(value) ? value.toFixed(2) : "0.00";

  const loadMeals = useCallback(async () => {
    const res = await mealService.getMeals();
    setMeals(res.data?.meals || []);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals, mealsUpdated]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMealCreated = () => {
    setMealsUpdated((prev) => !prev);
    setShowForm(false);
    setEditingMeal(null);
  };

  const handleEdit = async (meal: Meal) => {
    try {
      const res = await mealService.getMealById(meal._id);
      if (res.success && res.data) {
        setEditingMeal(res.data);
        setShowForm(true);
      }
    } catch {
      alert("Failed to load meal for editing");
    }
  };

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const latestMealDate = meals.reduce<Date | null>((latest, meal) => {
    const d = new Date(meal.date);
    if (Number.isNaN(d.getTime())) return latest;
    if (!latest) return d;
    return d > latest ? d : latest;
  }, null);

  const hasMealsToday = meals.some((meal) => {
    const d = new Date(meal.date);
    return d >= startOfToday && d < startOfTomorrow;
  });

  const startOfSummaryDay = new Date(
    hasMealsToday ? startOfToday : latestMealDate || startOfToday
  );
  startOfSummaryDay.setHours(0, 0, 0, 0);
  const startOfNextSummaryDay = new Date(startOfSummaryDay);
  startOfNextSummaryDay.setDate(startOfNextSummaryDay.getDate() + 1);

  const summaryMeals = meals.filter((meal) => {
    const d = new Date(meal.date);
    return d >= startOfSummaryDay && d < startOfNextSummaryDay;
  });

  const summaryDayLabel = startOfSummaryDay.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const newRecipesTodayCount = meals.filter((meal) => {
    const created = new Date(meal.createdAt);
    return created >= startOfToday && created < startOfTomorrow;
  }).length;

  const totals = summaryMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.nutrition?.calories || 0),
      protein: acc.protein + (meal.nutrition?.protein || 0),
      carbs: acc.carbs + (meal.nutrition?.carbs || 0),
      fat: acc.fat + (meal.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />

      <div className="p-5 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Daily Summary</h1>
            <p className="text-sm text-gray-600 mt-1">
              Summary for: <span className="font-semibold">{summaryDayLabel}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              New recipes added today:{" "}
              <span className="font-semibold">{newRecipesTodayCount}</span>
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Calories</p>
            <p className="text-2xl font-bold">
              {formatDailySummaryData(totals.calories)}cal
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Protein</p>
            <p className="text-2xl font-bold">
              {formatDailySummaryData(totals.protein)}g
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-600">Carbs</p>
            <p className="text-2xl font-bold">
              {formatDailySummaryData(totals.carbs)}g
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-gray-600">Fat</p>
            <p className="text-2xl font-bold">
              {formatDailySummaryData(totals.fat)}g
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meals</h1>
          <button
            onClick={() => {
              setEditingMeal(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            + New Meal
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">
              {editingMeal ? "Edit Meal" : "Add a New Meal"}
            </h2>

            <MealForm onMealCreated={handleMealCreated} mealToEdit={editingMeal} />

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMeal(null);
                }}
                className="px-6 py-2 bg-gray-200 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <MealList
          key={mealsUpdated.toString()}
          onCreateMeal={() => {
            setEditingMeal(null);
            setShowForm(true);
          }}
          onEditMeal={handleEdit}
          onDeleteMeal={async (mealId) => {
            if (!window.confirm("Are you sure you want to delete this meal?")) return;
            await mealService.deleteMeal(mealId);
            setMealsUpdated((prev) => !prev);
          }}
        />
      </div>
    </>
  );
};

export default Meals;
