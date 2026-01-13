import React, { useCallback, useEffect, useState } from "react";
import { mealService } from "../services/mealService";
import { Meal } from "../types";

interface MealListProps {
  onCreateMeal?: () => void;
  onEditMeal?: (meal: Meal) => void;
  onDeleteMeal?: (mealId: string) => void;
}

const FILES_BASE =
  (process.env.REACT_APP_API_URL || "/api").replace(/\/$/, "") + "/files/";

type PhotoLike =
  | string
  | { url?: string; key?: string; originalName?: string }
  | null
  | undefined;

const toFileProxyUrl = (url: string): string => {
  if (url.includes("/api/files/") || url.includes("/files/")) return url;
  const noQuery = url.split("?")[0];
  const parts = noQuery.split("/");
  const objectName = parts[parts.length - 1];
  if (!objectName) return url;
  return FILES_BASE + encodeURIComponent(objectName);
};

const normalizePhotoToUrl = (p: PhotoLike): string | null => {
  if (!p) return null;
  if (typeof p === "string") return toFileProxyUrl(p);
  if (typeof p.url === "string" && p.url.trim()) return toFileProxyUrl(p.url);
  if (typeof p.key === "string" && p.key.trim())
    return FILES_BASE + encodeURIComponent(p.key);
  return null;
};

const MealList: React.FC<MealListProps> = ({
  onCreateMeal,
  onEditMeal,
  onDeleteMeal,
}) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mealService.getMeals(undefined, mealType || undefined);
      setMeals(res.data?.meals || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load meals");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [mealType]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Meals</h2>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center py-8">Loading meals...</p>
      ) : meals.length === 0 ? (
        <div className="text-center py-10">
          <p>No meals yet.</p>
          {onCreateMeal && (
            <button
              onClick={onCreateMeal}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Create Meal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => {
            const rawPhotos: PhotoLike[] = Array.isArray((meal as any).photos)
              ? ((meal as any).photos as PhotoLike[])
              : [];

            const photoUrls: string[] = rawPhotos
              .map((p: PhotoLike) => normalizePhotoToUrl(p))
              .filter((u: string | null): u is string => Boolean(u));

            return (
              <div
                key={meal._id}
                className="bg-white border rounded-lg p-6 shadow-sm"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">{meal.name}</h3>
                    <p className="text-sm text-gray-600">
                      {meal.mealType} • {formatDate(meal.date)} •{" "}
                      {meal.nutrition.calories} cal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditMeal?.(meal)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteMeal?.(meal._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {photoUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {photoUrls.map((src: string, idx: number) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`meal-${idx}`}
                        className="w-full h-28 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MealList;
