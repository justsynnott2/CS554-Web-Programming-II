import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { userService } from "../services/userService";
import {weightProgressService, prExerciseService, prProgressService} from "../services/progressService";
import { PRExercise, PRHistoryResponse } from "../types";

import "chart.js/auto";
import { Line } from "react-chartjs-2";

const Progress: React.FC = () => {
    const {user, logout, updateUser} = useAuth();
    const navigate = useNavigate();

    const MIN_WEIGHT_LBS = 0.1;
    const MAX_WEIGHT_LBS = 1100;
    const MIN_GOAL_WEIGHT_LBS = 44;

    const [progressType, setProgressType] = useState<"weight" | "pr">("weight");
    const [weightEntries, setWeightEntries] = useState<any[]>([]);
    const [prExercises, setPRExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [goalWeight, setGoalWeight] = useState<number | null>(null);
    const [goalInput, setGoalInput] = useState("");
    const [savingGoal, setSavingGoal] = useState(false);
    const [goalBanner, setGoalBanner] = useState<{entryId: string; goal: number} | null>(null);
    const [dismissedGoalBanner, setDismissedGoalBanner] = useState(false);

    const [newWeight, setNewWeight] = useState("");
    const [saving, setSaving] = useState(false);

    const [newWorkout, setNewWorkout] = useState("");
    const [newPRValue, setNewPRValue] = useState("");
    const [savingPR, setSavingPR] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<PRExercise | null>(null);
    const [prHistoryData, setPRHistoryData] = useState<PRHistoryResponse | null>(null);

    useEffect(() => {
        if (progressType !== "weight") return;
        const fetchWeights = async () => {
            try {
                setLoading(true);
                const res = await weightProgressService.getWeightProgress();
                setWeightEntries(res.data?.entries ?? []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchWeights();
    }, [progressType]);

    useEffect(() => {
        if (progressType !== "pr") return;
        const fetchPRs = async () => {
            try {
                setLoading(true);
                const res = await prExerciseService.getPRExercises();
                setPRExercises(res.data ?? []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPRs();
    }, [progressType]);

    useEffect(() => {
        if (user?.goalWeight) {
            setGoalWeight(user.goalWeight);
            setGoalInput(user.goalWeight.toString());
        }
    }, [user]);

    useEffect(() => {
        setDismissedGoalBanner(false);
        setGoalBanner(null);
    }, [goalWeight]);

    useEffect(() => {
        if (!selectedExercise) return;
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await prProgressService.getPRHistory(selectedExercise._id);
                setPRHistoryData(res.data ?? null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [selectedExercise]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getApiErrorMessage = (err: any, fallback = "Something went wrong") => {
        return (
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            fallback
        );
    };  

    const handleSaveGoalWeight = async () => {
        if (!goalInput) return;
        const goal = Number(goalInput);
        if (Number.isNaN(goal) || goal < MIN_GOAL_WEIGHT_LBS || goal > MAX_WEIGHT_LBS) {
            setError(`Goal weight must be between ${MIN_GOAL_WEIGHT_LBS} and ${MAX_WEIGHT_LBS} lbs`);
            return;
        }

        try {
            setSavingGoal(true);

            const response = await userService.updateWeightGoal(
                goal
            );

            if (response.data && user) {
                updateUser({
                    ...user,
                    goalWeight: response.data.goalWeight,
                });
            }

            const latestEntryId = weightEntries.length > 0 ? String(weightEntries[0]?._id ?? "") : "";
            const latestWeight = weightEntries.length > 0 ? Number(weightEntries[0]?.weight) : null;
            const EPSILON = 0.05;
            if (latestEntryId && latestWeight !== null && !Number.isNaN(latestWeight) && Math.abs(latestWeight - goal) <= EPSILON) {
                setGoalBanner({ entryId: latestEntryId, goal });
                setDismissedGoalBanner(false);
            }

            alert("Goal weight updated!");
        } catch (err: any) {
            alert(err.message || "Failed to save goal weight");
        } finally {
            setSavingGoal(false);
        }
    };

    const handleAddWeight = async () => {
        if (!newWeight) return;
        const weight = Number(newWeight);
        if (Number.isNaN(weight) || weight < MIN_WEIGHT_LBS || weight > MAX_WEIGHT_LBS) {
            setError(`Weight must be between ${MIN_WEIGHT_LBS} and ${MAX_WEIGHT_LBS} lbs`);
            return;
        }
        try {
            setSaving(true);
            const prevLatestWeight = weightEntries.length > 0 ? Number(weightEntries[0]?.weight) : null;
            const res = await weightProgressService.createWeightProgress({weight});
            if (res.data) {
                setWeightEntries(prev => [res.data, ...prev]);

                if (goalWeight !== null) {
                    const goal = Number(goalWeight);
                    const nextWeight = Number(res.data.weight);
                    const EPSILON = 0.05;
                    const reachedExactly = Number.isFinite(nextWeight) && Math.abs(nextWeight - goal) <= EPSILON;
                    const crossed =
                        prevLatestWeight !== null &&
                        Number.isFinite(prevLatestWeight) &&
                        ((prevLatestWeight > goal && nextWeight < goal) || (prevLatestWeight < goal && nextWeight > goal));

                    if ((reachedExactly || crossed) && res.data._id) {
                        setGoalBanner({ entryId: String(res.data._id), goal });
                        setDismissedGoalBanner(false);
                    }
                }
            }
            setNewWeight("");
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to add weight!"));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWeight = async (id: string) => {
        if (!window.confirm("Delete this entry?")) return;
        await weightProgressService.deleteWeightProgress(id);
        setWeightEntries(prev => prev.filter(e => e._id !== id));
    };

    const weightChartData = {
        labels: [...weightEntries].reverse().map(e => new Date(e.date).toLocaleDateString()),
        datasets: [
            {
                label: "Weight (lbs)",
                data: [...weightEntries].reverse().map(e => e.weight),
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.3,
                fill: true,
            },
            ...(goalWeight !== null
                ? [
                    {
                        label: "Goal Weight",
                        data: Array(weightEntries.length).fill(goalWeight),
                        borderColor: "rgb(255, 99, 132)",
                        borderDash: [6, 6],
                        pointRadius: 0,
                    },
                ]
                : []),
        ],
    };

    const weightChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: "Weight (lbs)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };

    const showGoalBanner =
        !dismissedGoalBanner &&
        goalBanner !== null &&
        goalWeight !== null &&
        goalBanner.goal === Number(goalWeight);

    const handleAddExercise = async () => {
        if (!newWorkout) return;
        try {
            setSavingPR(true);
            const res = await prExerciseService.createPRExercise(newWorkout);
            if (res.data) {
                setPRExercises(prev => [...prev, res.data]);
                setNewWorkout("");
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to add exercise!"));
        } finally {
            setSavingPR(false);
        }
    };

    const handleSetPR = async () => {
        if (!selectedExercise) return;
        if (!isValidPRValue(selectedExercise.unit, newPRValue)) {
            setError(selectedExercise.unit === "time" ? "Time must be in h:mm:ss format (e.g. 0:05:30)" : "Please enter a valid positive number");
            return;
        }
        try {
            setSavingPR(true);
            const parsedValue = parsePRValue(selectedExercise.unit, newPRValue);
            const res = await prProgressService.setPR(selectedExercise._id, parsedValue);
            if (res.data) {
                const newPR = res.data;
                setPRHistoryData(prev => prev ? {...prev, prs: [newPR, ...prev.prs], current: newPR} : prev);
                setNewPRValue("");
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to set PR!"));
        } finally {
            setSavingPR(false);
        }
    };

    const handleViewExercise = (exercise: PRExercise) => {
        if (selectedExercise === exercise){;
            setSelectedExercise(null)
        } else {
            setSelectedExercise(exercise);
        }
    };

    const TIME_REGEX = /^(\d+):([0-5]\d):([0-5]\d)$/;
    const isValidPRValue = (unit: PRExercise["unit"], value: string): boolean => {
        if (!value.trim()) return false;
        switch (unit) {
            case "time": {
                if (!TIME_REGEX.test(value)) return false;
                const [h, m, s] = value.split(":").map(Number);
                const totalSeconds = h * 3600 + m * 60 + s;
                return Number.isFinite(totalSeconds) && totalSeconds > 0;
            }
            case "reps":
                return Number.isInteger(Number(value)) && Number(value) > 0;
            case "lbs":
                return !isNaN(Number(value)) && Number(value) > 0;
            default:
                return false;
        }
    };

    const parsePRValue = (unit: PRExercise["unit"], value: string): number => {
        switch (unit) {
            case "time": {
                const [h, m, s] = value.split(":").map(Number);
                return h * 3600 + m * 60 + s;
            }
            default:
                return Number(value);
        }
    };

    const formatPRValue = (unit: PRExercise["unit"], value: number): string | number => {
        if (unit === "time") {
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = value % 60;
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return value;
    };

    const handleUpdateExerciseUnit = async (exercise: PRExercise, unit: PRExercise["unit"]) => {
        try {
            setSavingPR(true);
            const res = await prExerciseService.updatePRExercise(exercise._id, {unit});
            if (res.data) {
                setPRExercises(prev => prev.map(ex => ex._id === exercise._id ? res.data! : ex));
                if (selectedExercise?._id === exercise._id) {
                    setSelectedExercise(res.data);
                    setPRHistoryData(prev => prev ? {...prev, exercise: res.data!} : prev);
                }
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to update Unit"));
        } finally {
            setSavingPR(false);
        }
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        const exercise = prExercises.find(e => e._id === exerciseId);
        if (!exercise) return;
        if (!window.confirm(`Delete "${exercise.name}" and all its PR history? This cannot be undone.`)) {
            return;
        }
        try {
            setSavingPR(true);
            await prExerciseService.deletePRExercise(exerciseId);
            setPRExercises(prev => prev.filter(ex => ex._id !== exerciseId));
            if (selectedExercise?._id === exerciseId) {
                setSelectedExercise(null);
                setPRHistoryData(null);
                setNewPRValue("");
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to delete exercise"));
        } finally {
            setSavingPR(false);
        }
    };

    const handleDeletePR = async (prId: string) => {
        if (!window.confirm("Delete this PR entry?")) return;
        try {
            setSavingPR(true);
            await prProgressService.deletePR(prId);
            setPRHistoryData(prev => prev ? {...prev, prs: prev.prs.filter(p => p._id !== prId), current: prev.current?._id === prId ?
                    prev.prs.find(p => p._id !== prId) || null : prev.current
                }: prev
            );
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to delete PR"));
        } finally {
            setSavingPR(false);
        }
    };

    const prChartData = prHistoryData ? {
          labels: [...prHistoryData.prs]
              .reverse()
              .map(p => new Date(p.createdAt).toLocaleDateString()),
          datasets: [
              {
                  label: `${prHistoryData.exercise.name} (${prHistoryData.exercise.unit})`,
                  data: [...prHistoryData.prs].reverse().map(p => p.value),
                  borderColor: "rgb(75, 192, 192)",
                  tension: 0.3,
              },
          ],
      }
    : null;

    return (
        <div>
            <Navbar isAuthenticated={true} onLogout={handleLogout} />
            <div style={{ marginBottom: "1rem" }}>
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">
                        <button onClick={() => setProgressType("weight")} className={`px-4 py-2 text-sm font-medium rounded-md transition ${progressType === "weight" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-800"}`}>
                            Weight
                        </button>
                        <button onClick={() => setProgressType("pr")} className={`px-4 py-2 text-sm font-medium rounded-md transition ${progressType === "pr" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-800"}`}>
                            PRs
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 max-w-6xl mx-auto px-4">
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center justify-between gap-4">
                            <p className="text-sm text-red-700 flex-1">{error}</p>
                            <button onClick={() => setError(null)} aria-label="Dismiss error" className="text-red-600 hover:text-red-800 transition font-semibold text-lg leading-none">
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {progressType === "weight" && (
                    <div className="max-w-6xl mx-auto px-4 space-y-6">
                        {}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                            <div>
                                <h2 className="text-2xl font-semibold">Weight Progress</h2>
                                {weightEntries.length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {weightEntries.length} entr{weightEntries.length === 1 ? "y" : "ies"} logged
                                </p>
                                )}
                            </div>

                            {}
                            <div className="flex items-center gap-2">
                                <input type="number" min={MIN_GOAL_WEIGHT_LBS} max={MAX_WEIGHT_LBS} step="0.1" placeholder="Goal (lbs)" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"/>
                                <button onClick={handleSaveGoalWeight} disabled={!goalInput || savingGoal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium">
                                    {savingGoal ? "Saving..." : "Save Goal"}
                                </button>
                            </div>
                        </div>

                        {showGoalBanner && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between gap-4">
                                <p className="text-sm text-green-800">
                                    <span className="font-semibold">Goal achieved!</span>{" "}
                                    You’ve reached your goal weight of <span className="font-semibold">{goalWeight} lbs</span>.
                                </p>
                                <button
                                    onClick={() => setDismissedGoalBanner(true)}
                                    aria-label="Dismiss goal achieved message"
                                    className="text-green-700 hover:text-green-900 transition font-semibold text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {}
                        {weightEntries.length > 0 && (
                            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                                <div className="max-w-3xl">
                                    <Line data={weightChartData} options={weightChartOptions} />
                                </div>
                            </div>
                        )}

                        {}
                        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <input type="number" min={MIN_WEIGHT_LBS} max={MAX_WEIGHT_LBS} step="0.1" placeholder="Enter weight (lbs)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 w-56"/>
                                <button onClick={handleAddWeight} disabled={!newWeight || saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-medium">
                                    {saving ? "Saving..." : "Add"}
                                </button>
                            </div>
                        </div>

                        {}
                        {weightEntries.length === 0 ? (
                            <div className="text-center py-10 bg-white border border-gray-300 rounded-lg">
                                <p className="text-gray-600">
                                    No weight entries yet. Start tracking your progress!
                                </p>
                            </div>
                            ) : (
                            <div className="bg-white border border-gray-300 rounded-lg shadow-sm divide-y">
                                {weightEntries.map((e) => (
                                    <div key={e._id} className="flex items-center justify-between px-6 py-4">
                                        <span className="text-sm text-gray-700">
                                            {new Date(e.date).toLocaleDateString()} –{" "}
                                            <span className="font-semibold">{e.weight} lbs</span>
                                        </span>
                                        <button onClick={() => handleDeleteWeight(e._id)} className="text-xs text-red-600 hover:text-red-800 transition">
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {progressType === "pr" && (
                    <div>
                        {}
                        <div className="mb-6 px-6 md:px-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                <div>
                                    <h2 className="text-2xl font-semibold">Personal Records</h2>
                                    {!loading && prExercises.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {prExercises.length} exercise
                                            {prExercises.length !== 1 ? "s" : ""} tracked
                                        </p>
                                    )}
                                </div>

                                {}
                                <div className="flex items-center gap-2">
                                    <input value={newWorkout} onChange={(e) => setNewWorkout(e.target.value)} placeholder="New exercise" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    <button onClick={handleAddExercise}disabled={!newWorkout || savingPR} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium">
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {}
                        {loading ? (
                            <div className="text-center py-10">
                                <p className="text-gray-600">Loading PRs...</p>
                            </div>
                        ) : prExercises.length === 0 ? (
                            
                            <div className="text-center py-10 bg-white border border-gray-300 rounded-lg">
                                <p className="text-gray-600 mb-4">
                                    No PR exercises yet. Add your first lift to get started!
                                </p>
                            </div>
                        ) : (
                            
                            <div className="px-6 md:px-8">
                                <div className="space-y-4">
                                    {prExercises.map((exercise) => {
                                        const isSelected = selectedExercise?._id === exercise._id;
                                        return (
                                            <div key={exercise._id} className={`bg-white border border-gray-300 rounded-lg p-6 shadow-sm ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
                                                {}
                                                <div className="flex justify-between items-start mb-4">
                                                    {}
                                                    <div>
                                                        <h3 className="text-xl font-semibold mb-1">
                                                            {exercise.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span>Unit:</span>
                                                            <select value={exercise.unit} disabled={savingPR} onChange={(e) => handleUpdateExerciseUnit(exercise, e.target.value as PRExercise["unit"])} className="px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                                <option value="lbs">lbs</option>
                                                                <option value="reps">reps</option>
                                                                <option value="time">time</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    {}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleViewExercise(exercise)} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition">
                                                            {isSelected ? "Viewing" : "View"}
                                                        </button>
                                                        <button onClick={() => handleDeleteExercise(exercise._id)} disabled={savingPR} className="px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {}
                                                {isSelected && prHistoryData && (
                                                    <div>
                                                        {prHistoryData.current && (
                                                            <p className="text-sm text-gray-700 mb-4">
                                                                🏆 Current PR:{" "}
                                                                <span className="font-semibold">
                                                                    {formatPRValue(exercise.unit, prHistoryData.current.value)}{" "}
                                                                    {exercise.unit !== 'time' ? exercise.unit : ""}
                                                                </span>
                                                            </p>
                                                        )}

                                                        {}
                                                        {prHistoryData.prs.length > 0 && (
                                                            <div className="mb-6 max-w-2xl">
                                                                <Line data={prChartData!} />
                                                            </div>
                                                        )}

                                                        {}
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <input value={newPRValue} onChange={(e) => setNewPRValue(e.target.value)} placeholder={exercise.unit === "time" ? "hh:mm:ss" : `New PR (${exercise.unit})`} inputMode={exercise.unit === "time" ? "text" : "numeric"}/>
                                                            <button onClick={handleSetPR} disabled={!newPRValue || savingPR} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium">
                                                                Set PR
                                                            </button>
                                                        </div>

                                                        {}
                                                        <ul className="text-sm text-gray-700 space-y-2">
                                                            {prHistoryData.prs.map((p) => (
                                                                <li key={p._id} className="flex items-center gap-2">
                                                                    <span>
                                                                        {new Date(p.createdAt).toLocaleDateString()} – {formatPRValue(exercise.unit, p.value)} {exercise.unit !== 'time' ? exercise.unit : ""}
                                                                    </span>
                                                                    <button onClick={() => handleDeletePR(p._id)} disabled={savingPR} className="text-xs text-red-600 hover:text-red-800 transition">
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Progress;
