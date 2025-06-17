import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowUpward as WithdrawIcon,
  ArrowDownward as DepositIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

const data = [
  {
    id: "TRX001",
    username: "Fistum",
    type: "deposit",
    amount: 100,
    status: "completed",
    date: "2024-03-15 14:30",
    method: "telebirr",
    transactionFee: 2.5,
    balance: 1250,
    reference: "DEP-2024-001",
    notes: "Initial deposit",
  },
  {
    id: "TRX002",
    username: "Nahom",
    type: "withdrawal",
    amount: 50,
    status: "pending",
    date: "2024-03-15 15:45",
    method: "CBE Birr",
    transactionFee: 1.5,
    balance: 850,
    reference: "WD-2024-001",
    notes: " withdrawal",
  },
  {
    id: "TRX003",
    username: "sami_king",
    type: "deposit",
    amount: 200,
    status: "completed",
    date: "2024-03-15 16:20",
    method: "telebirr",
    transactionFee: 5,
    balance: 2100,
    reference: "DEP-2024-002",
    notes: "Tournament entry",
  },
  {
    id: "TRX004",
    username: "kidus",
    type: "withdrawal",
    amount: 75,
    status: "failed",
    date: "2024-03-15 17:10",
    method: "telebirr",
    transactionFee: 1.5,
    balance: 320,
    reference: "WD-2024-002",
    notes: "Insufficient funds",
  },
];

const Transactions = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((transaction) => (
              <TableRow
                key={transaction.id}
                onClick={() => handleRowClick(transaction)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.username}</TableCell>
                <TableCell>
                  <Chip
                    icon={
                      transaction.type === "deposit" ? (
                        <DepositIcon />
                      ) : (
                        <WithdrawIcon />
                      )
                    }
                    label={
                      transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)
                    }
                    color={transaction.type === "deposit" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      transaction.type === "deposit"
                        ? "success.main"
                        : "error.main",
                  }}
                >
                  {transaction.type === "deposit" ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)
                    }
                    color={getStatusColor(transaction.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Transaction Detail Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedTransaction && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Transaction Details</Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  {/* Transaction Header */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            selectedTransaction.type === "deposit"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {selectedTransaction.type === "deposit" ? (
                          <DepositIcon />
                        ) : (
                          <WithdrawIcon />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="h5">
                          {selectedTransaction.type.charAt(0).toUpperCase() +
                            selectedTransaction.type.slice(1)}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                          {selectedTransaction.reference}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Transaction Details */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Transaction Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              selectedTransaction.type === "deposit"
                                ? "success.main"
                                : "error.main"
                            }
                          >
                            {selectedTransaction.type === "deposit" ? "+" : "-"}
                            {formatAmount(selectedTransaction.amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Fee
                          </Typography>
                          <Typography variant="body1">
                            {formatAmount(selectedTransaction.transactionFee)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Method
                          </Typography>
                          <Typography variant="body1">
                            {selectedTransaction.method}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              selectedTransaction.status
                                .charAt(0)
                                .toUpperCase() +
                              selectedTransaction.status.slice(1)
                            }
                            color={getStatusColor(selectedTransaction.status)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Account Information */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Account Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Username
                          </Typography>
                          <Typography variant="body1">
                            {selectedTransaction.username}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Current Balance
                          </Typography>
                          <Typography variant="body1">
                            {formatAmount(selectedTransaction.balance)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Date & Time
                          </Typography>
                          <Typography variant="body1">
                            {selectedTransaction.date}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Notes */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedTransaction.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Transactions;
