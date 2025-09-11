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

const useBankStore = create((set, get) => ({
  // State
  banks: [],
  bankForm: { number: "", accountFullName: "" },
  editingBank: null,

  // Loading States
  loading: {
    banks: false,
    bankAction: false,
  },

  // Error States
  errors: {
    banks: null,
    bankAction: null,
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

  // Set bank form data
  setBankForm: (formData) => set({ bankForm: formData }),

  // Set editing bank
  setEditingBank: (bankId) => set({ editingBank: bankId }),

  // Clear bank form
  clearBankForm: () => set({ bankForm: { number: "", accountFullName: "" } }),

  // Clear all errors
  clearAllErrors: () =>
    set({
      errors: {
        banks: null,
        bankAction: null,
      },
    }),

  // Fetch all banks
  fetchBanks: async () => {
    try {
      get().setLoading("banks", true);
      get().clearError("banks");

      const response = await fetch(`${API_BASE_URL}/banks/`, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        set({ banks: data.banks || [] });
      } else {
        throw new Error(data.message || "Failed to fetch banks");
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      get().setError("banks", error.message);
    } finally {
      get().setLoading("banks", false);
    }
  },

  // Update bank details
  updateBankDetails: async (bankId, bankData) => {
    try {
      get().setLoading("bankAction", true);
      get().clearError("bankAction");

      const headers = createAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/banks/${bankId}/details`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(bankData),
      });

      console.log("📡 Response Status:", response.status);
      console.log(
        "📡 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ Success Response:", data);

      if (data.success) {
        // Update local state
        const updatedBanks = get().banks.map((bank) =>
          bank._id === bankId
            ? {
                ...bank,
                number: data.bank.number,
                accountFullName: data.bank.accountFullName,
              }
            : bank
        );

        set({
          banks: updatedBanks,
          editingBank: null,
          bankForm: { number: "", accountFullName: "" },
        });

        return { success: true, data: data.bank };
      } else {
        throw new Error(data.message || "Failed to update bank");
      }
    } catch (error) {
      console.error("Error updating bank:", error);
      get().setError("bankAction", error.message);
      return { success: false, error: error.message };
    } finally {
      get().setLoading("bankAction", false);
    }
  },

  // Edit bank
  editBank: (bank) => {
    set({
      editingBank: bank._id,
      bankForm: {
        number: bank.number,
        accountFullName: bank.accountFullName,
      },
    });
  },

  // Cancel edit
  cancelEdit: () => {
    set({
      editingBank: null,
      bankForm: { number: "", accountFullName: "" },
    });
    get().clearError("bankAction");
  },

  // Get bank by ID
  getBankById: (bankId) => {
    const { banks } = get();
    return banks.find((bank) => bank._id === bankId);
  },

  // Initialize bank management
  initializeBankManagement: async () => {
    try {
      await get().fetchBanks();
    } catch (error) {
      console.error("Error initializing bank management:", error);
    }
  },
}));

export default useBankStore;
