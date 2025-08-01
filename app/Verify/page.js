"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export const dynamic = 'force-dynamic';

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get("project") || "Unknown";

  const [todayStats, setTodayStats] = useState({ totalHours: 0, activeCount: 0 });
  const [submissionsByDay, setSubmissionsByDay] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-projects-by-id?project_name=${encodeURIComponent(projectName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        if (!data || !data.project_data) return;

        // Extract today's data
        const today = new Date().toISOString().split("T")[0];
        const todayEntries = data.project_data.filter(
          (entry) => entry.date.split("T")[0] === today
        );

        const uniqueTodayUsers = [...new Set(todayEntries.map((e) => e.username))];
        const totalTodayHours = todayEntries.reduce((sum, e) => sum + e.hour_contribution, 0);

        setTodayStats({
          totalHours: totalTodayHours,
          activeCount: uniqueTodayUsers.length,
        });

        // Group submissions by date
        const grouped = {};
        for (let entry of data.project_data) {
          const date = new Date(entry.date).toDateString();
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(entry);
        }

        const formatted = Object.entries(grouped)
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .slice(0, 7)
          .map(([date, entries]) => ({
            date,
            count: entries.length,
            totalHours: entries.reduce((sum, e) => sum + e.hour_contribution, 0),
            submissions: entries.map((e) => ({
              name: e.username,
              initials: e.username
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase(),
              note: e.work_description,
              hours: e.hour_contribution,
            })),
          }));

        setSubmissionsByDay(formatted);
      } catch (err) {
        console.error("Error fetching project details:", err);
        router.push("/LoginPage");
      }
    };

    fetchProjectDetails();
  }, [projectName]);

  const handleClose = () => router.push("/Projects");

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Project Details: {projectName}
          </h2>
          <div className="bg-gray-800 rounded mr-4 pl-2 pr-2 hover:bg-red-700">
            <button
              onClick={handleClose}
              className="text-gray-400 text-2xl hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Daily time submissions by team members for this project
        </p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">Total Hours Today</div>
            <div className="mt-2 text-2xl font-bold">{todayStats.totalHours}h</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">Active Members Today</div>
            <div className="mt-2 text-2xl font-bold">{todayStats.activeCount}</div>
          </div>
        </div>

        {/* Daily Submissions */}
        <div className="space-y-6">
          <h3 className="font-medium mb-2 text-gray-800">
            Daily Time Submissions (Last 7 Days)
          </h3>

          {submissionsByDay.map((day, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="text-sm text-gray-700">
                <strong>{day.date}</strong>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {day.count} submission(s) · {day.totalHours}h total
              </div>
              <div className="space-y-3">
                {day.submissions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-100 rounded-md p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">
                        {s.initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">{s.name}</div>
                        <div className="text-sm text-gray-600">{s.note}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{s.hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
