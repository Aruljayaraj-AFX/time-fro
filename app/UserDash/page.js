"use client";
import { useState, useEffect } from "react";
export const dynamic = 'force-dynamic';
import {
  Clock,
  TrendingUp,
  Briefcase,
  Activity,
  LogOut,
  KeyRound,
  Plus,
  Layout,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDash() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    total_hours: 0,
    active_projects: 0,
    daily_contribution: 0,
    weekly_hours: 0,
  });

  const [projectProgress, setProjectProgress] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [dateResults, setDateResults] = useState([]);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("utoken");
      if (!token) {
        router.push("./LoginPage");
        return;
      }

      try {
        const res = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/u_security_checku/",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          localStorage.removeItem("utoken");
          router.push("./LoginPage");
          return;
        }

        const authData = await res.json();
        if (authData?.detail === "Not authenticated") {
          localStorage.removeItem("utoken");
          router.push("./LoginPage");
          return;
        }

        // Fetch dashboard data
        const hourRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/hour_details",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (hourRes.ok) {
          const data = await hourRes.json();
          setDashboardData({
            total_hours: data.total_hours || 0,
            active_projects: data.active_projects || 0,
            daily_contribution: data.daily_contribution || 0,
            weekly_hours: data.weekly_hours || 0,
          });

          setProjectProgress(data.projects || []);
        }

        // Fetch recent time entries
        const entryRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/recent_entries",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (entryRes.ok) {
          const entriesData = await entryRes.json();
          setRecentEntries(entriesData);
        }
      } catch (err) {
        console.error("Security or data fetch failed:", err);
        router.push("./LoginPage");
      }
    };

    verifyUser();
  }, []);

  const handleLogTime = () => router.push("./LogTime");
  const handleChange = () => router.push("./ChangePass");
  const handleOut = () => {
    localStorage.removeItem("utoken");
    router.push("./LoginPage");
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchDate.trim() !== "") {
      const token = localStorage.getItem("utoken");
      try {
        const res = await fetch(
          `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/date_fetch?date=${searchDate}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setDateResults(data.contributions || []);
        } else {
          setDateResults([]);
        }
      } catch (err) {
        console.error("Date fetch failed:", err);
        setDateResults([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b bg-white space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-800 rounded-full p-3">
            <Layout className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Team Member Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back,</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLogTime}
            className="flex items-center space-x-1 px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-900 transition"
          >
            <Plus size={14} />
            <span>Log Time</span>
          </button>

          <button
            onClick={handleChange}
            className="flex items-center space-x-1 px-3 py-2 border rounded-md text-sm text-gray-800 hover:bg-gray-100 transition"
          >
            <KeyRound size={14} />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleOut}
            className="flex items-center space-x-1 px-3 py-2 border rounded-md text-sm text-gray-800 hover:bg-gray-100 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Cards Section */}
      <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-300 p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:border-2 hover:border-gray-200">
          <div className="bg-orange-100 text-blue-600 p-2 rounded-full">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Total Hours</p>
            <p className="text-lg font-semibold">{dashboardData.total_hours}h</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-300 p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:border-2 hover:border-gray-200">
          <div className="bg-orange-100 text-green-600 p-2 rounded-full">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Today's Hours</p>
            <p className="text-lg font-semibold">{dashboardData.daily_contribution}h</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-300 p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:border-2 hover:border-gray-200">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Active Projects</p>
            <p className="text-lg font-semibold">{dashboardData.active_projects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-300 p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:border-2 hover:border-gray-200">
          <div className="bg-orange-100 text-purple-600 p-2 rounded-full">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">This Week</p>
            <p className="text-lg font-semibold">{dashboardData.weekly_hours}h</p>
          </div>
        </div>
      </main>

      {/* Project Progress */}
      <div className="bg-white rounded-xl border shadow-sm p-5 w-full mx-4">
        <div className="mb-1">
          <h3 className="text-sm font-semibold text-gray-800">Project Progress</h3>
          <p className="text-sm text-gray-500 mb-4">
            Hour contribution in all your assigned projects
          </p>
        </div>

        {projectProgress.map((project, index) => (
          <div key={index} className="border rounded-lg p-4 mb-3 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-semibold text-gray-800">{project.project_name}</h4>
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-medium">
                {project.hour_contribution}h
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.project_description}</p>
          </div>
        ))}
      </div>

      {/* Recent Entries + Search by Date */}
      <div className="bg-white rounded-xl border shadow-sm p-5 w-full mx-4 mt-4 sticky top-0 z-20">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Recent Time Entries</h3>
        <p className="text-sm text-gray-500 mb-4">Your latest logged work sessions</p>

        <div className="relative mb-4">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full border rounded-md px-4 py-2 text-sm text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {recentEntries.map((entry, index) => (
          <div
            key={index}
            className="flex justify-between items-center border rounded-md px-4 py-3 bg-white hover:bg-gray-50 transition mb-2"
          >
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                {entry.project}
              </p>
              <p className="text-sm text-gray-500">{entry.description}</p>
              <p className="text-xs text-gray-400">{entry.date}</p>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
              {entry.hours}h
            </span>
          </div>
        ))}

        {dateResults.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Time Log for: {searchDate}
            </h4>
            {dateResults.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded-md px-4 py-3 bg-white hover:bg-gray-50 transition mb-2"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.project_name}</p>
                  <p className="text-sm text-gray-500">{item.work_description}</p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
                  {item.hour_contribution}h
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
