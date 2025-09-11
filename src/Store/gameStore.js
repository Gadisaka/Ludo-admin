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

const useGameStore = create((set, get) => ({
  // State
  games: [],
  loading: {
    games: false,
  },
  errors: {
    games: null,
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

  // Fetch all games
  fetchGames: async () => {
    try {
      get().setLoading("games", true);
      get().clearError("games");

      const response = await fetch(`${API_BASE_URL}/admin/games`, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our frontend structure
      const transformedGames = data.games.map((game) => ({
        ...game,
        // Ensure we have the required fields
        requiredPieces: game.requiredPieces || 1,
        status: game.status || "waiting",
        stake: game.stake || 0,
        players: game.players || [],
        createdAt: game.createdAt || new Date().toISOString(),
        updatedAt: game.updatedAt || new Date().toISOString(),
      }));

      set({ games: transformedGames });
    } catch (error) {
      console.error("Error fetching games:", error);
      get().setError("games", error.message);
    } finally {
      get().setLoading("games", false);
    }
  },

  // Get game by ID
  getGameById: (id) => {
    const { games } = get();
    return games.find((game) => game._id === id);
  },

  // Update game status
  updateGameStatus: async (gameId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/games/${gameId}/status`,
        {
          method: "PATCH",
          headers: createAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh games after update
      get().fetchGames();
    } catch (error) {
      console.error("Error updating game status:", error);
      throw error;
    }
  },

  // Delete game
  deleteGame: async (gameId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/games/${gameId}`, {
        method: "DELETE",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh games after deletion
      get().fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  // Get game statistics
  getGameStats: () => {
    const { games } = get();

    const totalGames = games.length;
    const activeGames = games.filter(
      (game) => game.status === "playing"
    ).length;
    const completedGames = games.filter(
      (game) => game.status === "finished"
    ).length;
    const waitingGames = games.filter(
      (game) => game.status === "waiting"
    ).length;

    const totalStakes = games.reduce((sum, game) => sum + (game.stake || 0), 0);
    const totalPrizePools = games.reduce((sum, game) => {
      const playerCount = Array.isArray(game.players) ? game.players.length : 0;
      return sum + (game.stake || 0) * playerCount;
    }, 0);

    return {
      totalGames,
      activeGames,
      completedGames,
      waitingGames,
      totalStakes,
      totalPrizePools,
    };
  },
}));

export default useGameStore;
