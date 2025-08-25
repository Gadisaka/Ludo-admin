import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Timer,
  Users,
  Gamepad2,
  DollarSign,
  User,
  Bot,
} from "lucide-react";
import { useGameStore } from "../Store";
import { API_URL } from "../../constants";

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [open, setOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    gameType: "all",
    status: "all",
    dateRange: "all",
    search: "",
    hasBots: "all",
  });

  // Get data from game store
  const { games, loading, errors, fetchGames } = useGameStore();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Pagination calculations
  const totalPages = Math.ceil(games.length / itemsPerPage);

  // Filter games based on selected criteria
  const filteredGames = games.filter((game) => {
    // Game type filter
    if (
      filters.gameType !== "all" &&
      game.requiredPieces !== parseInt(filters.gameType)
    ) {
      return false;
    }

    // Status filter
    if (filters.status !== "all" && game.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const gameDate = new Date(game.createdAt);
      const now = new Date();
      const diffInDays = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case "today":
          if (diffInDays > 0) return false;
          break;
        case "week":
          if (diffInDays > 7) return false;
          break;
        case "month":
          if (diffInDays > 30) return false;
          break;
        default:
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const gameId = game._id?.toLowerCase() || "";
      const hasMatch = gameId.includes(searchTerm);

      // Also search in players if available
      if (Array.isArray(game.players)) {
        const playerMatch = game.players.some((player) =>
          (player.username || player.name || "")
            .toLowerCase()
            .includes(searchTerm)
        );
        if (hasMatch || playerMatch) return true;
      }

      return hasMatch;
    }

    // Bot filter
    if (filters.hasBots !== "all") {
      const botCount = getBotCount(game.players);
      if (filters.hasBots === "withBots" && botCount === 0) return false;
      if (filters.hasBots === "noBots" && botCount > 0) return false;
    }

    return true;
  });

  // Update pagination for filtered results
  const totalFilteredPages = Math.ceil(filteredGames.length / itemsPerPage);
  const filteredStartIndex = (currentPage - 1) * itemsPerPage;
  const filteredEndIndex = filteredStartIndex + itemsPerPage;
  const currentFilteredGames = filteredGames.slice(
    filteredStartIndex,
    filteredEndIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Page navigation functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRowClick = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "playing":
        return "bg-green-100 text-green-800";
      case "finished":
        return "bg-blue-100 text-blue-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const getGameTypeLabel = (requiredPieces) => {
    return `Kings ${requiredPieces}`;
  };

  // Helper function to check if a player is a bot
  const isBot = (player) => {
    return (
      player.isBot === true ||
      player.username?.toLowerCase().includes("bot") ||
      player.name?.toLowerCase().includes("bot") ||
      player.username?.toLowerCase().includes("ai") ||
      player.name?.toLowerCase().includes("ai") ||
      player.username?.toLowerCase().includes("computer") ||
      player.name?.toLowerCase().includes("computer") ||
      player.username?.toLowerCase().includes("auto") ||
      player.name?.toLowerCase().includes("auto")
    );
  };

  // Helper function to count bots in a game
  const getBotCount = (players) => {
    if (!Array.isArray(players)) return 0;
    return players.filter(isBot).length;
  };

  if (loading.games) {
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

  if (errors.games) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading games: {errors.games}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Game ID or Player name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              <option value="1">Kings 1</option>
              <option value="2">Kings 2</option>
              <option value="3">Kings 3</option>
              <option value="4">Kings 4</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
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
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Range
            </label>
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Bot Filter */}
          <div>
            <label
              htmlFor="hasBots"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bot Players
            </label>
            <select
              id="hasBots"
              value={filters.hasBots}
              onChange={(e) =>
                setFilters({ ...filters, hasBots: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Games</option>
              <option value="withBots">With Bots</option>
              <option value="noBots">No Bots</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() =>
              setFilters({
                gameType: "all",
                status: "all",
                dateRange: "all",
                search: "",
                hasBots: "all",
              })
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Page Size Selector */}
      <div className="mb-4 flex items-center justify-between">
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
              setCurrentPage(1); // Reset to first page when changing page size
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
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium">{filteredGames.length}</span>{" "}
          games
          {filters.gameType !== "all" ||
          filters.status !== "all" ||
          filters.dateRange !== "all" ||
          filters.hasBots !== "all" ||
          filters.search ? (
            <span className="text-blue-600 ml-2">(filtered)</span>
          ) : null}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Players</span>
                  <Bot
                    className="w-3 h-3 ml-1 text-gray-400"
                    title="Bot indicator"
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prize Pool
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFilteredGames.map((game) => (
              <tr
                key={game._id}
                onClick={() => handleRowClick(game)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {game._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    {getGameTypeLabel(game.requiredPieces)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="mr-2">
                      {Array.isArray(game.players) ? game.players.length : 0}
                    </span>
                    {Array.isArray(game.players) &&
                      getBotCount(game.players) > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Bot className="w-3 h-3 mr-1 text-green-500" />
                          {/* {getBotCount(game.players)} */}
                        </div>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      game.status
                    )}`}
                  >
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(game.stake || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(game.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalFilteredPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
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
              disabled={currentPage === totalFilteredPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{filteredStartIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(filteredEndIndex, filteredGames.length)}
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
                {Array.from({ length: totalFilteredPages }, (_, index) => {
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
                  disabled={currentPage === totalFilteredPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Game Detail Dialog */}
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Game Details
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedGame && (
              <div className="space-y-4">
                {/* Game Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {getGameTypeLabel(selectedGame.requiredPieces)}
                    </h4>
                    <p className="text-sm text-gray-500">{selectedGame._id}</p>
                  </div>
                </div>

                {/* Game Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Game Information
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedGame.status
                          )}`}
                        >
                          {selectedGame.status.charAt(0).toUpperCase() +
                            selectedGame.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Entry Fee</p>
                        <p className="font-medium">
                          {formatCurrency(selectedGame.stake || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Prize Pool</p>
                        <p className="font-medium">
                          {formatCurrency(
                            (selectedGame.stake || 0) *
                              (Array.isArray(selectedGame.players)
                                ? selectedGame.players.length
                                : 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {selectedGame.createdAt && selectedGame.updatedAt
                            ? `${Math.round(
                                (new Date(selectedGame.updatedAt) -
                                  new Date(selectedGame.createdAt)) /
                                  1000
                              )} seconds`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Winner</p>
                        <p className="font-medium">
                          {selectedGame.winnerId || "Game in progress"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bots</p>
                        <p className="font-medium">
                          {Array.isArray(selectedGame.players)
                            ? getBotCount(selectedGame.players)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Players Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Players
                    </h5>
                    {Array.isArray(selectedGame.players) ? (
                      selectedGame.players.map((player, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                  {player.username ||
                                    player.name ||
                                    `Player ${index + 1}`}
                                  {selectedGame.winnerId ===
                                    (player.id || player.userId) && (
                                    <Trophy className="inline w-4 h-4 ml-2 text-yellow-500" />
                                  )}
                                </p>
                                {isBot(player) && (
                                  <Bot
                                    className="w-4 h-4 text-blue-500"
                                    title="Bot Player"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                Position: {index + 1}
                                {isBot(player) && (
                                  <span className="ml-2 text-blue-600 font-medium">
                                    (Bot)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No players data available</p>
                    )}
                  </div>
                </div>

                {/* Game Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">
                    Game Timeline
                  </h5>
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      Started:{" "}
                      {selectedGame.createdAt
                        ? new Date(selectedGame.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                    {selectedGame.status === "finished" && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-gray-700">
                          Completed:{" "}
                          {selectedGame.updatedAt
                            ? new Date(selectedGame.updatedAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
