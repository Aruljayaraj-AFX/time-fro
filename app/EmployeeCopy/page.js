"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  KeyRound,
  Users,
  Briefcase,
  TrendingUp,
  LineChart,
  CalendarDays,
} from "lucide-react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);
export const dynamic = 'force-dynamic';


const COLORS = [
  "#3B82F6", "#F59E42", "#10B981", "#F43F5E",
  "#6366F1", "#FBBF24", "#84CC16", "#E879F9"
];

export default function Employee() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Report");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const [summary, setSummary] = useState({
    employeeCount: 0,
    projectCount: 0,
    totalHours: 0,
  });

  const [userData, setUserData] = useState({
    usernames: [],
    project_ids: [],
  });

  // Visualizations
  const [responseData, setResponseData] = useState(null);

  const tabs = [
    { name: "Overview", icon: LineChart },
    { name: "Projects", icon: Briefcase },
    { name: "Employees", icon: Users },
    { name: "Report", icon: TrendingUp },
    { name: "Power BI", icon: LineChart },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const routeMap = {
      Overview: "/AdminDash",
      Projects: "./Projects",
      Employees: "./Employee",
      Report: "./EmployeeCopy",
      "Power BI": "/PowerBI",
    };
    router.push(routeMap[tab]);
  };

  const handleChange = () => router.push("./ChangePass");
  const handleOut = () => router.push("./LoginPage");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/user_details",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setUserData({
          usernames: data.usernames || [],
          project_ids: data.project_ids || [],
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProjectsForMembers = async () => {
      const indices = selectedMembers.map((member) =>
        userData.usernames.indexOf(member)
      );
      const projectSet = new Set();
      indices.forEach((i) => {
        if (i !== -1 && Array.isArray(userData.project_ids[i])) {
          userData.project_ids[i].forEach((projectId) => {
            projectSet.add(projectId);
          });
        }
      });
      const uniqueProjectIds = [...projectSet];
      if (uniqueProjectIds.length === 0) {
        setProjectOptions([]);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-projectid?${uniqueProjectIds
            .map((id) => `pro_ids=${encodeURIComponent(id)}`)
            .join("&")}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const options = uniqueProjectIds.map((id, index) => ({
          id,
          name: data.project_names[index] || id,
        }));
        setProjectOptions(options);
      } catch (error) {
        console.error("Error fetching project names:", error);
        setProjectOptions([]);
      }
    };
    if (selectedMembers.length > 0) {
      fetchProjectsForMembers();
    } else {
      setProjectOptions([]);
      setSelectedProjects([]);
    }
  }, [selectedMembers, userData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#memberDropdown")) setMemberDropdownOpen(false);
      if (!e.target.closest("#projectDropdown")) setProjectDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // Helper: Map IDs <-> Names, extract data safely
  const getUserIdToName = (d) => {
    if (!d?.eachmember_name || !d?.eachmember_id) return {};
    const userIdToName = {};
    const nameArr = Object.keys(d.eachmember_name);
    const idArr = Object.keys(d.eachmember_id);
    idArr.forEach((id, i) => (userIdToName[id] = nameArr[i]));
    return userIdToName;
  };
  const getProjectIdToName = (d) => {
    if (!d?.eachmember_name || !d?.eachmember_id) return {};
    const projectIdToName = {};
    Object.keys(d.eachmember_name).forEach((uname, idx) => {
      const ids = d.eachmember_id[Object.keys(d.eachmember_id)[idx]];
      const names = d.eachmember_name[uname];
      if (ids && names) {
        ids.forEach((id, i) => {
          projectIdToName[id] = names[i];
        });
      }
    });
    return projectIdToName;
  };

  const handleApply = async () => {
    const payload = {
      Startdate: startDate.split("-").reverse().join("-"),
      Enddate: endDate.split("-").reverse().join("-"),
      member_name: selectedMembers,
      project_names: selectedProjects.map(
        (id) => projectOptions.find((p) => p.id === id)?.name || id
      ),
    };
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-reports",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      localStorage.setItem("reportData", JSON.stringify(data));
      setSummary({
        employeeCount: payload.member_name.length,
        projectCount: payload.project_names.length,
        totalHours: data?.data?.total_hours || 0,
      });
      setResponseData(data.data);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  // --- ADDITIONAL VISUALS ---
  let userIdToName = {};
  let projectIdToName = {};
  let memberNames = [];
  let projectNames = [];
  let alldates = [];
  let d = {};

  if (responseData) {
    d = responseData;
    userIdToName = getUserIdToName(d);
    projectIdToName = getProjectIdToName(d);
    memberNames = Object.keys(d.eachmember_name || {});
    projectNames = Array.from(new Set(Object.values(d.eachmember_name || {}).flat()));
    alldates = d.alldates || [];
  }

  // 1. Bar Chart: Total Hours Per Member
  const memberBar = d.user_total_hours ? {
    labels: Object.keys(d.user_total_hours).map((uid) => userIdToName[uid] || uid),
    datasets: [
      {
        label: "Total Hours",
        data: Object.values(d.user_total_hours),
        backgroundColor: COLORS,
      },
    ],
  } : null;

  // 2. Bar Chart: Total Hours Per Project
  const projectBar = d.project_total_hours ? {
    labels: Object.keys(d.project_total_hours).map(
      (pid) => projectIdToName[pid] || pid
    ),
    datasets: [
      {
        label: "Total Hours",
        data: Object.values(d.project_total_hours),
        backgroundColor: COLORS,
      },
    ],
  } : null;

  // 3. Stacked Bar Chart: Daily Hours per Member
  const stackedBar = alldates.length ? (() => {
    const datasets = memberNames.map((uname, idx) => {
      const userId = Object.keys(d.eachmember_id)[idx];
      const arr = alldates.map((date) => {
        let sum = 0;
        const projIds = d.eachmember_id[userId];
        if (projIds) {
          projIds.forEach((pid) => {
            if (
              d.report[userId] &&
              d.report[userId][pid] &&
              d.report[userId][pid][date]
            ) {
              sum += d.report[userId][pid][date].hour_contribution || 0;
            }
          });
        }
        return sum;
      });
      return {
        label: uname,
        data: arr,
        backgroundColor: COLORS[idx % COLORS.length],
        stack: "members"
      };
    });
    return {
      labels: alldates,
      datasets,
    };
  })() : null;

  // 4. Line Chart: Individual Member Contribution Over Time
  const memberLine = alldates.length ? (() => {
    const datasets = memberNames.map((uname, idx) => {
      const userId = Object.keys(d.eachmember_id)[idx];
      const arr = alldates.map((date) => {
        let sum = 0;
        const projIds = d.eachmember_id[userId];
        if (projIds) {
          projIds.forEach((pid) => {
            if (
              d.report[userId] &&
              d.report[userId][pid] &&
              d.report[userId][pid][date]
            ) {
              sum += d.report[userId][pid][date].hour_contribution || 0;
            }
          });
        }
        return sum;
      });
      return {
        label: uname,
        data: arr,
        fill: false,
        borderColor: COLORS[idx % COLORS.length],
        tension: 0.1,
      };
    });
    return {
      labels: alldates,
      datasets,
    };
  })() : null;

  // 5. Donut Chart: Project Distribution of Total Hours
  const donut = d.project_total_hours ? {
    labels: Object.keys(d.project_total_hours).map(
      (pid) => projectIdToName[pid] || pid
    ),
    datasets: [
      {
        data: Object.values(d.project_total_hours),
        backgroundColor: COLORS,
      },
    ],
  } : null;

  // 6. Heatmap: Daily Hours by Member (Table, colored via inline style)
  const heatmapData = memberNames.length ? memberNames.map((uname, idx) => {
    const userId = Object.keys(d.eachmember_id)[idx];
    return alldates.map((date) => {
      let sum = 0;
      const projIds = d.eachmember_id[userId];
      if (projIds) {
        projIds.forEach((pid) => {
          if (
            d.report[userId] &&
            d.report[userId][pid] &&
            d.report[userId][pid][date]
          ) {
            sum += d.report[userId][pid][date].hour_contribution || 0;
          }
        });
      }
      return sum;
    });
  }) : null;

  // 7. Grouped Bar: Member-wise Contribution Per Project
  const groupedBar = memberNames.length ? (() => {
    const allProjectNames = Array.from(
      new Set(
        Object.values(d.eachmember_name || {}).flat()
      )
    );
    const datasets = allProjectNames.map((proj, idx) => {
      const projectId = Object.keys(projectIdToName).find(
        (k) => projectIdToName[k] === proj
      );
      return {
        label: proj,
        data: memberNames.map((uname, mIdx) => {
          const userId = Object.keys(d.eachmember_id)[mIdx];
          let total = 0;
          if (
            projectId &&
            d.report[userId] &&
            d.report[userId][projectId]
          ) {
            Object.values(d.report[userId][projectId]).forEach(
              (entry) => (total += entry.hour_contribution || 0)
            );
          }
          return total;
        }),
        backgroundColor: COLORS[idx % COLORS.length],
      };
    });
    return {
      labels: memberNames,
      datasets,
    };
  })() : null;

  // Table: Detailed Work Report
  const detailedRows = [];
  if (d.report) {
    Object.entries(d.report).forEach(([userId, projects]) => {
      const uname = userIdToName[userId] || userId;
      Object.entries(projects).forEach(([projId, datesObj]) => {
        const pname = projectIdToName[projId] || projId;
        Object.entries(datesObj).forEach(([date, entry]) => {
          detailedRows.push({
            date,
            member: uname,
            project: pname,
            hours: entry.hour_contribution,
            desc: entry.work_description,
          });
        });
      });
    });
  }

  function heatColor(val, max = 8) {
    const percent = Math.min(val / max, 1);
    return `hsl(217, 100%, ${100 - percent * 60}%)`;
  }

  return (
    <div className="p-6 bg-[#f9f9f9] min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border-b bg-white rounded-md">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Project Manager Dashboard
          </h1>
          <p className="text-sm text-gray-500">Welcome back, Keerthana</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleChange}
            className="flex items-center gap-2 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-100"
          >
            <KeyRound size={14} />
            <span>Change Password</span>
          </button>
          <button
            onClick={handleOut}
            className="flex items-center gap-2 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-100"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center mt-6">
        <div className="flex rounded-full bg-gray-100 px-6 py-2 shadow-inner space-x-4 overflow-x-auto">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => handleTabClick(name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === name
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white p-6 rounded-xl shadow mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Filter Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <div className="flex items-center border rounded-md px-2 py-1 bg-white">
              <CalendarDays size={16} className="text-gray-500 mr-2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="outline-none w-full text-sm bg-transparent"
              />
            </div>
          </div>
          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              End Date
            </label>
            <div className="flex items-center border rounded-md px-2 py-1 bg-white">
              <CalendarDays size={16} className="text-gray-500 mr-2" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="outline-none w-full text-sm bg-transparent"
              />
            </div>
          </div>
          {/* Verified Members */}
          <div className="relative" id="memberDropdown">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Verified Members
            </label>
            <div
              onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
              className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
            >
              {selectedMembers.length > 0
                ? selectedMembers.join(", ")
                : "Select Members"}
            </div>
            {memberDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                {userData.usernames?.map((name) => (
                  <label
                    key={name}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedMembers.includes(name)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...selectedMembers, name]
                          : selectedMembers.filter((n) => n !== name);
                        setSelectedMembers(updated);
                      }}
                    />
                    {name}
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Projects */}
          <div className="relative" id="projectDropdown">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Projects
            </label>
            <div
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
            >
              {selectedProjects.length > 0
                ? selectedProjects
                    .map(
                      (id) =>
                        projectOptions.find((p) => p.id === id)?.name || id
                    )
                    .join(", ")
                : "Select Projects"}
            </div>
            {projectDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                {projectOptions.map((proj) => (
                  <label
                    key={proj.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedProjects.includes(proj.id)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...selectedProjects, proj.id]
                          : selectedProjects.filter((p) => p !== proj.id);
                        setSelectedProjects(updated);
                      }}
                    />
                    {proj.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Apply Button */}
        <div className="text-right mt-4">
          <button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </section>
      {/* Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <p className="text-sm text-gray-500">Members Selected</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {summary.employeeCount}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <p className="text-sm text-gray-500">Projects Involved</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {summary.projectCount}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <p className="text-sm text-gray-500">Total Hours Worked</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {summary.totalHours}h
          </h3>
        </div>
      </section>

      {/* --- VISUALS --- */}
      {responseData && (
        <>
          {/* Main Grid: 2 per row for charts, NOT including heatmap or detailed table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            {memberBar && (
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <h2 className="font-semibold mb-2">Total Hours Per Member</h2>
                <Bar data={memberBar} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            )}
            {projectBar && (
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <h2 className="font-semibold mb-2">Total Hours Per Project</h2>
                <Bar data={projectBar} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            )}
            {stackedBar && (
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <h2 className="font-semibold mb-2">Daily Hours per Member (Stacked Bar)</h2>
                <Bar data={stackedBar} options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
                }} />
              </div>
            )}
            {memberLine && (
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <h2 className="font-semibold mb-2">Member Contribution Over Time (Line Chart)</h2>
                <Line data={memberLine} options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true } }
                }} />
              </div>
            )}
  {donut && (
  <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
    <h2 className="font-semibold mb-2">Project Distribution of Total Hours (Pie Chart)</h2>
    <div className="w-100 h-100">
      <Pie
        data={donut}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  </div>
)}

            {groupedBar && (
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <h2 className="font-semibold mb-2">Member-wise Contribution Per Project (Grouped Bar)</h2>
                <Bar data={groupedBar} options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true } }
                }} />
              </div>
            )}
          </div>

          {/* Single row: Heatmap Table (Full Width, not in grid) */}
          {heatmapData && (
            <div className="my-8">
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center w-full">
                <h2 className="font-semibold mb-2">Daily Hours by Member (Heatmap Table)</h2>
                <div className="overflow-x-auto w-full">
                  <table className="border-collapse min-w-max w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="border px-2 py-1"></th>
                        {alldates.map((date) => (
                          <th className="border px-2 py-1" key={date}>{date}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {memberNames.map((uname, rIdx) => (
                        <tr key={uname}>
                          <td className="border px-2 py-1 font-medium bg-gray-50">{uname}</td>
                          {alldates.map((date, cIdx) => {
                            const val = heatmapData[rIdx][cIdx];
                            return (
                              <td
                                key={date}
                                className="border px-2 py-1 text-center"
                                style={{
                                  background: heatColor(val, 8),
                                  color: val > 4 ? "#fff" : "#222",
                                }}
                              >
                                {val ? val : ""}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Full width, classical table with sticky header for detailed report */}
          {detailedRows.length > 0 && (
            <section className="my-8">
              <h2 className="font-semibold mb-2 text-lg">🧾 Detailed Work Report</h2>
              <div className="overflow-x-auto w-full">
                <table className="border-collapse min-w-max w-full text-sm bg-white rounded-xl shadow">
                  <thead className="sticky top-0 bg-gray-100 z-20">
                    <tr>
                      <th className="border px-2 py-2">Date</th>
                      <th className="border px-2 py-2">Member Name</th>
                      <th className="border px-2 py-2">Project Name</th>
                      <th className="border px-2 py-2">Hours</th>
                      <th className="border px-2 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="border px-2 py-1">{row.date}</td>
                        <td className="border px-2 py-1">{row.member}</td>
                        <td className="border px-2 py-1">{row.project}</td>
                        <td className="border px-2 py-1 text-center">{row.hours}</td>
                        <td className="border px-2 py-1">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}