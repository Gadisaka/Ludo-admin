import { create } from "zustand";
import { toast } from "react-hot-toast";
import { API_URL } from "../../constants";

const useGameSettingsStore = create((set, get) => ({
  // State
  settings: null,
  loading: false,
  saving: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),
  setSettings: (settings) => set({ settings }),

  // Fetch settings from API
  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      console.log("Fetching settings from:", `${API_URL}/settings`);
      console.log("GET /settings is public - no token required");

      // GET /settings is public, so we don't need to send the token
      const response = await fetch(`${API_URL}/settings`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `Failed to fetch settings: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Settings data received:", data);
      set({ settings: data, loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({ error: error.message, loading: false });
      toast.error(`Failed to load game settings: ${error.message}`);
      throw error;
    }
  },

  // Save settings to API
  saveSettings: async (token, settings) => {
    try {
      set({ saving: true, error: null });
      console.log("Saving settings:", settings);

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update settings: ${response.status} ${errorText}`
        );
      }

      const updatedSettings = await response.json();
      set({ settings: updatedSettings, saving: false });
      toast.success("Game settings updated successfully!");
      return updatedSettings;
    } catch (error) {
      console.error("Error saving settings:", error);
      set({ error: error.message, saving: false });
      toast.error(`Failed to save game settings: ${error.message}`);
      throw error;
    }
  },

  // Update a specific setting field
  updateSetting: (field, value) => {
    const { settings } = get();
    if (settings) {
      set({
        settings: {
          ...settings,
          [field]: value,
        },
      });
    }
  },

  // Update multiple settings at once
  updateMultipleSettings: (updates) => {
    const { settings } = get();
    if (settings) {
      set({
        settings: {
          ...settings,
          ...updates,
        },
      });
    }
  },

  // Add a new bot name
  addBotName: (name) => {
    const { settings } = get();
    if (settings && name.trim() && !settings.BOT_NAMES.includes(name.trim())) {
      set({
        settings: {
          ...settings,
          BOT_NAMES: [...settings.BOT_NAMES, name.trim()],
        },
      });
    }
  },

  // Remove a bot name by index
  removeBotName: (index) => {
    const { settings } = get();
    if (settings) {
      set({
        settings: {
          ...settings,
          BOT_NAMES: settings.BOT_NAMES.filter((_, i) => i !== index),
        },
      });
    }
  },

  // Reset settings to original values
  resetSettings: async () => {
    try {
      await get().fetchSettings();
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  },

  // Clear store
  clearStore: () => {
    set({
      settings: null,
      loading: false,
      saving: false,
      error: null,
    });
  },

  // Get specific setting value
  getSetting: (field) => {
    const { settings } = get();
    return settings ? settings[field] : null;
  },

  // Check if settings have been modified (compare with original)
  hasChanges: () => {
    // This would need to be implemented if you want to track original vs current values
    return false;
  },
}));

export default useGameSettingsStore;
