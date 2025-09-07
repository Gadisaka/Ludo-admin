import { create } from "zustand";
import { toast } from "react-hot-toast";
import { API_URL } from "../../constants";

// Helper to get admin token
const getAdminToken = () => localStorage.getItem("token");

const useBotSettingsStore = create((set, get) => ({
  // State
  botsEnabled: false,
  loading: false,
  saving: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),
  setBotsEnabled: (enabled) => set({ botsEnabled: enabled }),

  // Fetch bot settings from API
  fetchBotSettings: async () => {
    try {
      set({ loading: true, error: null });
      console.log(
        "Fetching bot settings from:",
        `${API_URL}/admin/settings/BOTS_ENABLED`
      );

      const token = getAdminToken();
      const response = await fetch(`${API_URL}/admin/settings/BOTS_ENABLED`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        // If specific setting not found, default to false
        if (response.status === 404) {
          console.log("BOTS_ENABLED setting not found, defaulting to false");
          set({ botsEnabled: false, loading: false });
          return false;
        }
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch bot settings: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Bot settings data received:", data);

      // Extract BOTS_ENABLED from the response
      const botsEnabled =
        data.success && data.data ? Boolean(data.data.settingValue) : false;
      set({ botsEnabled, loading: false });
      return botsEnabled;
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      set({ error: error.message, loading: false });
      toast.error(`Failed to load bot settings: ${error.message}`);
      throw error;
    }
  },

  // Toggle bots enabled/disabled
  toggleBotsEnabled: async () => {
    try {
      set({ saving: true, error: null });

      const token = getAdminToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const { botsEnabled } = get();
      const newValue = !botsEnabled;

      console.log("Toggling bots enabled to:", newValue);

      const response = await fetch(`${API_URL}/admin/settings/BOTS_ENABLED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: newValue,
          description: "Enable or disable bot players in games",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update bot settings: ${response.status} ${errorText}`
        );
      }

      await response.json();
      set({
        botsEnabled: newValue,
        saving: false,
      });

      toast.success(`Bots ${newValue ? "enabled" : "disabled"} successfully!`);

      return newValue;
    } catch (error) {
      console.error("Error toggling bot settings:", error);
      set({ error: error.message, saving: false });
      toast.error(`Failed to update bot settings: ${error.message}`);
      throw error;
    }
  },

  // Update bots enabled status directly
  updateBotsEnabled: async (enabled) => {
    try {
      set({ saving: true, error: null });

      const token = getAdminToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      console.log("Setting bots enabled to:", enabled);

      const response = await fetch(`${API_URL}/admin/settings/BOTS_ENABLED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: enabled,
          description: "Enable or disable bot players in games",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update bot settings: ${response.status} ${errorText}`
        );
      }

      await response.json();
      set({
        botsEnabled: enabled,
        saving: false,
      });

      toast.success(`Bots ${enabled ? "enabled" : "disabled"} successfully!`);

      return enabled;
    } catch (error) {
      console.error("Error updating bot settings:", error);
      set({ error: error.message, saving: false });
      toast.error(`Failed to update bot settings: ${error.message}`);
      throw error;
    }
  },

  // Clear store
  clearStore: () => {
    set({
      botsEnabled: false,
      loading: false,
      saving: false,
      error: null,
    });
  },

  // Get current bots enabled status
  getBotsEnabled: () => {
    const { botsEnabled } = get();
    return botsEnabled;
  },
}));

export default useBotSettingsStore;
