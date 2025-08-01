"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
export const dynamic = 'force-dynamic';


export default function Confirmpage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const router = useRouter();

  const validateNewPassword = (password) => {
    const hasLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasLength && hasNumber && hasSpecialChar;
  };

  const handleUpdate = () => {
    // Reset all errors
    setCurrentError("");
    setNewError("");
    setConfirmError("");

    let isValid = true;

    // Validate current password
  if (currentPassword === "temp123") {
  // Valid password – do nothing here or proceed
} else {
  setCurrentError("Current password is incorrect.");
  isValid = false;
}


    // Validate new password
    if (!validateNewPassword(newPassword)) {
      setNewError("Password does not strong");
      isValid = false;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      isValid = false;
    }

    if (isValid) {
      localStorage.setItem("savedPassword", confirmPassword);
      router.push("./UserDash");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="bg-orange-500 rounded-full p-3">
            <Lock className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-xl font-bold text-black">Change Password</h2>
        <p className="text-center text-sm text-gray-500">
          Welcome!   Please set a new secure password for your account.
        </p>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Current Password</label>
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-300">
              <Lock size={16} className="text-gray-500 mr-2" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="flex-1 bg-transparent outline-none text-xs text-black"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-500">
                {showCurrent ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
            {currentError && <p className="text-red-500 text-xs mb-1">{currentError}</p>}
          {/* New Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">New Password</label>
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-300">
              <Lock size={16} className="text-gray-500 mr-2" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex-1 bg-transparent outline-none text-xs text-black"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-500">
                {showNew ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
          {newError && <p className="text-red-500 text-xs mb-1">{newError}</p>}
          {/* Confirm Password */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Confirm Password</label>
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-300">
              <Lock size={16} className="text-gray-500 mr-2" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="flex-1 bg-transparent outline-none text-xs text-black"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-500">
                {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        </div>
        {confirmError && <p className="text-red-500 text-xs mb-1">{confirmError}</p>}
        {/* Update Button */}
        <button
          onClick={handleUpdate}
          className="w-full bg-gray-500 text-white font-semibold py-2 rounded-md hover:bg-gray-600 transition"
        >
          Update Password
        </button>

        {/* Password Requirements */}
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-600">
          <p className="font-medium mb-1">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>At least 6 characters long</li>
            <li>Includes numbers or symbols</li>
            <li>Use a combination of letters and numbers</li>
            <li>Should not be easily guessable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
