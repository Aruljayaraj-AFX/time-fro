"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
export const dynamic = 'force-dynamic';


export default function AddEmployeeModal() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [responseMsg, setResponseMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" or "error"
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/AdminDash");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/AdminDash");
      return;
    }

    try {
      const res = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/new_user?name=${encodeURIComponent(
          form.name
        )}&email=${encodeURIComponent(form.email)}&password=${encodeURIComponent(
          form.password
        )}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setMsgType("success");
        setResponseMsg(data.message);
        setTimeout(() => {
          router.push("/Employee");
        }, 1500);
      } else {
        setMsgType("error");
        setResponseMsg(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setMsgType("error");
      setResponseMsg("Network error. Please try again.");
    }
  };

  const handleClose = () => {
    router.push("/Employee");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">Add New Employee</h2>
        <p className="text-sm text-gray-500 mb-4">Create a new team member account</p>

        {/* Response Message */}
        {responseMsg && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded ${
              msgType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {responseMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
              className="w-full px-4 py-2 border rounded-md text-sm text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@company.com"
              required
              className="w-full px-4 py-2 border rounded-md text-sm text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-md text-sm text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Employee will be required to change password on first login
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-sm"
            >
              <Users size={16} />
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
