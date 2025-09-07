import React, { useState, useEffect } from "react";
import {
  Bot,
  Gamepad2,
  Users,
  Trophy,
  Clock,
  DollarSign,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Power,
  PowerOff,
} from "lucide-react";
import { API_URL } from "../../constants";
import { useBotSettingsStore } from "../Store";

const Bots = () => {
  const [botGames, setBotGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    gameType: "all",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bot settings store
  const {
    botsEnabled,
    loading: botSettingsLoading,
    saving: botSettingsSaving,
    error: botSettingsError,
    fetchBotSettings,
    toggleBotsEnabled,
  } = useBotSettingsStore();

  useEffect(() => {
    fetchBotGames();
    fetchBotSettings();
  }, [fetchBotSettings]);

  const fetchBotGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${API_URL}/admin/games`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Filter games that have bot players
      const gamesWithBots = data.games.filter(
        (game) =>
          game.players && game.players.some((player) => player.isBot === true)
      );

      setBotGames(gamesWithBots);
    } catch (err) {
      console.error("Error fetching bot games:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter games based on search and status
  const filteredGames = botGames.filter((game) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const hasMatch = game.players?.some(
        (player) =>
          player.username?.toLowerCase().includes(searchTerm) ||
          player.userId?.toLowerCase().includes(searchTerm)
      );
      if (!hasMatch) return false;
    }

    // Status filter
    if (filters.status !== "all" && game.status !== filters.status) {
      return false;
    }

    // Game type filter
    if (
      filters.gameType !== "all" &&
      game.requiredPieces?.toString() !== filters.gameType
    ) {
      return false;
    }

    return true;
  });

  const getGameTypeLabel = (requiredPieces) => {
    const types = {
      1: "1 King",
      2: "2 Kings",
      3: "3 Kings",
      4: "4 Kings",
    };
    return types[requiredPieces] || "Unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      playing: "bg-blue-100 text-blue-800",
      finished: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      waiting: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate comprehensive bot analysis
  const calculateBotAnalysis = () => {
    const analysis = {
      totalGames: botGames.length,
      gamesWon: 0,
      gamesLost: 0,
      moneyWon: 0,
      moneyLost: 0,
      totalStake: 0,
      netProfit: 0,
      accuracy: 0,
      profitable: false,
    };

    botGames.forEach((game) => {
      const totalStake = game.stake || 0;
      analysis.totalStake += totalStake;

      if (game.status === "finished" && game.winnerId) {
        // Check if winner is a bot
        const winner = game.players?.find((p) => p.userId === game.winnerId);
        const isBotWinner = winner?.isBot || game.winnerId.startsWith("bot_");

        if (isBotWinner) {
          analysis.gamesWon++;
          analysis.moneyWon += totalStake;
        } else {
          analysis.gamesLost++;
          analysis.moneyLost += totalStake;
        }
      }
    });

    analysis.netProfit = analysis.moneyWon - analysis.moneyLost;
    analysis.accuracy =
      analysis.totalGames > 0
        ? ((analysis.gamesWon / analysis.totalGames) * 100).toFixed(1)
        : 0;
    analysis.profitable = analysis.netProfit > 0;

    return analysis;
  };

  // Get winner display name
  const getWinnerDisplay = (game) => {
    if (!game.winnerId) return "No Winner";

    const winner = game.players?.find((p) => p.userId === game.winnerId);
    if (winner?.isBot || game.winnerId.startsWith("bot_")) {
      return `Bot (${game.winnerId})`;
    } else {
      return "Human";
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Page navigation functions
  const goToPage = (page) => setCurrentPage(page);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading bot games: {error}</p>
          <button
            onClick={fetchBotGames}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bot Games</h1>
            <p className="text-sm text-gray-600">Games with bot players</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBotGames}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh
          </button>
        </div>
      </div>

      {/* Bot Control Toggle */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                botsEnabled ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {botsEnabled ? (
                <Power className="w-6 h-6 text-green-600" />
              ) : (
                <PowerOff className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Bot Control
              </h3>
              <p className="text-sm text-gray-600">
                {botsEnabled
                  ? "Bots are currently enabled and can join games"
                  : "Bots are currently disabled and cannot join games"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span
                className={`text-sm font-medium mr-3 ${
                  botsEnabled ? "text-green-600" : "text-red-600"
                }`}
              >
                {botsEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={toggleBotsEnabled}
                disabled={botSettingsSaving || botSettingsLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  botsEnabled ? "bg-green-600" : "bg-gray-200"
                } ${
                  botSettingsSaving || botSettingsLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    botsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {botSettingsError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{botSettingsError}</p>
          </div>
        )}
      </div>

      {/* Comprehensive Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateBotAnalysis().totalGames}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games Won</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateBotAnalysis().gamesWon}
              </p>
              <p className="text-xs text-gray-500">
                Lost: {calculateBotAnalysis().gamesLost}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p
                className={`text-2xl font-bold ${
                  calculateBotAnalysis().profitable
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${calculateBotAnalysis().netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Won: ${calculateBotAnalysis().moneyWon.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateBotAnalysis().accuracy}%
              </p>
              <p
                className={`text-xs font-medium ${
                  calculateBotAnalysis().profitable
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {calculateBotAnalysis().profitable
                  ? "Profitable"
                  : "Not Profitable"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stakes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${calculateBotAnalysis().totalStake.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Money Lost</p>
              <p className="text-2xl font-bold text-gray-900">
                ${calculateBotAnalysis().moneyLost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Players
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by username or ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Game Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="playing">Playing</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Game Type Filter */}
          <div>
            <label
              htmlFor="gameType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Game Type
            </label>
            <select
              id="gameType"
              value={filters.gameType}
              onChange={(e) =>
                setFilters({ ...filters, gameType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="1">1 King</option>
              <option value="2">2 Kings</option>
              <option value="3">3 Kings</option>
              <option value="4">4 Kings</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() =>
              setFilters({ search: "", status: "all", gameType: "all" })
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count and Page Size */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{filteredGames.length}</span> of{" "}
          <span className="font-medium">{botGames.length}</span> bot games
          {filters.search ||
          filters.status !== "all" ||
          filters.gameType !== "all" ? (
            <span className="text-blue-600 ml-2">(filtered)</span>
          ) : null}
        </div>

        <div className="flex items-center space-x-4">
          <label
            htmlFor="pageSize"
            className="text-sm font-medium text-gray-700"
          >
            Show:
          </label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">entries per page</span>
        </div>
      </div>

      {/* Bot Games Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bot games found</p>
            <p className="text-gray-400 text-sm">
              {botGames.length === 0
                ? "No games with bot players in the system"
                : "No games match the current filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Players
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stake
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentGames.map((game) => (
                  <tr key={game._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getGameTypeLabel(game.requiredPieces)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Room: {game.roomId || "N/A"}
                        </p>
                        {game.winnerId && (
                          <p className="text-xs text-green-600 font-medium">
                            Winner: {getWinnerDisplay(game)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {game.players?.map((player, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                player.isBot
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {player.isBot ? (
                                <>
                                  <Bot className="w-3 h-3 mr-1" />
                                  Bot
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  Player
                                </>
                              )}
                            </span>
                            <span className="text-sm text-gray-900">
                              {player.username ||
                                player.userId ||
                                player.id ||
                                "Unknown"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          game.status
                        )}`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${(game.stake || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(game.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredGames.length)}
                </span>{" "}
                of <span className="font-medium">{filteredGames.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bots;
