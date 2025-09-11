import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdSportsEsports,
  MdPayment,
  MdPeople,
  MdPerson,
  MdMenu,
  MdChevronLeft,
  MdLogout,
  MdAccountCircle,
  MdSettings,
  MdImage,
  MdPendingActions,
} from "react-icons/md";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/", icon: <MdDashboard />, label: "Dashboard" },
    { path: "/games", icon: <MdSportsEsports />, label: "Games" },
    { path: "/transactions", icon: <MdPayment />, label: "Transactions" },
    {
      path: "/pending-withdrawals",
      icon: <MdPendingActions />,
      label: "Pending Withdrawals",
    },
    { path: "/users", icon: <MdPeople />, label: "Users" },
    { path: "/bots", icon: <MdPerson />, label: "Bots" },
    { path: "/ads", icon: <MdImage />, label: "Ads & Social" },
    // { path: "/settings", icon: <MdSettings />, label: "Settings" },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem("token");
    navigate("/auth");
    console.log("Logging out...");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Title Section */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1
          className={`font-bold text-xl transition-all duration-300 ${
            isCollapsed ? "text-2xl" : "text-4xl"
          }`}
        >
          {isCollapsed ? "L" : "Ludo"}
        </h1>
      </div>

      <button
        className="absolute -right-3 top-6 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <MdMenu size={20} /> : <MdChevronLeft size={20} />}
      </button>

      {/* Navigation Section */}
      <nav className="flex-1 mt-4 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && (
              <span className="ml-4 text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-700 p-4 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center w-full ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center">
            <MdAccountCircle size={24} />
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium">Admin User</span>
            )}
          </div>
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            >
              <MdLogout className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
