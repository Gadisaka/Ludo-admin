import React, { useState, useEffect } from "react";
import {
  Users,
  Gamepad2,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Square,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  useAdminStore,
  useUserStore,
  useGameStore,
  useTransactionStore,
} from "../Store";

// Enhanced Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
  trendValue,
  loading,
  onClick,
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-400 hover:shadow-xl ${
      onClick ? "cursor-pointer" : "cursor-default"
    }`}
    onClick={onClick}
    style={{
      transform: onClick ? "translateY(-4px)" : "translateY(0)",
    }}
  >
    {loading && (
      <div className="absolute top-0 left-0 right-0 z-10 h-1">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
            width: "100%",
          }}
        />
      </div>
    )}

    <div className="relative z-20 flex items-start justify-between">
      <div className="flex-1">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
          {title}
        </p>
        {loading ? (
          <div className="mb-4 h-12 w-3/4 animate-pulse rounded-lg bg-gray-200" />
        ) : (
          <h3
            className="mb-4 text-3xl font-extrabold"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {value}
          </h3>
        )}
        {trend && !loading && (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                trend === "up" ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {trend === "up" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
            <span
              className={`text-sm font-bold ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
          boxShadow: `0 8px 32px ${color}40`,
        }}
      >
        {icon}
      </div>
    </div>
  </div>
);

