import React, { useEffect, useMemo, useState } from "react";
import { mealService } from "../services/mealService";
import { FoodItem, Meal, MealFormData } from "../types";

interface MealFormProps {
  onMealCreated: () => void;
  mealToEdit?: Meal | null;
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
  if (typeof p === "string") return p;
  if (typeof p.url === "string" && p.url.trim()) return p.url;
  if (typeof p.key === "string" && p.key.trim())
    return FILES_BASE + encodeURIComponent(p.key);
  return null;
};

const MealForm: React.FC<MealFormProps> = ({ onMealCreated, mealToEdit }) => {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealFormData["mealType"]>("breakfast");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviewUrls, setNewPhotoPreviewUrls] = useState<string[]>([]);

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const ALLOWED_IMAGE_TYPES = useMemo(
    () => new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
    []
  );
  const ACCEPT_ATTR = "image/jpeg,image/jpg,image/png,image/webp";

  useEffect(() => {
    if (mealToEdit) {
      setName(mealToEdit.name || "");
      setMealType(mealToEdit.mealType);
      setCalories(mealToEdit.nutrition?.calories ?? 0);
      setProtein(mealToEdit.nutrition?.protein ?? 0);
      setCarbs(mealToEdit.nutrition?.carbs ?? 0);
      setFat(mealToEdit.nutrition?.fat ?? 0);

      const raw = Array.isArray((mealToEdit as any).photos) ? (mealToEdit as any).photos : [];
      const normalized = raw
        .map((p: PhotoLike) => normalizePhotoToUrl(p))
        .filter((u: string | null): u is string => Boolean(u));

      setExistingPhotos(normalized);
      setRemovedPhotos([]);

      newPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
      setNewPhotoFiles([]);
      setNewPhotoPreviewUrls([]);
    } else {
      setName("");
      setMealType("breakfast");
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);

      setExistingPhotos([]);
      setRemovedPhotos([]);

      newPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
      setNewPhotoFiles([]);
      setNewPhotoPreviewUrls([]);

      setFoodQuery("");
      setFoodResults([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealToEdit]);

  useEffect(() => {
    return () => {
      newPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newPhotoPreviewUrls]);

  const keptExistingPhotos = existingPhotos.filter((u) => !removedPhotos.includes(u));

  const handleRemoveExistingPhoto = (url: string) => {
    setRemovedPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleUndoRemoveExistingPhoto = (url: string) => {
    setRemovedPhotos((prev) => prev.filter((u) => u !== url));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const invalid = files.filter((f) => !ALLOWED_IMAGE_TYPES.has(f.type));
    if (invalid.length > 0) {
      setError("Only JPG/PNG/WebP images are allowed.");
      e.target.value = "";
      return;
    }

    const keptExistingCount = existingPhotos.filter((u) => !removedPhotos.includes(u)).length;
    const totalAfter = keptExistingCount + files.length;

    if (totalAfter > 5) {
      setError(
        `You can only have up to 5 photos total. You currently have ${keptExistingCount} kept, and selected ${files.length}.`
      );
      e.target.value = "";
      return;
    }

    newPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));

    setNewPhotoFiles(files);
    setNewPhotoPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleFoodSearch = async () => {
    if (!foodQuery.trim()) return;
    setSearchLoading(true);
    setError(null);

    try {
      const res = await mealService.searchFood(foodQuery);
      if (res.success) setFoodResults(res.data || []);
      else {
        setFoodResults([]);
        setError(res.message || "Food search failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Food search failed";
      setError(msg);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setName(food.name);
    setCalories(food.perServing.calories);
    setProtein(food.perServing.protein);
    setCarbs(food.perServing.carbs);
    setFat(food.perServing.fat);
    setFoodResults([]);
  };

  const resetForm = () => {
    setName("");
    setMealType("breakfast");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);

    setExistingPhotos([]);
    setRemovedPhotos([]);

    newPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    setNewPhotoFiles([]);
    setNewPhotoPreviewUrls([]);

    setFoodQuery("");
    setFoodResults([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: MealFormData = {
        name: name.trim(),
        mealType,
        nutrition: {
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fat: Number(fat),
        },
        ...(newPhotoFiles.length > 0 ? { photos: newPhotoFiles } : {}),
        ...(mealToEdit ? { removedPhotos } : {}),
      };

      if (mealToEdit) {
        await mealService.updateMeal(mealToEdit._id, data);
      } else {
        await mealService.createMeal(data);
      }

      resetForm();
      onMealCreated();
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.join?.(", ") ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to log meal";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block mb-1 font-medium">Search Food</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search food..."
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleFoodSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>

          {foodResults.length > 0 && (
            <ul className="border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto bg-white absolute z-10 w-full shadow">
              {foodResults.map((food, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectFood(food)}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={food.image}
                    alt={food.name}
                    className="h-10 w-10 object-cover rounded mr-2"
                  />
                  <div>
                    <div className="font-semibold">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      {food.perServing.calories} kcal | {food.perServing.protein}g P |{" "}
                      {food.perServing.carbs}g C | {food.perServing.fat}g F
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Meal Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Meal Type</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealFormData["mealType"])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Calories</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Protein (g)</label>
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Carbohydrates (g)</label>
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Fat (g)</label>
        <input
          type="number"
          value={fat}
          onChange={(e) => setFat(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">
          Photos (optional) — JPG/PNG/WebP
        </label>

        {mealToEdit && keptExistingPhotos.length > 0 && (
          <div className="mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {keptExistingPhotos.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={toFileProxyUrl(url)}
                    alt={`existing-${idx}`}
                    className="w-full h-28 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingPhoto(url)}
                    className="absolute top-1 right-1 px-2 py-1 bg-red-600 text-white text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mealToEdit && removedPhotos.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">
              Removed (will be deleted when you save):
            </p>
            <div className="flex flex-wrap gap-2">
              {removedPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUndoRemoveExistingPhoto(url)}
                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                >
                  Undo remove #{idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={handlePhotoChange}
          className="w-full"
        />

        {newPhotoPreviewUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {newPhotoPreviewUrls.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-28 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : mealToEdit ? "Update Meal" : "Log Meal"}
      </button>
    </form>
  );
};

export default MealForm;
