"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
  // First attempt: Admin login
  const adminResponse = await fetch("https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const adminData = await adminResponse.json();

  if (adminResponse.ok && adminData.token) {
    localStorage.setItem("token", adminData.token);
    router.push("./AdminDash");
  } else {
    // If admin login fails, try user login
    const userResponse = await fetch("https://time-tracking-qyg0.onrender.com/codework/employee-time-tracking/v1/user_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const userData = await userResponse.json();

    if (userResponse.ok && userData.token) {
      localStorage.setItem("utoken", userData.token);
      router.push("./UserDash");
    } else {
      alert(userData.detail || "Login failed");
    }
  }
} catch (error) {
  console.error("Login error:", error);
  alert("Something went wrong. Please try again.");
}

};
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f4ff] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-900 text-white rounded-full p-3">
            <img src="/security.png" alt="security" className="w-7 h-7" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
        </div>
        {/* Email Field */}
        <div>
          <label className="mb-1 text-gray-700 font-bold block">Email Address</label>
          <div className="flex items-center border border-gray-300 rounded-md bg-gray-100 px-3 hover:bg-gray-200 hover:border-gray-400 hover:border-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-2 py-2 bg-transparent outline-none text-black text-xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="font-bold mb-1 text-gray-700 block">Password</label>
          <div className="flex items-center border border-gray-300 rounded-md bg-gray-100 px-3 hover:bg-gray-200 hover:border-gray-400 hover:border-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-2 py-2 bg-transparent outline-none text-black text-xs"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Eye className="h-5 w-5 text-gray-500 pr-2" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-500 pr-2" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          Sign In
        </button>
      
       <div className="bg-gray-100 p-4 rounded-md shadow-md max-w-sm">
      <p className="text-sm font-semibold text-gray-600 mb-2">Demo Credentials:</p>
      <div className="text-sm space-y-1">
        <p>
          <span className="font-bold text-gray-700">Manager:</span>{" "}
          <span className="text-gray-700">keerthana@company.com /</span> <span className="text-gray-700">manager123</span>
        </p>
         <p>
          <span className="font-bold text-gray-700">Users:</span>{" "}
          <span className="text-gray-700">user@company.com /</span> <span className="text-gray-700">temp123</span>
        </p>
        </div></div>
        </div>
    </div>
  );
}
