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

const useAdminStore = create((set, get) => ({
  // Dashboard Overview Data
  dashboardStats: {
    totalUsers: 0,
    totalGames: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    totalDeposits: 0,
  },

  // Real-time Data
  realTimeData: {
    onlineUsers: 0,
    activeGames: 0,
    recentTransactions: [],
    recentGames: [],
  },

  // Charts Data
  chartData: {
    revenueData: [],
    userGrowthData: [],
    gameStatsData: [],
    topPlayers: [],
  },

  // Filters
  filters: {
    dateRange: "week",
    gameType: "all",
    status: "all",
  },

  // Loading States
  loading: {
    dashboard: false,
    charts: false,
    realTime: false,
  },

  // Error States
  errors: {
    dashboard: null,
    charts: null,
    realTime: null,
  },

  // Actions
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearErrors: () => {
    set({
      errors: {
        dashboard: null,
        charts: null,
        realTime: null,
      },
    });
  },

  // Fetch Dashboard Data
  fetchDashboardData: async () => {
    set((state) => ({
      loading: { ...state.loading, dashboard: true },
      errors: { ...state.errors, dashboard: null },
    }));

    try {
      console.log("Fetching dashboard data...");

      // Use admin endpoint for dashboard data
      const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: createAuthHeaders(),
      });

      console.log("Dashboard response status:", dashboardResponse.status);

      if (!dashboardResponse.ok) {
        const errorText = await dashboardResponse.text();
        console.error("Dashboard response error:", errorText);
        throw new Error(
          `HTTP error! status: ${dashboardResponse.status} - ${errorText}`
        );
      }

      const dashboardData = await dashboardResponse.json();
      console.log("Dashboard data received:", dashboardData);

      // Extract data from admin response
      const users = dashboardData.users || [];
      const games = dashboardData.games || [];
      const transactions = dashboardData.transactions || [];

      console.log("Extracted data:", {
        users: users.length,
        games: games.length,
        transactions: transactions.length,
      });

      // Calculate dashboard stats
      const totalUsers = users.length;
      const totalGames = games.length;

      // Calculate total deposits (completed)
      const totalDeposits = transactions
        .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate total withdrawals (completed)
      const totalWithdrawals = transactions
        .filter((t) => t.type === "WITHDRAW" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate platform revenue from game cuts
      // Get cut percentage from dashboard data or use default 10%
      const cutPercentage = dashboardData.cutPercentage || 10;

      // Calculate total stakes from completed games
      const completedGames = games.filter((game) => game.status === "finished");
      const totalStakes = completedGames.reduce(
        (sum, game) => sum + (game.stake || 0),
        0
      );

      // Calculate platform cut revenue (10% of total stakes from all games)
      // Each game has 2 players, so total pot is 2 * stake
      // Platform gets cutPercentage% of the total pot
      const totalGamePot = totalStakes * 2; // 2 players per game
      const platformCutRevenue = (totalGamePot * cutPercentage) / 100;

      // Net revenue = platform cut from games + deposits - withdrawals
      const totalRevenue =
        platformCutRevenue + totalDeposits - totalWithdrawals;

      const pendingWithdrawals = transactions
        .filter((t) => t.type === "WITHDRAW" && t.status === "PENDING")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const stats = {
        totalUsers,
        totalGames,
        totalRevenue,
        activeUsers: Math.floor(totalUsers * 0.3), // Estimate 30% active users
        pendingWithdrawals,
        totalDeposits,
        totalWithdrawals,
        platformCutRevenue,
        totalStakes,
        cutPercentage,
      };

      console.log("Calculated stats:", stats);

      set({
        dashboardStats: stats,
        loading: { ...get().loading, dashboard: false },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      set((state) => ({
        errors: { ...state.errors, dashboard: error.message },
        loading: { ...state.loading, dashboard: false },
      }));
    }
  },

  // Fetch Real-time Data
  fetchRealTimeData: async () => {
    set((state) => ({
      loading: { ...state.loading, realTime: true },
      errors: { ...state.errors, realTime: null },
    }));

    try {
      console.log("Fetching real-time data...");

      // Use admin endpoint for transactions
      const transactionsResponse = await fetch(
        `${API_BASE_URL}/admin/transactions`,
        {
          headers: createAuthHeaders(),
        }
      );

      console.log("Transactions response status:", transactionsResponse.status);

      if (!transactionsResponse.ok) {
        const errorText = await transactionsResponse.text();
        console.error("Transactions response error:", errorText);
        throw new Error(
          `HTTP error! status: ${transactionsResponse.status} - ${errorText}`
        );
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.transactions || [];

      console.log("Transactions data received:", {
        count: transactions.length,
      });

      // Fetch recent games
      const gamesResponse = await fetch(`${API_BASE_URL}/admin/games`, {
        headers: createAuthHeaders(),
      });

      console.log("Games response status:", gamesResponse.status);

      if (!gamesResponse.ok) {
        const errorText = await gamesResponse.text();
        console.error("Games response error:", errorText);
        throw new Error(
          `HTTP error! status: ${gamesResponse.status} - ${errorText}`
        );
      }

      const games = await gamesResponse.json();
      console.log("Games data received:", games);

      // Transform transactions for display
      const recentTransactions = transactions.slice(0, 10).map((t) => ({
        user: t.user?.username || "Unknown User",
        action: t.description || `${t.type} transaction`,
        amount: `${t.amount} ብር`,
        time: new Date(t.createdAt).toLocaleTimeString(),
        type: t.type.toLowerCase(),
        status: t.status.toLowerCase(),
      }));

      // Transform games for display - handle both data structures
      const gamesArray = games.games || games; // Handle both {games: [...]} and [...] formats
      const recentGames = gamesArray.slice(0, 5).map((g) => ({
        id: g._id,
        type: g.status,
        players: g.players?.map((p) => p.name || p.username || "Unknown") || [],
        stake: g.stake,
        winner: g.winnerId,
        createdAt: g.createdAt,
      }));

      const realTimeData = {
        onlineUsers: Math.floor(get().dashboardStats.totalUsers * 0.15), // Estimate 15% online
        activeGames: gamesArray.filter((g) => g.status === "playing").length,
        recentTransactions,
        recentGames,
      };

      console.log("Real-time data calculated:", realTimeData);

      set({
        realTimeData,
        loading: { ...get().loading, realTime: false },
      });
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      set((state) => ({
        errors: { ...state.errors, realTime: error.message },
        loading: { ...state.loading, realTime: false },
      }));
    }
  },

  // Fetch Chart Data
  fetchChartData: async () => {
    set((state) => ({
      loading: { ...state.loading, charts: true },
      errors: { ...state.errors, charts: null },
    }));

    try {
      console.log("Fetching chart data...");

      // Use admin endpoint for transactions
      const transactionsResponse = await fetch(
        `${API_BASE_URL}/admin/transactions`,
        {
          headers: createAuthHeaders(),
        }
      );

      console.log(
        "Chart transactions response status:",
        transactionsResponse.status
      );

      if (!transactionsResponse.ok) {
        const errorText = await transactionsResponse.text();
        console.error("Chart transactions response error:", errorText);
        throw new Error(
          `HTTP error! status: ${transactionsResponse.status} - ${errorText}`
        );
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.transactions || [];

      console.log("Chart transactions data received:", {
        count: transactions.length,
      });

      // Fetch games for game stats
      const gamesResponse = await fetch(`${API_BASE_URL}/admin/games`, {
        headers: createAuthHeaders(),
      });

      console.log("Chart games response status:", gamesResponse.status);

      if (!gamesResponse.ok) {
        const errorText = await gamesResponse.text();
        console.error("Chart games response error:", errorText);
        throw new Error(
          `HTTP error! status: ${gamesResponse.status} - ${errorText}`
        );
      }

      const games = await gamesResponse.json();
      console.log("Chart games data received:", games);

      // Generate revenue data (last 6 months)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const revenueData = months.map((month, index) => {
        const monthTransactions = transactions.filter((t) => {
          const date = new Date(t.createdAt);
          return (
            date.getMonth() === index &&
            t.type === "DEPOSIT" &&
            t.status === "COMPLETED"
          );
        });
        return {
          month,
          revenue: monthTransactions.reduce(
            (sum, t) => sum + (t.amount || 0),
            0
          ),
          users: Math.floor(Math.random() * 50) + 10, // Mock user growth data
        };
      });

      // Generate user growth data
      const userGrowthData = months.map((month) => ({
        month,
        users: Math.floor(Math.random() * 100) + 50,
      }));

      // Generate game stats data from real database
      const gameTypeCounts = {};
      const gameTypeColors = {};

      // Count games by requiredPieces from database
      if (games.games) {
        games.games.forEach((game) => {
          const requiredPieces = game.requiredPieces || 1;
          const gameType = `Kings ${requiredPieces}`;

          gameTypeCounts[gameType] = (gameTypeCounts[gameType] || 0) + 1;

          // Assign consistent colors for game types
          if (!gameTypeColors[gameType]) {
            // Use predefined colors for each Kings type
            const kingsColors = {
              "Kings 1": "#FF6B6B", // Red
              "Kings 2": "#4ECDC4", // Teal
              "Kings 3": "#45B7D1", // Blue
              "Kings 4": "#96CEB4", // Green
            };
            gameTypeColors[gameType] =
              kingsColors[gameType] ||
              `#${Math.floor(Math.random() * 16777215).toString(16)}`;
          }
        });
      }

      // Convert to array format for charts
      const gameStatsData = Object.entries(gameTypeCounts).map(
        ([gameType, count]) => ({
          gameType: gameType,
          games: count,
          color: gameTypeColors[gameType],
        })
      );

      // Generate top players data
      const topPlayers = games.games
        ? games.games
            .filter((g) => g.winnerId)
            .reduce((acc, game) => {
              const winner = game.players?.find(
                (p) => p.id === game.winnerId || p.userId === game.winnerId
              );
              if (winner) {
                const name = winner.name || winner.username || "Unknown";
                acc[name] = (acc[name] || 0) + 1;
              }
              return acc;
            }, {})
        : {};

      const topPlayersArray = Object.entries(topPlayers)
        .map(([name, wins]) => ({ name, wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5);

      const chartData = {
        revenueData,
        userGrowthData,
        gameStatsData,
        topPlayers: topPlayersArray,
      };

      console.log("Chart data calculated:", chartData);

      set({
        chartData,
        loading: { ...get().loading, charts: false },
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      set((state) => ({
        errors: { ...state.errors, charts: error.message },
        loading: { ...state.loading, charts: false },
      }));
    }
  },

  // Initialize Dashboard
  initializeDashboard: async () => {
    try {
      await Promise.all([
        get().fetchDashboardData(),
        get().fetchRealTimeData(),
        get().fetchChartData(),
      ]);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
    }
  },
}));

export default useAdminStore;
