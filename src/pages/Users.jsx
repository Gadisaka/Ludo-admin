import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { useUserStore } from "../Store";
import { API_URL } from "../../constants";

const Users = () => {
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Recalculation state
  const [recalculating, setRecalculating] = useState(false);

  // Get data from user store
  const { users, loading, errors, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Sort function
  const sortUsers = (usersToSort) => {
    if (!sortConfig.key) return usersToSort;

    return [...usersToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric values (like totalWinnings)
      if (typeof aValue === "number" && typeof bValue === "number") {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        // Handle string values
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Filter users based on selected criteria
  const filteredUsers = users.filter((user) => {
    // Status filter
    if (
      filters.status !== "all" &&
      user.isActive !== (filters.status === "active")
    ) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const username = user.username?.toLowerCase() || "";
      const phone = user.phone?.toLowerCase() || "";

      return username.includes(searchTerm) || phone.includes(searchTerm);
    }

    return true;
  });

  // Apply sorting to filtered users
  const sortedUsers = sortUsers(filteredUsers);

  // Pagination calculations
  const totalFilteredPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const filteredStartIndex = (currentPage - 1) * itemsPerPage;
  const filteredEndIndex = filteredStartIndex + itemsPerPage;
  const currentFilteredUsers = sortedUsers.slice(
    filteredStartIndex,
    filteredEndIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Page navigation functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalFilteredPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRowClick = (user) => {
    navigate(`/users/${user._id}`);
  };

  const handleRecalculateStats = async () => {
    try {
      setRecalculating(true);

      const response = await fetch(`${API_URL}/admin/users/recalculate-stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Stats recalculation started:", data.message);

      // Refresh user data after a short delay
      setTimeout(() => {
        fetchUsers();
      }, 2000);
    } catch (error) {
      console.error("Error starting stats recalculation:", error);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading.users) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errors.users) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading users: {errors.users}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRecalculateStats}
            disabled={recalculating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recalculating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Recalculating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recalculate Stats
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Username or Phone..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end gap-2">
            <button
              onClick={() =>
                setFilters({ status: "all", search: "", dateRange: "all" })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setSortConfig({ key: null, direction: "asc" })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              Clear Sort
            </button>
          </div>
        </div>
      </div>

      {/* Page Size Selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="pageSize"
            className="text-sm font-medium text-gray-700"
          >
            Show:
          </label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">entries per page</span>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium">{sortedUsers.length}</span> users
          {filters.status !== "all" || filters.search ? (
            <span className="text-blue-600 ml-2">(filtered)</span>
          ) : null}
          {sortConfig.key && (
            <span className="text-purple-600 ml-2">
              (sorted by {sortConfig.key}{" "}
              {sortConfig.direction === "asc" ? "↑" : "↓"})
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("_id")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>ID</span>
                  {sortConfig.key === "_id" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("username")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Username</span>
                  {sortConfig.key === "username" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("phone")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Phone</span>
                  {sortConfig.key === "phone" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("isActive")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Status</span>
                  {sortConfig.key === "isActive" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Last Active</span>
                  {sortConfig.key === "updatedAt" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort("totalWinnings")}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Total Winnings</span>
                  {sortConfig.key === "totalWinnings" && (
                    <span className="text-blue-600">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFilteredUsers.map((user) => (
              <tr
                key={user._id}
                onClick={() => handleRowClick(user)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.totalWinnings !== undefined &&
                  user.totalWinnings !== null ? (
                    <span
                      className={`font-medium ${
                        user.totalWinnings > 0
                          ? "text-green-600"
                          : user.totalWinnings < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "ETB",
                      }).format(user.totalWinnings)}
                    </span>
                  ) : (
                    <span className="text-gray-400">ETB 0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalFilteredPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalFilteredPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{filteredStartIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(filteredEndIndex, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalFilteredPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalFilteredPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
