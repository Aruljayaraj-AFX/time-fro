"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';

import {
  LogOut,
  KeyRound,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  LineChart,
} from "lucide-react";
export default function PowerBI() {
    const router = useRouter();
        const [activeTab, setActiveTab] = useState("Power BI");
      
        const handleChange = () => router.push("./ChangePass");
        const handleOut = () => router.push("./LoginPage");
      
        const handleTabClick = (tab) => {
          setActiveTab(tab);
          const routeMap = {
            Overview: "/AdminDash",
            Projects: "./Projects",
            Employees: "./Employee",
            Report: "./Employeecopy", // ✅ new route added
            "Power BI": "/PowerBI",
          };
          router.push(routeMap[tab]);
        };
      
        const tabs = [
          { name: "Overview", icon: LineChart },
          { name: "Projects", icon: Briefcase },
          { name: "Employees", icon: Users },
          { name: "Report", icon: TrendingUp },
          { name: "Power BI", icon: LineChart },
        ];
      
    
  return (
    <div className="p-6 bg-[#f9f9f9] min-h-screen">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border-b bg-white">
                    <div>
                      <h1 className="text-xl font-semibold text-gray-800 ">Project Manager Dashboard</h1>
                      <p className="text-sm text-gray-500 ">Welcome back, Keerthana</p>
                    </div>
            
                    <div className="flex space-x-2">
                      <button
                        onClick={handleChange}
                        className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-200"
                      >
                        <KeyRound size={14} />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={handleOut}
                        className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm text-black hover:bg-gray-100"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </header>
            
                  {/* Tabs */}
                  <div className="flex justify-center mt-4 px-4">
                    <div className="flex rounded-full bg-gray-100 px-9 py-2 shadow-inner overflow-x-auto">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.name;
                        return (
                          <button
                            key={tab.name}
                            onClick={() => handleTabClick(tab.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                              isActive
                                ? "bg-white text-blue-600 shadow"
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                          >
                            <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-500"} />
                            {tab.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
    <div className="min-h-screen flex items-center justify-center p-1 ">
      <iframe
          title="Task1"
          width="120%"
          height="450"
          src="https://app.powerbi.com/reportEmbed?reportId=a4c93179-42a5-4300-8ef5-46724d1c7009&autoAuth=true&ctid=2708970a-4d07-4d6e-8cf2-e27187971898"
         allowFullScreen
        ></iframe>
      </div>
      </div>
  );
}
