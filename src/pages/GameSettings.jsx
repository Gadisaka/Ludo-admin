import React, { useState, useEffect } from "react";
import { useAdminStore, useGameSettingsStore } from "../Store";

const GameSettings = () => {
  const { token } = useAdminStore();
  const {
    settings,
    loading,
    saving,
    fetchSettings,
    saveSettings,
    updateSetting,
    addBotName,
    removeBotName,
  } = useGameSettingsStore();

  const [editingBotNames, setEditingBotNames] = useState(false);
  const [newBotName, setNewBotName] = useState("");

  // Load settings on component mount
  useEffect(() => {
    fetchSettings(); // No token needed for GET request
  }, [fetchSettings]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    updateSetting(field, value);
  };

  // Handle number input with validation
  const handleNumberChange = (field, value, min, max) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= min && numValue <= max) {
      updateSetting(field, numValue);
    }
  };

  // Handle save
  const handleSave = () => {
    if (settings) {
      saveSettings(token, settings);
    }
  };

  // Handle add bot name
  const handleAddBotName = () => {
    if (
      newBotName.trim() &&
      settings?.BOT_NAMES &&
      !settings.BOT_NAMES.includes(newBotName.trim())
    ) {
      addBotName(newBotName.trim());
      setNewBotName("");
    }
  };

  // Handle remove bot name
  const handleRemoveBotName = (index) => {
    removeBotName(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Game Settings
            </h1>
            <p className="text-gray-600">
              {/* Failed to load game settings. Please try again. */}
              game settings will be implemented soon
            </p>
            <button
              onClick={() => fetchSettings()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Game Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure bot behavior and game parameters
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => fetchSettings()}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Bot Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
            Bot Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bot Enable/Disable */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bots Enabled
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.BOTS_ENABLED}
                  onChange={(e) =>
                    handleInputChange("BOTS_ENABLED", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {settings.BOTS_ENABLED ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Bot Join Delay */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bot Join Delay (ms)
              </label>
              <input
                type="number"
                value={settings.BOT_JOIN_DELAY_MS}
                onChange={(e) =>
                  handleNumberChange(
                    "BOT_JOIN_DELAY_MS",
                    e.target.value,
                    1000,
                    300000
                  )
                }
                min="1000"
                max="300000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 1,000 - 300,000 ms</p>
            </div>

            {/* Max Bots Per Game */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Bots Per Game
              </label>
              <input
                type="number"
                value={settings.MAX_BOTS_PER_GAME}
                onChange={(e) =>
                  handleNumberChange("MAX_BOTS_PER_GAME", e.target.value, 0, 3)
                }
                min="0"
                max="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 0 - 3</p>
            </div>

            {/* Immediate Join Delay */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Immediate Join Delay (ms)
              </label>
              <input
                type="number"
                value={settings.BOT_IMMEDIATE_JOIN_DELAY_MS}
                onChange={(e) =>
                  handleNumberChange(
                    "BOT_IMMEDIATE_JOIN_DELAY_MS",
                    e.target.value,
                    1000,
                    300000
                  )
                }
                min="1000"
                max="300000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 1,000 - 300,000 ms</p>
            </div>

            {/* Move Delay */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bot Move Delay (ms)
              </label>
              <input
                type="number"
                value={settings.BOT_MOVE_DELAY_MS}
                onChange={(e) =>
                  handleNumberChange(
                    "BOT_MOVE_DELAY_MS",
                    e.target.value,
                    500,
                    10000
                  )
                }
                min="500"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 500 - 10,000 ms</p>
            </div>

            {/* Dice Roll Delay */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bot Dice Roll Delay (ms)
              </label>
              <input
                type="number"
                value={settings.BOT_DICE_ROLL_DELAY_MS}
                onChange={(e) =>
                  handleNumberChange(
                    "BOT_DICE_ROLL_DELAY_MS",
                    e.target.value,
                    500,
                    10000
                  )
                }
                min="500"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 500 - 10,000 ms</p>
            </div>
          </div>
        </div>

        {/* Bot Naming Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
            Bot Naming Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Suffix Separator */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name Suffix Separator
              </label>
              <input
                type="text"
                value={settings.BOT_NAME_SUFFIX_SEPARATOR}
                onChange={(e) =>
                  handleInputChange("BOT_NAME_SUFFIX_SEPARATOR", e.target.value)
                }
                maxLength="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#"
              />
              <p className="text-xs text-gray-500">Max 5 characters</p>
            </div>

            {/* Max Name Attempts */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Name Attempts
              </label>
              <input
                type="number"
                value={settings.MAX_NAME_ATTEMPTS}
                onChange={(e) =>
                  handleNumberChange(
                    "MAX_NAME_ATTEMPTS",
                    e.target.value,
                    1,
                    100
                  )
                }
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 1 - 100</p>
            </div>
          </div>

          {/* Bot Names Management */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Bot Names ({settings.BOT_NAMES.length} names)
              </label>
              <button
                onClick={() => setEditingBotNames(!editingBotNames)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                {editingBotNames ? "Done Editing" : "Edit Names"}
              </button>
            </div>

            {editingBotNames && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="Enter new bot name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleAddBotName()}
                />
                <button
                  onClick={handleAddBotName}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {settings.BOT_NAMES.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <span className="text-sm text-gray-700 truncate">{name}</span>
                  {editingBotNames && (
                    <button
                      onClick={() => handleRemoveBotName(index)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
            Game Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Cut Percentage */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Game Cut Percentage (%)
              </label>
              <input
                type="number"
                value={settings.GAME_CUT_PERCENTAGE}
                onChange={(e) =>
                  handleNumberChange(
                    "GAME_CUT_PERCENTAGE",
                    e.target.value,
                    0,
                    50
                  )
                }
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Range: 0% - 50%</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => fetchSettings()}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {saving ? "Saving Changes..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
