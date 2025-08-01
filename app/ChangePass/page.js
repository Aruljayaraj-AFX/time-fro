"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
export const dynamic = 'force-dynamic';


export default function ChangePass() {
  const router = useRouter();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [otpRequested, setOtpRequested] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const validateNewPassword = (password) =>
    password.length >= 6 &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleUpdate = async () => {
    setNewError("");
    setConfirmError("");

    let isValid = true;

    if (!validateNewPassword(newPassword)) {
      setNewError(
        "Password must be at least 6 characters long, include a number and special character."
      );
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    const token = localStorage.getItem("utoken");
    if (!token) return router.push("/user_login");

    try {
      const response = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/update_password/?new_password=${encodeURIComponent(newPassword)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || "Failed to update password.");

      alert("✅ Password updated successfully!");
      router.push("/UserDash");
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp;
    const otptoken = localStorage.getItem("stoken");
    const token = localStorage.getItem("utoken");

    if (!otpValue || !otptoken || !token) {
      alert("❌ Missing OTP or token");
      return;
    }

    try {
      const response = await fetch(
        `https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/otp_v/?otp=${otpValue}&otptoken=${otptoken}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || "Invalid OTP");

      setIsVerified(true);
      alert("✅ OTP Verified!");
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert(`❌ ${error.message}`);
    }
  };

  const handleClose = () => router.push("/UserDash");

  // Function to check user authorization
  const checkUserSecurity = async () => {
    const token = localStorage.getItem("utoken");
    if (!token) {
      router.push("/user_login");
      return false;
    }

    try {
      console.log("🔐 Checking user security...");
      const response = await fetch(
        "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/u_security_checku/",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok || data?.detail === "Invalid or expired token") {
        console.log("❌ Security check failed:", data?.detail);
        router.push("/user_login");
        return false;
      }

      console.log("✅ Security check passed");
      return true;
    } catch (error) {
      console.error("Security check error:", error);
      router.push("/user_login");
      return false;
    }
  };

  // Function to request OTP
  const requestOtp = async () => {
    // Prevent multiple simultaneous requests
    if (isRequestingOtp || otpRequested) {
      return;
    }

    const token = localStorage.getItem("utoken");
    if (!token) {
      router.push("/user_login");
      return;
    }

    setIsRequestingOtp(true);

    try {
      console.log("🔁 Requesting OTP from server...");
      const response = await fetch(
        "https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/otp/",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to request OTP");
      }

      if (data?.secret) {
        localStorage.removeItem("stoken");
        localStorage.setItem("stoken", data.secret);
        setOtpRequested(true);
        alert("📱 OTP sent successfully! Please check your registered method.");
      }
    } catch (error) {
      console.error("OTP request error:", error);
      alert(`❌ Failed to request OTP: ${error.message}`);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Handle OTP input focus - request OTP when user clicks on the field
  const handleOtpFocus = () => {
    if (!otpRequested && !isRequestingOtp && isAuthorized) {
      requestOtp();
    }
  };

  // Alternative: Handle OTP request with explicit button click
  const handleRequestOtp = () => {
    if (!otpRequested && !isRequestingOtp && isAuthorized) {
      requestOtp();
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      const authorized = await checkUserSecurity();
      setIsAuthorized(authorized);
      setIsLoading(false);
    };

    initializePage();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Access Denied</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
            <p className="text-sm text-gray-500">Update your password securely</p>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="bg-gray-800 text-white text-xl px-2 rounded hover:bg-red-600"
          >
            ×
          </button>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Enter OTP</label>
          
          {/* Request OTP Button (shown when OTP not requested) */}
          {!otpRequested && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className={`w-full py-2 px-4 rounded-md text-white ${
                  isRequestingOtp
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRequestingOtp ? "Sending OTP..." : "Request OTP"}
              </button>
            </div>
          )}

          {/* OTP Input and Verify (shown when OTP requested) */}
          {otpRequested && (
            <div className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="flex-1 text-center h-10 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isVerified}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerified || !otp || otp.length !== 6}
                className={`px-4 py-2 rounded text-white ${
                  isVerified 
                    ? "bg-green-500" 
                    : !otp || otp.length !== 6
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isVerified ? "Verified" : "Verify"}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {!otpRequested && !isRequestingOtp && (
            <p className="text-blue-600 text-xs mt-1">Click "Request OTP" to get verification code</p>
          )}
          {otpRequested && !isVerified && (
            <p className="text-green-600 text-xs mt-1">OTP sent! Enter the 6-digit code to verify</p>
          )}
          {isVerified && (
            <p className="text-green-600 text-xs mt-1">✅ OTP verified successfully!</p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border">
            <Lock size={16} className="text-gray-500 mr-2" />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              disabled={!isVerified}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} disabled={!isVerified}>
              {showNew ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {newError && <p className="text-red-500 text-xs mt-1">{newError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md border">
            <Lock size={16} className="text-gray-500 mr-2" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              disabled={!isVerified}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={!isVerified}
            >
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUpdate}
          disabled={!isVerified}
          className={`w-full py-2 rounded-md transition ${
            isVerified
              ? "bg-gray-700 text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Update Password
        </button>
      </form>
    </div>
  );
}