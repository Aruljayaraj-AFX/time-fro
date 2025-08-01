"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  KeyRound,
  Users,
  Briefcase,
  TrendingUp,
  LineChart,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
export const dynamic = 'force-dynamic';


export default function Employee() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Employees");
  const [employees, setEmployees] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  const handleChange = () => router.push("/ChangePass");
  const handleOut = () => router.push("/LoginPage");

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

  const handleAddEmployee = () => {
    router.push("/AddEmployee");
  };

  const toggleRow = (idx) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    const fetchAllEmployees = async () => {
      const tokenValue = localStorage.getItem("token");
      if (!tokenValue) {
        router.push("/LoginPage");
        return;
      }

      try {
        const usernameRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/username_list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenValue}`,
              Accept: "application/json",
            },
          }
        );

        if (!usernameRes.ok) {
          console.error("Username list fetch failed");
          router.push("/LoginPage");
          return;
        }

        const usernames = await usernameRes.json();
        const employeeList = [];

        for (const username of usernames) {
          try {
            const res = await fetch(
              `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/particular_user?username=${encodeURIComponent(
                username
              )}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${tokenValue}`,
                  Accept: "application/json",
                },
              }
            );

            if (!res.ok) {
              console.error("User fetch failed for:", username);
              continue;
            }

            const data = await res.json();

            let projectDetails = [];

            if (data.project_ids === "No projects assigned to this user") {
              projectDetails = [];
            } else if (typeof data.project_ids === "object" && data.project_ids !== null) {
              projectDetails = Object.values(data.project_ids).map((proj) => ({
                name: proj.project_name,
                description: proj.project_description,
                hours: proj.hour_contribution,
              }));
            }

            employeeList.push({
              name: data.username,
              email: data.email,
              projectCount: projectDetails.length,
              projects: projectDetails,
            });
          } catch (err) {
            console.error("Fetch failed for username:", username, err);
          }
        }

        setEmployees(employeeList);
      } catch (err) {
        console.error("Error fetching employees:", err);
        router.push("/LoginPage");
      }
    };

    fetchAllEmployees();
  }, []);

  const tabs = [
    { name: "Overview", icon: LineChart },
    { name: "Projects", icon: Briefcase },
    { name: "Employees", icon: Users },
    { name: "Report", icon: TrendingUp },
    { name: "Power BI", icon: LineChart },
  ];

  return (
    <div className="p-6 bg-[#f9f9f9] min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border-b bg-white">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Project Manager Dashboard
          </h1>
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
                <Icon
                  size={16}
                  className={isActive ? "text-blue-600" : "text-gray-500"}
                />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title & Button */}
      <div className="flex justify-between items-center mb-4 mt-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-sm text-gray-500">
            Monitor team performance and assignments
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          onClick={handleAddEmployee}
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">No. of Projects</th>
            </tr>
          </thead>
          <tbody>
  {employees.map((emp, idx) => {
    const isExpandable = emp.projectCount > 0;
    return (
      <React.Fragment key={idx}>
        <tr
          className={`border-t hover:bg-gray-50 transition duration-200 ${
            isExpandable ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={() => isExpandable && toggleRow(idx)}
        >
          <td className="px-4 py-3 text-gray-500">
            {isExpandable &&
              (expandedRows[idx] ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              ))}
          </td>
          <td className="px-4 py-3 font-medium text-gray-800">{emp.name}</td>
          <td className="px-4 py-3 text-gray-500">{emp.email}</td>
          <td className="px-4 py-3 text-gray-900">{emp.projectCount}</td>
        </tr>

        {expandedRows[idx] && (
          <tr className="bg-gray-50 border-t">
            <td colSpan={4} className="px-4 py-3">
              {emp.projects.length === 0 ? (
                <div className="text-center text-sm font-medium text-gray-700">
                  {emp.name} — {emp.email} — Total Hours: 0
                </div>
              ) : (
                <table className="w-full border text-sm bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left w-1/3">Project Name</th>
                      <th className="px-4 py-2 text-center w-1/3">Description</th>
                      <th className="px-4 py-2 text-right w-1/3">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.projects.map((proj, pIdx) => (
                      <tr key={pIdx} className="border-t">
                        <td className="px-4 py-2 text-left">{proj.name}</td>
                        <td className="px-4 py-2 text-center text-gray-600">{proj.description}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-800">
                          {proj.hours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>

                        </table>
      </div>
    </div>
  );
}
