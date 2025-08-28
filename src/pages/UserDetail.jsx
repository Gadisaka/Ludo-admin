import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Gamepad2,
  DollarSign,
  Clock,
  User,
  Phone,
  Calendar,
  Activity,
  Edit3,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { useUserStore } from "../Store";
import { API_URL } from "../../constants";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get data from user store
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // First try to get from store
        if (users.length > 0) {
          const foundUser = users.find((u) => u._id === userId);
          if (foundUser) {
            setUser(foundUser);
            setEditStatus(foundUser.isActive);
            setLoading(false);
            return;
          }
        }

        // If not in store, fetch from API
        const response = await fetch(`${API_URL}/admin/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const foundUser = data.users.find((u) => u._id === userId);

        if (foundUser) {
          setUser(foundUser);
          setEditStatus(foundUser.isActive);
          setHasChanges(false);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, users]);

  const handleSaveStatus = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: editStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setUser((prev) => ({ ...prev, isActive: editStatus }));
      setHasChanges(false);
      setIsEditing(false);

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setEditStatus(newStatus);
    setHasChanges(newStatus !== user.isActive);
  };

  const handleCancelEdit = () => {
    setEditStatus(user.isActive);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh users list and navigate back
      fetchUsers();
      navigate("/users");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || "User not found"}</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/users")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Player Details</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <Edit3 className="w-4 h-4 mr-2 inline" />
            {isEditing ? "Cancel Edit" : "Edit User"}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Delete User
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-600" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {user.username}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{user.phone || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  Joined:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-4">
              {isEditing ? (
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  {/* Switch Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      User Status:
                    </span>
                    <button
                      onClick={() => handleStatusChange(!editStatus)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        editStatus ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editStatus ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        editStatus ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {editStatus ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Action Buttons - Only show when there are changes */}
                  {hasChanges && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveStatus}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                          </div>
                        )}
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Cancel Edit Button - Always show when editing */}
                  {!hasChanges && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Edit
                    </button>
                  )}
                </div>
              ) : (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Gamepad2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {user.totalGames || 0}
          </p>
          <p className="text-sm text-gray-500">Total Games</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {user.gamesWon || 0}
          </p>
          <p className="text-sm text-gray-500">Games Won</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {user.winRate || "0.0%"}
          </p>
          <p className="text-sm text-gray-500">Win Rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            ${(user.totalWinnings || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Winnings</p>
        </div>
      </div>

      {/* Additional Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <DollarSign className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">
            ${(user.totalStakes || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Stakes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">
            ${(user.netProfit || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Net Profit</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">
            {user.lastGamePlayed
              ? new Date(user.lastGamePlayed).toLocaleDateString()
              : "Never"}
          </p>
          <p className="text-sm text-gray-500">Last Game</p>
        </div>
      </div>

      {/* Game Type Distribution */}
      {user.gamesByType && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Game Type Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(user.gamesByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">Kings {type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Join Date</p>
              <p className="text-gray-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Last Active</p>
              <p className="text-gray-900">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Last Game Won</p>
              <p className="text-gray-900">
                {user.lastGameWon
                  ? new Date(user.lastGameWon).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="text-gray-900 font-mono text-sm">{user._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{user.username}</span>? This
                will permanently remove their account, game history, and all
                associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
