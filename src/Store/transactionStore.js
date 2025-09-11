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

const useTransactionStore = create((set, get) => ({
  // State
  transactions: [],
  pendingWithdrawals: [],
  loading: {
    transactions: false,
    pendingWithdrawals: false,
  },
  errors: {
    transactions: null,
    pendingWithdrawals: null,
  },

  // Actions
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    })),

  clearError: (key) =>
    set((state) => ({
      errors: { ...state.errors, [key]: null },
    })),

  // Fetch all transactions
  fetchTransactions: async () => {
    try {
      get().setLoading("transactions", true);
      get().clearError("transactions");

      const response = await fetch(`${API_BASE_URL}/admin/transactions`, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our frontend structure
      const transformedTransactions = data.transactions.map((transaction) => ({
        ...transaction,
        // Preserve original type for filtering
        originalType: transaction.type,
        // Map user data correctly
        username: transaction.user?.username || "Unknown User",
        userId: transaction.user?._id || transaction.user,

        // Map transaction types to lowercase for frontend
        type: (() => {
          const backendType = transaction.type?.toLowerCase() || "";
          if (backendType === "withdraw" || backendType === "withdrawal")
            return "withdrawal";
          if (backendType === "deposit") return "deposit";
          if (backendType === "game_stake") return "withdrawal"; // Game stakes are withdrawals
          if (backendType === "game_winnings") return "deposit"; // Game winnings are deposits
          return "deposit"; // Default
        })(),

        // Map status to lowercase for frontend
        status: transaction.status?.toLowerCase() || "pending",

        // Ensure required fields exist
        amount: transaction.amount || 0,
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString(),

        // Set default values for optional fields
        transactionFee: transaction.transactionFee || 0,
        balance: transaction.balance || 0, // This will need to be fetched separately
        reference: transaction.reference || transaction._id,
        notes: transaction.description || transaction.notes || "",
        method: transaction.method || "N/A",
      }));

      set({ transactions: transformedTransactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      get().setError("transactions", error.message);
    } finally {
      get().setLoading("transactions", false);
    }
  },

  // Get transaction by ID
  getTransactionById: (id) => {
    const { transactions } = get();
    return transactions.find((transaction) => transaction._id === id);
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/transactions/${transactionId}/status`,
        {
          method: "PATCH",
          headers: createAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh transactions after update
      get().fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  },

  // Get transaction statistics
  getTransactionStats: () => {
    const { transactions } = get();

    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "completed"
    ).length;
    const pendingTransactions = transactions.filter(
      (transaction) => transaction.status === "pending"
    ).length;
    const failedTransactions = transactions.filter(
      (transaction) => transaction.status === "failed"
    ).length;

    const totalDeposits = transactions.filter(
      (transaction) => transaction.type === "deposit"
    ).length;
    const totalWithdrawals = transactions.filter(
      (transaction) => transaction.type === "withdrawal"
    ).length;

    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
    const totalFees = transactions.reduce(
      (sum, transaction) => sum + (transaction.transactionFee || 0),
      0
    );

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalDeposits,
      totalWithdrawals,
      totalAmount,
      totalFees,
    };
  },

  // Get transactions by user
  getTransactionsByUser: (userId) => {
    const { transactions } = get();
    return transactions.filter(
      (transaction) =>
        transaction.userId === userId || transaction.username === userId
    );
  },

  // Get transactions by date range
  getTransactionsByDateRange: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },

  // Fetch pending withdrawals
  fetchPendingWithdrawals: async () => {
    try {
      get().setLoading("pendingWithdrawals", true);
      get().clearError("pendingWithdrawals");

      const response = await fetch(
        `${API_BASE_URL}/wallet/admin/pending-withdrawals`,
        {
          method: "GET",
          headers: createAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our frontend structure
      const transformedWithdrawals = data.pendingWithdrawals.map(
        (transaction) => ({
          ...transaction,
          username: transaction.user?.username || "Unknown User",
          userId: transaction.user?._id || transaction.user,
          type: "withdrawal",
          status: "pending",
          amount: transaction.amount || 0,
          createdAt: transaction.createdAt || new Date().toISOString(),
          updatedAt: transaction.updatedAt || new Date().toISOString(),
          reference: transaction._id,
          notes: transaction.description || "",
          method: transaction.withdrawalMethod || "N/A",
          accountDetails: transaction.accountDetails || "",
        })
      );

      set({ pendingWithdrawals: transformedWithdrawals });
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      get().setError("pendingWithdrawals", error.message);
    } finally {
      get().setLoading("pendingWithdrawals", false);
    }
  },

  // Approve withdrawal
  approveWithdrawal: async (transactionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/wallet/admin/withdrawals/${transactionId}/approve`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh pending withdrawals after approval
      get().fetchPendingWithdrawals();
      get().fetchTransactions();
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      throw error;
    }
  },

  // Reject withdrawal
  rejectWithdrawal: async (transactionId, reason = "") => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/wallet/admin/withdrawals/${transactionId}/reject`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh pending withdrawals after rejection
      get().fetchPendingWithdrawals();
      get().fetchTransactions();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      throw error;
    }
  },
}));

export default useTransactionStore;
