import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import Users from "./pages/Users";
import Login from "./pages/Auth/login";

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/auth" replace />;
    }

    return children;
  };

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && location.pathname !== "/auth" && <Sidebar />}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out p-6 ${
          isAuthenticated && location.pathname !== "/auth"
            ? isSidebarCollapsed
              ? "ml-16"
              : "ml-64"
            : ""
        }`}
      >
        <Routes>
          <Route
            path="/auth"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
