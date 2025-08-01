"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export const dynamic = 'force-dynamic';

function ManageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get("project") || "Unknown Project";

  const [allUsers, setAllUsers] = useState([]);
  const [current, setCurrent] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const reloadMembers = async () => {
    try {
      const availableRes = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/add-member-for-project?pro_name=${projectName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const detailsRes = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/get-project-details?pro_name=${projectName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!availableRes.ok || !detailsRes.ok) {
        router.push("/login/page.js");
        return;
      }

      const availableData = await availableRes.json();
      const projectDetails = await detailsRes.json();

      const allUserObjects = availableData.map((name, idx) => ({
        id: (idx + 1).toString(),
        name,
        email: null,
      }));

      const projectMembers = (projectDetails.project_members || []).map((name, idx) => ({
        id: "current-" + idx,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
      }));

      setAllUsers(allUserObjects);
      setCurrent(projectMembers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      router.push("/login/page.js");
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login/page.js");
      return;
    }
    reloadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  const available = allUsers.filter(
    (u) => !current.some((c) => c.name === u.name)
  );

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0 || !token) return;

    const selectedUsers = allUsers
      .filter((u) => selectedIds.has(u.id))
      .map((u) => u.name);

    try {
      const response = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/add-new-member-on-pro?pro_name=${projectName}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedUsers),
        }
      );

      if (response.ok) {
        setSelectedIds(new Set());
        await reloadMembers();
      } else {
        throw new Error("Failed to add members to project");
      }
    } catch (err) {
      console.error("Error adding members:", err);
      alert("Failed to add members. Please try again.");
    }
  };

  const handleRemove = async (id) => {
    const member = current.find((c) => c.id === id);
    if (!member || !token) return;

    try {
      const res = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/remove-member-from-pro?pro_name=${projectName}&membername=${encodeURIComponent(
          member.name
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        await reloadMembers();
      } else {
        const error = await res.json();
        console.error("Failed to remove member:", error);
        alert("Failed to remove member.");
      }
    } catch (err) {
      console.error("Error during member removal:", err);
      alert("Something went wrong while removing the member.");
    }
  };

  const handleClose = () => {
    router.push("/Projects");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg pb-10 h-130 shadow overflow-y-scroll">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">
            Manage Project: {projectName}
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
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Add or remove team members for this specific project
        </p>

        {/* Add team members */}
        <div className="mb-6">
          <h3 className="font-medium mb-2 text-gray-700">Add Team Members</h3>
          <div className="border rounded p-3 max-h-48 overflow-auto grid grid-cols-2 gap-2">
            {available.map((p) => (
              <label key={p.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggle(p.id)}
                />
                <span className="ml-2 text-gray-800">{p.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {selectedIds.size} member(s) selected
          </div>
          <button
            className={`mt-2 px-4 py-2 rounded ${
              selectedIds.size > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
          >
            Add Selected ({selectedIds.size})
          </button>
        </div>

        {/* Current team members */}
        <div>
          <h3 className="font-medium mb-2 text-gray-700">
            Current Team Members ({current.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-auto">
            {current.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {p.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">{p.name}</div>
                    {p.email && (
                      <div className="text-sm text-gray-500">{p.email}</div>
                    )}
                  </div>
                </div>
                <button
                  className="px-2 py-1 border rounded bg-white text-gray-700 hover:bg-gray-100"
                  onClick={() => handleRemove(p.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export default with Suspense boundary
export default function Manage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageContent />
    </Suspense>
  );
}