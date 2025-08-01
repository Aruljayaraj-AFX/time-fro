"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
export const dynamic = 'force-dynamic';


export default function LogTime() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState("");
  const [userId, setUserId] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState(0);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("utoken");
      if (!token) {
        alert("No token found. Please login again.");
        router.push("/login");
        return;
      }

      try {
        // Token validation
        const securityRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/u_security_checku/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!securityRes.ok) {
          router.push("/login");
          return;
        }

        const securityData = await securityRes.json();
        if (!securityData?.sub || !securityData?.exp) {
          router.push("/login");
          return;
        }

        // Fetch user ID
        const userIdRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/userid/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!userIdRes.ok) throw new Error("Failed to get user ID");

        const userIdJson = await userIdRes.json();
        setUserId(userIdJson.user_id);
        localStorage.setItem("userId", userIdJson.user_id);

        // Fetch project list
        const projectRes = await fetch(
          "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-projectsu/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const text = await projectRes.text();
        const data = JSON.parse(text);

        const projectsList = Array.isArray(data.projects)
          ? data.projects
          : Array.isArray(data)
          ? data
          : [];

        setProjects(projectsList);
      } catch (err) {
        console.error("❌ Init error:", err);
        router.push("/login");
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      const diff = end - start;
      setHoursWorked(diff > 0 ? (diff / 60).toFixed(1) : 0);
    } else {
      setHoursWorked(0);
    }
  }, [startTime, endTime]);

  const handleClose = () => router.push("/UserDash");

  const handleLogTime = async () => {
    const token = localStorage.getItem("utoken");
    if (!token) {
      alert("No token found. Please login again.");
      router.push("/loginPage");
      return;
    }

    if (!project || !startTime || !endTime || !description || hoursWorked <= 0) {
      alert("❗ Please fill all required fields correctly.");
      return;
    }

    try {
      // Get project ID from API
      const encodedProject = encodeURIComponent(project);
      const res = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/projectid/?projectname=${encodedProject}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch project ID");

      const data = await res.json();
      const projectId = data.project_id;
      localStorage.setItem("projectId", projectId);

      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const logData = {
        date,
        projectid: projectId,
        userid: userId,
        workdescription: description,
        hours: parseFloat(hoursWorked),
      };

      const postRes = await fetch(
        "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/UPDATE_hours/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(logData),
        }
      );

      const postResult = await postRes.json();

      if (
        postRes.ok &&
        postResult.status === "success" &&
        postResult.message === "Hours updated successfully"
      ) {
        alert("✅ Hours logged successfully!");
        router.push("/UserDash");
      } else {
        throw new Error(postResult.message || "Failed to log time");
      }
    } catch (error) {
      console.error("❌ Error logging time:", error);
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4 mt-20">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Log Work Time</h2>
        <div className="bg-gray-800 rounded mr-4 pl-2 pr-2 hover:bg-red-700">
          <button
            onClick={handleClose}
            className="text-gray-400 text-2xl hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Enter your start and end times – hours will be calculated automatically
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Project *
          </label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
          >
            <option value="" disabled>
              Select a project
            </option>
            {Array.isArray(projects) &&
              projects.map((p, idx) => (
                <option
                  key={idx}
                  value={typeof p === "string" ? p : p.project_name}
                >
                  {typeof p === "string" ? p : p.project_name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Date *
          </label>
          <input
            type="date"
            value={date}
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Start Time *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            End Time *
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Calculated Hours
          </label>
          <input
            value={`${hoursWorked}h`}
            readOnly
            className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-1">
          Work Description *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you worked on..."
          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 resize-none text-gray-700"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleLogTime}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          disabled={hoursWorked <= 0 || !project || !description}
        >
          <Send size={14} />
          <span>Log {hoursWorked}h</span>
        </button>
      </div>
    </div>
  );
}
