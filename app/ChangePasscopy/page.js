"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
export const dynamic = 'force-dynamic';


export default function ChangePass() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const router = useRouter();

  const validateNewPassword = (password) => {
    return (
      password.length >= 6 &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };
  
const handleUpdate = async () => {
  setNewError("");
  setConfirmError("");

  let isValid = true;

  if (!validateNewPassword(newPassword)) {
    setNewError("Password must be at least 6 characters long, include a number and a special character.");
    isValid = false;
  }

  if (newPassword !== confirmPassword) {
    setConfirmError("Passwords do not match.");
    isValid = false;
  }

  if (!isValid) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    const response = await fetch(
      `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/change_password/?new_password=${encodeURIComponent(newPassword)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("✅ Password updated successfully!");
      router.push("/AdminDash");
    } else {
      const data = await response.json();
      alert(`❌ Failed to update password: ${data.detail || response.statusText}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ An unexpected error occurred.");
  }
};

  const handleClose = () => {
    router.push("/AdminDash");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow-lg p-6 sm:p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Change Password</h2>
            <p className="text-sm text-gray-500">Update your account password for security</p>
          </div>
          <div className="bg-gray-800 rounded mr-4 pl-2 pr-2 hover:bg-red-700">
            <button
              onClick={handleClose}
              className="text-white text-xl hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-1">New Password</label>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200">
            <Lock size={16} className="text-gray-500 mr-2" />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
            <button onClick={() => setShowNew(!showNew)}>
              {showNew ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {newError && <p className="text-red-500 text-xs mt-1">{newError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 block mb-1">Confirm Password</label>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200">
            <Lock size={16} className="text-gray-500 mr-2" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
            <button onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
