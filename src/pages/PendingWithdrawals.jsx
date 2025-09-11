import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
  FaUser,
  FaCreditCard,
} from "react-icons/fa";
import useTransactionStore from "../Store/transactionStore";

const PendingWithdrawals = () => {
  const {
    pendingWithdrawals,
    loading,
    errors,
    fetchPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
  } = useTransactionStore();

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [fetchPendingWithdrawals]);

  const handleApprove = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      await approveWithdrawal(transactionId);
      alert("Withdrawal approved successfully!");
    } catch (error) {
      alert(`Error approving withdrawal: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      await rejectWithdrawal(transactionId, rejectReason);
      alert("Withdrawal rejected successfully!");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      alert(`Error rejecting withdrawal: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedWithdrawal(null);
    setRejectReason("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return `${parseFloat(amount).toFixed(2)} ብር`;
  };

  if (loading.pendingWithdrawals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errors.pendingWithdrawals) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {errors.pendingWithdrawals}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Pending Withdrawals
        </h1>
        <button
          onClick={fetchPendingWithdrawals}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaClock className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <div className="flex items-center">
            <FaClock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {pendingWithdrawals.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4">
          <div className="flex items-center">
            <FaUser className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">
                {new Set(pendingWithdrawals.map((w) => w.userId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-100 border border-green-400 rounded-lg p-4">
          <div className="flex items-center">
            <FaCreditCard className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Total Amount</p>
              <p className="text-2xl font-bold text-green-900">
                {formatAmount(
                  pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {pendingWithdrawals.length === 0 ? (
          <div className="text-center py-8">
            <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No pending withdrawals</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {withdrawal.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(withdrawal.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {withdrawal.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.accountDetails}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(withdrawal._id)}
                          disabled={actionLoading === withdrawal._id}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 disabled:opacity-50"
                        >
                          {actionLoading === withdrawal._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FaCheck className="w-3 h-3" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(withdrawal)}
                          disabled={actionLoading === withdrawal._id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 disabled:opacity-50"
                        >
                          <FaTimes className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Withdrawal
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  User: {selectedWithdrawal?.username}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Amount: {formatAmount(selectedWithdrawal?.amount)}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Method: {selectedWithdrawal?.method}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedWithdrawal._id)}
                  disabled={actionLoading === selectedWithdrawal._id}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                >
                  {actionLoading === selectedWithdrawal._id
                    ? "Rejecting..."
                    : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingWithdrawals;
