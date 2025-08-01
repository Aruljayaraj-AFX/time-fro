"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';

import {
  LogOut,
  KeyRound,
  Users,
  Briefcase,
  LineChart,
} from "lucide-react";

export default function Projects() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Projects");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("token");

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

        if (!projectRes.ok) throw new Error("Initial project fetch failed");

        const data = await projectRes.json();
        localStorage.setItem("projects", JSON.stringify(data));

        const excludeKeys = ["overall_hours", "project_count"];
        const projectNames = Object.keys(data).filter(
          (key) => !excludeKeys.includes(key)
        );
        localStorage.setItem("projectNames", JSON.stringify(projectNames));

        const detailedProjects = await Promise.all(
          projectNames.map(async (name) => {
            try {
              const detailRes = await fetch(
                `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-project-details?pro_name=${encodeURIComponent(
                  name
                )}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (!detailRes.ok) throw new Error(`Failed to fetch ${name}`);
              const detail = await detailRes.json();

              return {
                name: detail.project_name,
                description: detail.project_description || `${name} project`,
                total_hours: detail.hour_contribution || 0,
                status: "Active",
                team_size: detail.project_members?.length || 0,
                members: detail.project_members.map((memberName) => ({
                  name: memberName,
                  initials: memberName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase(),
                })),
              };
            } catch (err) {
              console.warn(`Fallback for ${name}`, err);
              return {
                name,
                description: `${name} project`,
                total_hours: data[name]?.reduce?.((a, b) => a + b, 0) || 0,
                status: "Unknown",
                team_size: data[name]?.length || 0,
                members: [],
              };
            }
          })
        );

        setProjects(detailedProjects);
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("token");
        router.push("/LoginPage");
      }
    };

    fetchProjectData();
  }, []);

  const handleChange = () => router.push("./ChangePass");
  const handleOut = () => router.push("./LoginPage");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const routeMap = {
      Overview: "/AdminDash",
      Projects: "./Projects",
      Employees: "./Employee",
      Report: "./EmployeeCopy", // ✅ new route added
      "Power BI": "/powerbiPage",
    };
    router.push(routeMap[tab]);
  };
  const handleManage = () => router.push("/Manage");
  const handleVerify = () => router.push("/Verify");
  const handleAdd = () => router.push("/AddProject");

  const tabs = [
    { name: "Overview", icon: LineChart },
    { name: "Projects", icon: Briefcase },
    { name: "Employees", icon: Users },
    { name: "Report", icon: Users }, // ✅ new tab added
    { name: "Power BI", icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
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
        <div className="flex rounded-full bg-gray-100 px-9 py-2 shadow-inner overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
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

      {/* Project Header */}
      <div className="flex justify-between items-center my-6 px-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Project Management</h1>
          <p className="text-sm text-gray-500">Manage and monitor all active projects</p>
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90 text-sm flex items-center gap-1"
          onClick={handleAdd}
        >
          🧿 Add Project
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4 px-6 pb-6">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects found.</p>
        ) : (
          projects.map((project, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg text-gray-800 font-semibold">{project.name}</h2>
                  <p className="text-sm text-gray-800 mb-4">{project.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="px-3 py-0.5 text-xs font-semibold text-white bg-black rounded-full">
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-600">
                    Team Size:{" "}
                    <span className="text-black font-medium">{project.team_size}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-gray-800">
                  Total Hours:{" "}
                  <span className="font-semibold text-gray-800">
                    {project.total_hours || "0"}h
                  </span>
                </p>

                <p className="text-sm font-medium mb-2 text-gray-800">Assigned Team Members:</p>
                <div className="flex gap-3 flex-wrap">
                  {(project.members || []).map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 bg-gray-100 px-3 py-1 text-gray-800 rounded-full text-sm"
                    >
                      <span className="bg-gray-300 text-xs font-bold rounded-full px-2 py-1">
                        {member.initials}
                      </span>
                      <span>{member.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    className="px-4 py-2 bg-white border rounded text-gray-600 text-sm hover:bg-gray-50 flex items-center gap-1"
                    onClick={() => router.push(`/Manage?project=${encodeURIComponent(project.name)}`)}
                    >
                    ⚙️ Manage
                  </button>
                  <button
                    className="px-4 py-2 bg-white border rounded text-gray-600 text-sm hover:bg-gray-50 flex items-center gap-1"
                    onClick={() => router.push(`/Verify?project=${encodeURIComponent(project.name)}`)}
                    >
                    📊 View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
