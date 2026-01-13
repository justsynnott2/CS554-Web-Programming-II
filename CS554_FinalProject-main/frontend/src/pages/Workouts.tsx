import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { workoutService } from "../services/workoutService";
import { Exercise, Workout, WorkoutFormData } from "../types";

const Workouts: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [removedMedia, setRemovedMedia] = useState<string[]>([]);

  const [formData, setFormData] = useState<WorkoutFormData>({
    title: "",
    split: "",
    exercises: [],
    date: new Date().toISOString().split("T")[0],
    duration: undefined,
    notes: "",
    media: [],
    removedMedia: [],
  });

  const ALLOWED_IMAGE_TYPES = useMemo(() => new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]), []);
  const ALLOWED_VIDEO_TYPES = useMemo(() => new Set(["video/mp4", "video/webm", "video/quicktime"]), []);
  const ACCEPT_ATTR = "image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime";
  const FILES_BASE = (process.env.REACT_APP_API_URL || "/api").replace(/\/$/, "") + "/files/";

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [mediaPreviewUrls]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workoutService.getWorkouts();

      if (response.success && response.data) {
        let workoutsList: Workout[] = [];
        const dataAny: any = response.data;

        if (dataAny.workouts && Array.isArray(dataAny.workouts)) workoutsList = dataAny.workouts;
        else if (Array.isArray(dataAny)) workoutsList = dataAny;

        setWorkouts(workoutsList);
      } else {
        setWorkouts([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load workouts");
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    setFormData((prev) => {
      const newExercises = [...prev.exercises];
      newExercises[index] = {
        ...newExercises[index],
        [field]: field === "sets" || field === "reps" || field === "weight" ? Number(value) : value,
      };
      return { ...prev, exercises: newExercises };
    });
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 1, reps: 1, weight: 0 }],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const getExtFromUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const pathname = u.pathname.toLowerCase();
      const parts = pathname.split(".");
      return parts.length > 1 ? parts[parts.length - 1] : "";
    } catch {
      const noQuery = url.split("?")[0].toLowerCase();
      const parts = noQuery.split(".");
      return parts.length > 1 ? parts[parts.length - 1] : "";
    }
  };

  const toFileProxyUrl = (url: string): string => {
    if (url.includes("/api/files/") || url.includes("/files/")) return url;
    const noQuery = url.split("?")[0];
    const parts = noQuery.split("/");
    const objectName = parts[parts.length - 1];
    if (!objectName) return url;
    return FILES_BASE + encodeURIComponent(objectName);
  };

  const getVideoMimeFromExt = (ext: string): string | null => {
    if (ext === "mp4") return "video/mp4";
    if (ext === "webm") return "video/webm";
    if (ext === "mov") return "video/quicktime";
    if (ext === "m4v") return "video/mp4";
    return null;
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const invalid = files.filter(
      (f) => !(ALLOWED_IMAGE_TYPES.has(f.type) || ALLOWED_VIDEO_TYPES.has(f.type))
    );
    if (invalid.length > 0) {
      setError("Only JPG/PNG/WebP images and MP4/WebM/MOV videos are allowed.");
      e.target.value = "";
      return;
    }

    const keptExistingCount = existingMedia.filter((u) => !removedMedia.includes(u)).length;
    const totalAfter = keptExistingCount + files.length;
    if (totalAfter > 5) {
      setError(`You can only have up to 5 media items total. You currently have ${keptExistingCount} kept, and selected ${files.length}.`);
      e.target.value = "";
      return;
    }

    mediaPreviewUrls.forEach((u) => URL.revokeObjectURL(u));

    setMediaFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setMediaPreviewUrls(previews);

    setFormData((prev) => ({
      ...prev,
      media: files,
    }));
  };

  const handleRemoveExistingMedia = (url: string) => {
    setRemovedMedia((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleUndoRemoveExistingMedia = (url: string) => {
    setRemovedMedia((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.split || formData.exercises.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    const invalidExercises = formData.exercises.filter(
      (ex) => !ex.name || !ex.name.trim() || ex.sets < 1 || ex.reps < 1 || ex.weight < 0
    );
    if (invalidExercises.length > 0) {
      setError("Please ensure all exercises have a name, at least 1 set, at least 1 rep, and weight >= 0");
      return;
    }

    try {
      const workoutData: WorkoutFormData = {
        title: formData.title.trim(),
        split: formData.split,
        exercises: formData.exercises.map((ex) => ({
          name: ex.name.trim(),
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          weight: Number(ex.weight),
          notes: ex.notes?.trim() || undefined,
        })),
        date: formData.date,
        duration: formData.duration ? Number(formData.duration) : undefined,
        notes: formData.notes?.trim() || undefined,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
        removedMedia: removedMedia,
      };

      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout._id, workoutData);
      } else {
        await workoutService.createWorkout(workoutData);
      }

      setShowForm(false);
      setEditingWorkout(null);
      resetForm();
      await loadWorkouts();
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to save workout");
      }
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);

    const media = Array.isArray(workout.media) ? workout.media : [];
    setExistingMedia(media);
    setRemovedMedia([]);

    setFormData({
      title: workout.title,
      split: workout.split,
      exercises: workout.exercises,
      date: workout.date.split("T")[0],
      duration: workout.duration,
      notes: workout.notes || "",
      media: [],
      removedMedia: [],
    });

    mediaPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    setMediaFiles([]);
    setMediaPreviewUrls([]);

    setShowForm(true);
  };

  const handleDelete = async (workoutId: string) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;

    try {
      setError(null);
      await workoutService.deleteWorkout(workoutId);
      setWorkouts((prev) => prev.filter((w) => w._id !== workoutId));
      await loadWorkouts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete workout");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      split: "",
      exercises: [],
      date: new Date().toISOString().split("T")[0],
      duration: undefined,
      notes: "",
      media: [],
      removedMedia: [],
    });

    setExistingMedia([]);
    setRemovedMedia([]);

    mediaPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    setMediaFiles([]);
    setMediaPreviewUrls([]);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const keptExistingMedia = existingMedia.filter((u) => !removedMedia.includes(u));

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />

      <div className="p-5 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workouts</h1>
            {!loading && workouts.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {workouts.length} workout{workouts.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingWorkout(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
          >
            + New Workout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">
              {editingWorkout ? "Edit Workout" : "Create New Workout"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Split *</label>
                  <select
                    name="split"
                    value={formData.split}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select split</option>
                    <option value="Push">Push</option>
                    <option value="Pull">Pull</option>
                    <option value="Legs">Legs</option>
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Media (optional) — JPG/PNG + MP4/WebM
                </label>

                {editingWorkout && keptExistingMedia.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {keptExistingMedia.map((url, idx) => {
                        const ext = getExtFromUrl(url);
                        const videoMime = getVideoMimeFromExt(ext);
                        const src = toFileProxyUrl(url);

                        return (
                          <div key={idx} className="relative">
                            {videoMime ? (
                              <video controls className="w-full h-28 rounded border">
                                <source src={src} type={videoMime} />
                              </video>
                            ) : (
                              <img src={src} alt={`existing-${idx}`} className="w-full h-28 object-cover rounded border" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingMedia(url)}
                              className="absolute top-1 right-1 px-2 py-1 bg-red-600 text-white text-xs rounded"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editingWorkout && removedMedia.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Removed (will be deleted when you save):</p>
                    <div className="flex flex-wrap gap-2">
                      {removedMedia.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUndoRemoveExistingMedia(url)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                        >
                          Undo remove #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input type="file" multiple accept={ACCEPT_ATTR} onChange={handleMediaChange} className="w-full" />

                {mediaPreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {mediaPreviewUrls.map((src, idx) => {
                      const f = mediaFiles[idx];
                      const isVideo = f?.type?.startsWith("video/");
                      if (isVideo) {
                        return (
                          <video key={idx} controls className="w-full h-28 rounded border">
                            <source src={src} type={f.type} />
                          </video>
                        );
                      }
                      return (
                        <img key={idx} src={src} alt={`media-${idx}`} className="w-full h-28 object-cover rounded border" />
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Exercises *</label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Exercise
                  </button>
                </div>

                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                        required
                        minLength={1}
                        maxLength={100}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets || ""}
                        onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                        min="1"
                        max="10"
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={exercise.reps || ""}
                        onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                        min="1"
                        max="50"
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={exercise.weight || ""}
                        onChange={(e) => handleExerciseChange(index, "weight", e.target.value)}
                        min="0"
                        max="1000"
                        step="0.5"
                        required
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={exercise.notes || ""}
                      onChange={(e) => handleExerciseChange(index, "notes", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    />
                  </div>
                ))}

                {formData.exercises.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No exercises added. Click "Add Exercise" to get started.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                >
                  {editingWorkout ? "Update Workout" : "Create Workout"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWorkout(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-300 rounded-lg">
            <p className="text-gray-600 mb-4">No workouts yet. Create your first workout to get started!</p>
            <button
              onClick={() => {
                resetForm();
                setEditingWorkout(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
            >
              + Create Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => {
              if (!workout || !workout._id) return null;

              return (
                <div key={workout._id} className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{workout.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{workout.split}</span>
                        <span>{formatDate(workout.date)}</span>
                        {workout.duration && <span>{workout.duration} min</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(workout)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workout._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {workout.media && workout.media.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Media:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {workout.media.map((url, idx) => {
                          const ext = getExtFromUrl(url);
                          const videoMime = getVideoMimeFromExt(ext);
                          const src = toFileProxyUrl(url);

                          if (videoMime) {
                            return (
                              <video key={idx} controls className="w-full h-28 rounded border">
                                <source src={src} type={videoMime} />
                              </video>
                            );
                          }

                          return (
                            <img
                              key={idx}
                              src={src}
                              alt={`workout-media-${idx}`}
                              className="w-full h-28 object-cover rounded border"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Exercises:</h4>
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-sm text-gray-600">
                              {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} lbs
                            </span>
                          </div>
                          {exercise.notes && <p className="text-sm text-gray-600 italic">{exercise.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Notes: </span>
                        {workout.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Workouts;
