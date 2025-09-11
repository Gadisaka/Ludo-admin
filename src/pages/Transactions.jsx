import React, { useState, useEffect } from "react";
import {
  X,
  ArrowUp,
  ArrowDown,
  Wallet,
  Receipt,
  Search,
  Filter,
  Edit,
  Save,
  XCircle,
} from "lucide-react";
import { useTransactionStore, useBankStore } from "../Store";
import { API_URL } from "../../constants";

const Transactions = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [open, setOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all",
    search: "",
  });

  // Get data from stores
  const { transactions, loading, errors, fetchTransactions } =
    useTransactionStore();

  const {
    banks,
    bankForm,
    editingBank,
    loading: bankLoading,
    errors: bankErrors,
    fetchBanks,
    updateBankDetails,
    editBank,
    cancelEdit,
    setBankForm,
  } = useBankStore();

  useEffect(() => {
    fetchTransactions();
    fetchBanks();
  }, [fetchTransactions, fetchBanks]);

  // Handle bank edit
  const handleEditBank = (bank) => {
    editBank(bank);
  };

  // Handle bank save
  const handleSaveBank = async (bankId) => {
    const result = await updateBankDetails(bankId, bankForm);
    if (!result.success) {
      console.error("Failed to update bank:", result.error);
    }
  };

  // Handle bank cancel
  const handleCancelEdit = () => {
    cancelEdit();
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Filter transactions based on selected criteria
  const filteredTransactions = transactions.filter((transaction) => {
    // Only show DEPOSIT and WITHDRAW transactions (check original database values)
    const originalType = transaction.originalType;
    if (originalType !== "DEPOSIT" && originalType !== "WITHDRAW") {
      return false;
    }

    // Type filter - use the transformed values from the store
    if (filters.type !== "all") {
      if (filters.type === "deposit" && transaction.type !== "deposit") {
        return false;
      }
      if (filters.type === "withdrawal" && transaction.type !== "withdrawal") {
        return false;
      }
    }

    // Status filter - normalize case for comparison
    const normalizedStatus = transaction.status?.toLowerCase();
    if (filters.status !== "all" && normalizedStatus !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const diffInDays = Math.floor(
        (now - transactionDate) / (1000 * 60 * 60 * 24)
      );

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
      const transactionId = transaction._id?.toLowerCase() || "";
      const username = transaction.username?.toLowerCase() || "";
      const reference = transaction.reference?.toLowerCase() || "";

      return (
        transactionId.includes(searchTerm) ||
        username.includes(searchTerm) ||
        reference.includes(searchTerm)
      );
    }

    return true;
  });

  // Pagination calculations
  const totalFilteredPages = Math.ceil(
    filteredTransactions.length / itemsPerPage
  );
  const filteredStartIndex = (currentPage - 1) * itemsPerPage;
  const filteredEndIndex = filteredStartIndex + itemsPerPage;
  const currentFilteredTransactions = filteredTransactions.slice(
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
    if (currentPage < totalFilteredPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  if (loading.transactions) {
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

  if (errors.transactions) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            Error loading transactions: {errors.transactions}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Bank Management Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Bank Management
        </h3>

        {bankErrors.bankAction && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{bankErrors.bankAction}</p>
          </div>
        )}

        {bankLoading.banks && !banks.length ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {banks.map((bank) => (
              <div
                key={bank._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bank Name (Constant) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md">
                      {bank.bankName}
                    </p>
                  </div>

                  {/* Bank Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Number
                    </label>
                    {editingBank === bank._id ? (
                      <input
                        type="text"
                        value={bankForm.number}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, number: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter bank number"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-medium">
                        {bank.number}
                      </p>
                    )}
                  </div>

                  {/* Account Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Full Name
                    </label>
                    {editingBank === bank._id ? (
                      <input
                        type="text"
                        value={bankForm.accountFullName}
                        onChange={(e) =>
                          setBankForm({
                            ...bankForm,
                            accountFullName: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter account full name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-medium">
                        {bank.accountFullName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-4 flex space-x-2">
                  {editingBank === bank._id ? (
                    <>
                      <button
                        onClick={() => handleSaveBank(bank._id)}
                        disabled={bankLoading.bankAction}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {bankLoading.bankAction ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={bankLoading.bankAction}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditBank(bank)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              placeholder="Transaction ID, Username, or Reference..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type
            </label>
            <select
              id="type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
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
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() =>
              setFilters({
                type: "all",
                status: "all",
                dateRange: "all",
                search: "",
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
        <div className="text-sm text-gray-500">
          Total:{" "}
          <span className="font-medium">{filteredTransactions.length}</span>{" "}
          transactions
          {filters.type !== "all" ||
          filters.status !== "all" ||
          filters.dateRange !== "all" ||
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
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFilteredTransactions.map((transaction) => (
              <tr
                key={transaction._id}
                onClick={() => handleRowClick(transaction)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === "deposit"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.type === "deposit" ? (
                      <ArrowDown className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowUp className="w-4 h-4 mr-1" />
                    )}
                    {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === "deposit"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "deposit" ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.createdAt
                    ? new Date(transaction.createdAt).toLocaleString()
                    : "N/A"}
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
                  {Math.min(filteredEndIndex, filteredTransactions.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredTransactions.length}
                </span>{" "}
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

      {/* Transaction Detail Dialog */}
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction Details
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedTransaction && (
              <div className="space-y-4">
                {/* Transaction Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedTransaction.type === "deposit"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedTransaction.type === "deposit" ? (
                      <ArrowDown className="w-6 h-6 text-white" />
                    ) : (
                      <ArrowUp className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedTransaction.type === "deposit"
                        ? "Deposit"
                        : "Withdrawal"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedTransaction.reference || selectedTransaction._id}
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Transaction Information
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p
                          className={`font-medium ${
                            selectedTransaction.type === "deposit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedTransaction.type === "deposit" ? "+" : "-"}
                          {formatAmount(selectedTransaction.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fee</p>
                        <p className="font-medium">
                          {formatAmount(
                            selectedTransaction.transactionFee || 0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Method</p>
                        <p className="font-medium">
                          {selectedTransaction.method || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedTransaction.status
                          )}`}
                        >
                          {selectedTransaction.status.charAt(0).toUpperCase() +
                            selectedTransaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Account Information
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500">Username</p>
                        <p className="font-medium">
                          {selectedTransaction.username}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Balance</p>
                        <p className="font-medium">
                          {formatAmount(selectedTransaction.balance || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date & Time</p>
                        <p className="font-medium">
                          {selectedTransaction.createdAt
                            ? new Date(
                                selectedTransaction.createdAt
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Notes</h5>
                    <p className="text-sm text-gray-700">
                      {selectedTransaction.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