// Real-time Activity Card Component
const ActivityCard = ({ user, action, amount, time, type, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return <DollarSign className="h-5 w-5" />;
      case "withdrawal":
        return <DollarSign className="h-5 w-5" />;
      case "game_win":
        return <Gamepad2 className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex items-center border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 last:border-b-0">
      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
        {user.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{user}</p>
        <p className="text-sm text-gray-600">{action}</p>
      </div>
      <div className="flex items-center gap-2 text-right">
        {getTypeIcon(type)}
        <span className={`text-sm font-semibold ${getStatusColor(status)}`}>
          {amount}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};

// Active Game Card Component
const ActiveGameCard = ({ game, onPause, onResume, onEnd }) => {
  const getGameTypeColor = (type) => {
    switch (type) {
      case "classic":
        return "bg-blue-500";
      case "tournament":
        return "bg-purple-500";
      case "quickplay":
        return "bg-green-500";
      case "team":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h6 className="text-lg font-semibold text-gray-900">
            Game #{game.id}
          </h6>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${getGameTypeColor(
              game.gameType
            )}`}
          >
            {game.gameType}
          </span>
        </div>
        <span className="text-sm text-gray-600">{game.duration}</span>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-600">Players:</p>
        <div className="flex flex-wrap gap-2">
          {game.players.map((player, index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                player === game.currentTurn
                  ? "bg-blue-500 text-white"
                  : "border border-gray-300 bg-gray-50 text-gray-700"
              }`}
            >
              {player}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Bet: {game.betAmount} Birr
        </span>
        <div className="flex gap-2">
          {game.status === "active" ? (
            <button
              onClick={() => onPause(game.id)}
              className="rounded-lg bg-yellow-500 p-2 text-white hover:bg-yellow-600"
              title="Pause Game"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onResume(game.id)}
              className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600"
              title="Resume Game"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEnd(game.id)}
            className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
            title="End Game"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  // Zustand stores
  const {
    dashboardStats,
    realTimeData,
    chartData,
    loading: adminLoading,
    errors: adminErrors,
    // setFilters,
    initializeDashboard,
    clearErrors,
  } = useAdminStore();

  const { errors: userErrors, initializeUserManagement } = useUserStore();

  const {
    games,
    loading: gameLoading,
    errors: gameErrors,
    updateGameStatus,
    fetchGames,
    getGameStats,
  } = useGameStore();

  // Get current game stats
  const gameStats = getGameStats();
  const activeGames = games.filter((game) => game.status === "playing");

  const {
    transactions,
    loading: transactionLoading,
    errors: transactionErrors,
    updateTransactionStatus,
    fetchTransactions,
  } = useTransactionStore();

  // Get current pending transactions
  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === "pending"
  );

  // Local state
  // const [timeRange, setTimeRange] = useState("week");
  // const [anchorEl, setAnchorEl] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Initialize dashboard data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          initializeDashboard(),
          initializeUserManagement(),
          fetchGames(),
          fetchTransactions(),
        ]);
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      }
    };

    initializeData();

    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      initializeDashboard();
    }, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  // Handle time range change
  // const handleTimeRangeChange = (newRange) => {
  //   setTimeRange(newRange);
  //   setFilters({ dateRange: newRange });
  //   setAnchorEl(null);
  // };

  // Handle game actions
  const handlePauseGame = async (gameId) => {
    try {
      await updateGameStatus(gameId, "paused");
    } catch (error) {
      console.error("Failed to pause game:", error);
    }
  };

  const handleResumeGame = async (gameId) => {
    try {
      await updateGameStatus(gameId, "playing");
    } catch (error) {
      console.error("Failed to resume game:", error);
    }
  };

  const handleEndGame = async (gameId) => {
    try {
      await updateGameStatus(gameId, "finished");
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  // Handle transaction actions
  const handleApproveTransaction = async (transactionId) => {
    try {
      await updateTransactionStatus(transactionId, "completed");
    } catch (error) {
      console.error("Failed to approve transaction:", error);
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    try {
      await updateTransactionStatus(transactionId, "rejected");
    } catch (error) {
      console.error("Failed to reject transaction:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Check for any errors
  const hasErrors =
    adminErrors.dashboard ||
    adminErrors.charts ||
    adminErrors.realTime ||
    userErrors.users ||
    gameErrors.games ||
    transactionErrors.transactions;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <h1
                className="mb-2 text-4xl font-extrabold"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ludo Admin
              </h1>
              <p className="text-lg text-gray-600">Game Management Dashboard</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => initializeDashboard()}
                disabled={adminLoading.dashboard}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>

              {/* <div className="relative">
                <button
                  onClick={() => setAnchorEl(!anchorEl)}
                  className="flex items-center gap-2 rounded-xl border border-blue-300 px-6 py-3 font-semibold text-blue-600 transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  <Calendar className="h-5 w-5" />
                  {timeRange === "week"
                    ? "This Week"
                    : timeRange === "month"
                    ? "This Month"
                    : "This Year"}
                </button>

                {anchorEl && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                    <button
                      onClick={() => handleTimeRangeChange("week")}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => handleTimeRangeChange("month")}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => handleTimeRangeChange("year")}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      This Year
                    </button>
                  </div>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* Error Alerts */}
        {hasErrors && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">
                There was an error loading dashboard data. Please refresh to try
                again.
              </p>
              <button
                onClick={clearErrors}
                className="text-red-600 hover:text-red-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Stats Cards */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 sm:text-left">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={dashboardStats.totalUsers?.toLocaleString() || "0"}
              icon={<Users className="h-7 w-7" />}
              color="#667eea"
              trend="up"
              trendValue="+12% from last month"
              loading={adminLoading.dashboard}
            />

            <StatCard
              title="Active Games"
              value={gameStats.activeGames || "0"}
              icon={<Gamepad2 className="h-7 w-7" />}
              color="#764ba2"
              trend="up"
              trendValue="+8% from last week"
              loading={gameLoading.games}
            />

            <StatCard
              title="Total Revenue"
              value={formatCurrency(dashboardStats.totalRevenue || 0)}
              icon={<DollarSign className="h-7 w-7" />}
              color="#f093fb"
              trend="up"
              trendValue="+15.3% from last month"
              loading={adminLoading.dashboard}
            />

            <StatCard
              title="Online Users"
              value={realTimeData.onlineUsers || "0"}
              icon={<TrendingUp className="h-7 w-7" />}
              color="#4facfe"
              trend="up"
              trendValue="+5% from last hour"
              loading={adminLoading.realTime}
            />
          </div>
        </div>

        {/* Charts and Real-time Data */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-left">
            Analytics & Insights
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h3
                    className="text-xl font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Revenue & User Growth
                  </h3>
                  <div className="flex gap-2">
                    <span className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm font-semibold text-white">
                      Revenue
                    </span>
                    <span className="rounded-xl border border-blue-500 px-3 py-1 text-sm font-semibold text-blue-600">
                      Users
                    </span>
                  </div>
                </div>

                {adminLoading.charts ? (
                  <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.revenueData || []}>
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#1976d2"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#1976d2"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorUsers"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#2e7d32"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2e7d32"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#1976d2"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          name="Revenue (ETB)"
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="#2e7d32"
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                          name="New Users"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Activities */}
            <div>
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl">
                <h3
                  className="mb-6 text-xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Recent Activities
                </h3>

                {adminLoading.dashboard ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200" />
                          <div className="h-3 w-2/5 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-auto">
                    {realTimeData.recentTransactions?.map((activity, index) => (
                      <ActivityCard key={index} {...activity} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Management and Transaction Sections */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Active Games */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Active Games
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  {activeGames.length} Active
                </span>
              </div>

              {gameLoading.games ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : activeGames.length > 0 ? (
                activeGames.map((game) => (
                  <ActiveGameCard
                    key={game.id}
                    game={{
                      ...game,
                      gameType: game.gameType || "classic",
                      status: game.status || "playing",
                    }}
                    onPause={handlePauseGame}
                    onResume={handleResumeGame}
                    onEnd={handleEndGame}
                  />
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-600">No active games at the moment</p>
                </div>
              )}
            </div>

            {/* Pending Transactions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Pending Transactions
                </h3>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {pendingTransactions.length} Pending
                </span>
              </div>

              {transactionLoading.transactions ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : pendingTransactions.length > 0 ? (
                <div className="space-y-4">
                  {pendingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {transaction.user} - {transaction.type}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-yellow-600">
                            {transaction.amount}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.time}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproveTransaction(transaction.id)
                            }
                            disabled={transactionLoading.transactions}
                            className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleRejectTransaction(transaction.id)
                            }
                            disabled={transactionLoading.transactions}
                            className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-600">No pending transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Platform Performance
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      User Engagement
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      85%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Game Completion Rate
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      92%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: "92%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Player Retention
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      78%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Game Distribution */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <h3
                className="mb-6 text-xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Game Type Distribution
              </h3>

              {gameLoading.games ? (
                <div className="flex h-80 items-center justify-center">
                  <div className="h-48 w-48 animate-pulse rounded-full bg-gray-200" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.gameStatsData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="games"
                      >
                        {chartData.gameStatsData?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.color ||
                              `#${Math.floor(Math.random() * 16777215).toString(
                                16
                              )}`
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-6">
                {chartData.gameStatsData?.map((entry) => (
                  <div key={entry.gameType} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          entry.color ||
                          `#${Math.floor(Math.random() * 16777215).toString(
                            16
                          )}`,
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.gameType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        {/* <div className="mt-16 text-center">
          <p className="text-sm font-medium text-gray-500 tracking-wide">
            © 2024 Ludo Game Admin Dashboard • Built with React & Lucide React
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
