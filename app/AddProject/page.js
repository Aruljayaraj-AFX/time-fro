"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';

export default function AddProject() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fetch all usernames from the backend API
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/LoginPage");
        return;
      }

      try {
        const res = await fetch("https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/username_list", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const usernames = await res.json();
        setAllUsers(usernames);
      } catch (err) {
        console.error("Error fetching users:", err);
        router.push("/LoginPage");
      }
    };

    fetchUsers();
  }, [router]);

  const toggle = (idx) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  // Submit project data to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/LoginPage");
      return;
    }

    const selectedMembers = Array.from(selected).map(i => allUsers[i]);

    const payload = {
      project_name: form.name,
      project_description: form.description,
      project_members: selectedMembers,
    };

    try {
      const res = await fetch("https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/new_projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to create project:", errorData);
        alert("Project creation failed.");
        return;
      }

      alert("Project created successfully!");
      router.push("./Projects");
    } catch (err) {
      console.error("Error during project creation:", err);
      alert("Something went wrong!");
    }
  };

  const handleClose = () => {
    router.push("./Projects");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg mx-auto p-6 shadow-lg pl-4 pr-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Create New Project</h3>
          <div className="bg-gray-800 rounded mr-4 pl-2 pr-2 hover:bg-red-700">
            <button
              onClick={handleClose}
              className="text-gray-400 text-2xl hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Add a new project and assign team members
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Mobile App Development"
              className="mt-1 w-full bg-gray-100 focus:bg-white border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the project..."
              rows={4}
              className="mt-1 w-full bg-gray-100 focus:bg-white border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Team Members</label>
            <div className="border rounded p-3 max-h-40 overflow-auto grid grid-cols-2 gap-2">
              {allUsers.map((name, idx) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(idx)}
                    onChange={() => toggle(idx)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-800">{name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
