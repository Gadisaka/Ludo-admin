import { create } from "zustand";
import { API_URL } from "../../constants";

const API_BASE_URL = API_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to create headers with auth token
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const useUserStore = create((set, get) => ({
  // User Data
  users: [],
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    bannedUsers: 0,
  },

  // Filters and Pagination
  filters: {
    search: "",
    status: "all",
    role: "all",
    dateRange: "all",
  },

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  // Loading States
  loading: {
    users: false,
    userStats: false,
    userAction: false,
  },

  // Error States
  errors: {
    users: null,
    userStats: null,
    userAction: null,
  },

  // Actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  clearErrors: () => {
    set({
      errors: {
        users: null,
        userStats: null,
        userAction: null,
      },
    });
  },

  // Fetch Users
  fetchUsers: async () => {
    set((state) => ({
      loading: { ...state.loading, users: true },
      errors: { ...state.errors, users: null },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: createAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Fetched users data:", data);
      console.log("Users with stats:", data.users);

      set({
        users: data.users || [],
        pagination: {
          ...get().pagination,
          total: data.total || 0,
        },
        loading: { ...get().loading, users: false },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set((state) => ({
        errors: { ...state.errors, users: error.message },
        loading: { ...state.loading, users: false },
      }));
    }
  },

  // Fetch User Statistics
  fetchUserStats: async () => {
    set((state) => ({
      loading: { ...state.loading, userStats: true },
      errors: { ...state.errors, userStats: null },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
        headers: createAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const users = data.users || [];

      // Calculate user statistics
      const totalUsers = users.length;
      const activeUsers = users.filter((user) => user.isActive).length;
      const newUsers = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate >= weekAgo;
      }).length;
      const bannedUsers = users.filter((user) => !user.isActive).length;

      set({
        userStats: {
          totalUsers,
          activeUsers,
          newUsers,
          bannedUsers,
        },
        loading: { ...get().loading, userStats: false },
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      set((state) => ({
        errors: { ...state.errors, userStats: error.message },
        loading: { ...state.loading, userStats: false },
      }));
    }
  },

  // Ban User
  banUser: async (userId) => {
    set((state) => ({
      loading: { ...state.loading, userAction: true },
      errors: { ...state.errors, userAction: null },
    }));

    try {
      // Note: Backend doesn't have a ban endpoint, so we'll simulate it
      // In a real implementation, you'd add a ban endpoint to the backend
      const updatedUsers = get().users.map((user) =>
        user._id === userId ? { ...user, isActive: false } : user
      );

      set({
        users: updatedUsers,
        loading: { ...get().loading, userAction: false },
      });

      // Update stats
      get().fetchUserStats();
    } catch (error) {
      console.error("Error banning user:", error);
      set((state) => ({
        errors: { ...state.errors, userAction: error.message },
        loading: { ...state.loading, userAction: false },
      }));
    }
  },

  // Unban User
  unbanUser: async (userId) => {
    set((state) => ({
      loading: { ...state.loading, userAction: true },
      errors: { ...state.errors, userAction: null },
    }));

    try {
      // Note: Backend doesn't have an unban endpoint, so we'll simulate it
      const updatedUsers = get().users.map((user) =>
        user._id === userId ? { ...user, isActive: true } : user
      );

      set({
        users: updatedUsers,
        loading: { ...get().loading, userAction: false },
      });

      // Update stats
      get().fetchUserStats();
    } catch (error) {
      console.error("Error unbanning user:", error);
      set((state) => ({
        errors: { ...state.errors, userAction: error.message },
        loading: { ...state.loading, userAction: false },
      }));
    }
  },

  // Delete User
  deleteUser: async (userId) => {
    set((state) => ({
      loading: { ...state.loading, userAction: true },
      errors: { ...state.errors, userAction: null },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove user from local state
      const updatedUsers = get().users.filter((user) => user._id !== userId);

      set({
        users: updatedUsers,
        pagination: {
          ...get().pagination,
          total: updatedUsers.length,
        },
        loading: { ...get().loading, userAction: false },
      });

      // Update stats
      get().fetchUserStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      set((state) => ({
        errors: { ...state.errors, userAction: error.message },
        loading: { ...state.loading, userAction: false },
      }));
    }
  },

  // Update User
  updateUser: async (userId, updates) => {
    set((state) => ({
      loading: { ...state.loading, userAction: true },
      errors: { ...state.errors, userAction: null },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: createAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update user in local state
      const updatedUsers = get().users.map((user) =>
        user._id === userId ? { ...user, ...updates } : user
      );

      set({
        users: updatedUsers,
        loading: { ...get().loading, userAction: false },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      set((state) => ({
        errors: { ...state.errors, userAction: error.message },
        loading: { ...state.loading, userAction: false },
      }));
    }
  },

  // Initialize User Management
  initializeUserManagement: async () => {
    try {
      await Promise.all([get().fetchUsers(), get().fetchUserStats()]);
    } catch (error) {
      console.error("Error initializing user management:", error);
    }
  },
}));

export default useUserStore;
