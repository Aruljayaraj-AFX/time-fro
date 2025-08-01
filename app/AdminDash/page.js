"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  KeyRound,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  LineChart,
} from "lucide-react";
export const dynamic = 'force-dynamic';


export default function AdminDash() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [teamCount, setTeamCount] = useState(0);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [todaySubmissions, setTodaySubmissions] = useState(0);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/LoginPage");
        return;
      }

      try {
        // Validate token
        const response = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/security_check/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Invalid token");

        // Get team members
        const userRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/username_list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (userRes.ok) {
          const usernames = await userRes.json();
          setTeamCount(usernames.length);
        }

        // Get active projects and total hours
        const projectRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-projects",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (projectRes.ok) {
          const data = await projectRes.json();
          setActiveProjectCount(data.project_count || 0);
          setTotalHours(data.overall_hours || 0);
        }

        // Get today's submissions
        const todaySubRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/today_sub",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (todaySubRes.ok) {
          const data = await todaySubRes.json();
          setTodaySubmissions(data.today_submissions || 0);
        }

        // Get project hour distribution
        const proDetailRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/pro_details",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (proDetailRes.ok) {
          const data = await proDetailRes.json();
          const colors = ["bg-indigo-600", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500"];
          const projects = (data.projects || []).map((p, i) => ({
            name: p.project_name,
            hours: p.hour_contribution,
            color: colors[i % colors.length],
          }));
          setDistribution(projects);
        }
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("token");
        router.push("/LoginPage");
      }
    };

    validateToken();
  }, [router]);

  const handleChange = () => router.push("/ChangePasscopy");
  const handleOut = () => {
    localStorage.removeItem("token");
    router.push("/LoginPage");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const routeMap = {
      Overview: "/AdminDash",
      Projects: "/Projects",
      Employees: "/Employee",
      Report: "/EmployeeCopy",
      "Power BI": "/PowerBI",
    };
    router.push(routeMap[tab]);
  };

  const tabs = [
    { name: "Overview", icon: LineChart },
    { name: "Projects", icon: Briefcase },
    { name: "Employees", icon: Users },
    { name: "Report", icon: Users },
    { name: "Power BI", icon: LineChart },
  ];

  const total = distribution.reduce((sum, p) => sum + (p.hours || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border-b bg-white">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Project Manager Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, Keerthana</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleChange}
            className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-200"
          >
            <KeyRound size={14} />
            <span>Change Password</span>
          </button>
          <button
            onClick={handleOut}
            className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-100"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center mt-4 px-4">
        <div className="flex rounded-full bg-gray-100 px-6 py-2 shadow-inner overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-500"} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Panels */}
      {activeTab === "Overview" && (
        <main className="p-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Team Members" count={teamCount.toString()} color="blue" icon={<Users size={20} />} />
            <Card title="Active Projects" count={activeProjectCount.toString()} color="green" icon={<Briefcase size={20} />} />
            <Card title="Total Hours" count={`${totalHours}h`} color="orange" icon={<Clock size={20} />} />
            <Card title="Today's Submissions" count={todaySubmissions.toString()} color="purple" icon={<TrendingUp size={20} />} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-gray-600">Project Hours Distribution</h2>
              <p className="text-sm text-gray-600 mb-4">Total hours worked per project</p>
              <div className="space-y-4 text-gray-500">
                {distribution.map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-sm font-medium">{p.hours}h</span>
                    </div>
                  </div>
                ))}
                {distribution.length === 0 && (
                  <div className="text-gray-400 text-sm">No projects found.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// Card component
function Card({ title, count, color, icon }) {
  const map = {
    blue: { from: "from-blue-500", to: "to-blue-300", text: "text-blue-600" },
    green: { from: "from-green-500", to: "to-green-300", text: "text-green-600" },
    orange: { from: "from-orange-500", to: "to-orange-300", text: "text-orange-600" },
    purple: { from: "from-purple-500", to: "to-purple-300", text: "text-purple-600" },
  };
  const c = map[color];
  return (
    <div className={`bg-gradient-to-r ${c.from} ${c.to} p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:border-2 hover:border-gray-200 transition-all duration-300`}>
      <div className={`${c.text} bg-white p-2 rounded-full`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-lg font-semibold text-white">{count}</p>
      </div>
    </div>
  );
}