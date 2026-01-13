import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (localStorage.getItem("justRegistered") === "true") {
      setShowWelcome(true);
      localStorage.removeItem("justRegistered");
    }
  }, []);

  

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />
      <div className="p-5 max-w-7xl mx-auto">
        {showWelcome ? (
          <div className="p-5 bg-green-100 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to Fitness Tracker,{" "}
              {user?.firstName
                ? user.firstName.charAt(0).toUpperCase() +
                user.firstName.slice(1).toLowerCase()
                : ""}
              !
            </h2>
            <p className="text-gray-700 mb-2">
              Thanks for joining! Start logging your workouts and meals today.
            </p>
          </div>
        ) : (
          <div className="p-5 bg-gray-100 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome Back,{" "}
              {user?.firstName
                ? user.firstName.charAt(0).toUpperCase() +
                user.firstName.slice(1).toLowerCase()
                : ""}
              !
            </h2>
            <p className="text-gray-700 mb-2">What would you like to do today?</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <button
            type="button"
            onClick={() => navigate("/workouts")}
            className="p-5 rounded-lg text-center transition-colors bg-blue-50 hover:bg-blue-100"
          >
            <h3 className="text-xl font-semibold mb-2">Workouts</h3>
            <p className="text-gray-600">Track your exercises and routines</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/meals")}
            className="p-5 rounded-lg text-center transition-colors bg-purple-50 hover:bg-purple-100"
          >
            <h3 className="text-xl font-semibold mb-2">Meals</h3>
            <p className="text-gray-600">Log your nutrition and calories</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/progress")}
            className="p-5 rounded-lg text-center transition-colors bg-green-50 hover:bg-green-100"
          >
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <p className="text-gray-600">Monitor your fitness journey</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/feed")}
            className="p-5 rounded-lg text-center transition-colors bg-orange-50 hover:bg-orange-100"
          >
            <h3 className="text-xl font-semibold mb-2">Social Feed</h3>
            <p className="text-gray-600">View all recent activity</p>
          </button>
        </div>

        <div className="mt-10 p-5 bg-white border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
          <p className="mb-3">
            This is your fitness tracking dashboard. Here you can:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Log your workouts and track exercises</li>
            <li>Record meals and monitor nutrition</li>
            <li>Track your progress with weight, PRs, and photos</li>
            <li>Share your fitness journey with others</li>
            <li>View and interact with other users' posts</li>
          </ul>
          <p className="mt-4 italic text-gray-600">
            More features coming soon...
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
