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
  EmojiEvents as TrophyIcon,
  SportsEsports as GameIcon,
  AttachMoney as MoneyIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";

const data = [
  {
    id: 1,
    username: "john_doe",
    phone: "123-456-7890",
    isActive: true,
    avatar: "https://i.pravatar.cc/150?img=1",
    joinDate: "2024-01-15",
    totalGames: 156,
    gamesWon: 78,
    winRate: "50%",
    totalWinnings: 1250,
    lastActive: "2024-03-15",
    favoriteGame: "2 ባነገሰ",
    totalPlayTime: "45h 30m",
    status: "active",
  },
  {
    id: 2,
    username: "jane_smith",
    phone: "234-567-8901",
    isActive: false,
    avatar: "https://i.pravatar.cc/150?img=2",
    joinDate: "2024-02-01",
    totalGames: 89,
    gamesWon: 45,
    winRate: "50.6%",
    totalWinnings: 850,
    lastActive: "2024-03-10",
    favoriteGame: "1 ባነገሰ",
    totalPlayTime: "28h 15m",
    status: "inactive",
  },
  {
    id: 3,
    username: "alice_wonder",
    phone: "345-678-9012",
    isActive: true,
    avatar: "https://i.pravatar.cc/150?img=3",
    joinDate: "2024-01-20",
    totalGames: 234,
    gamesWon: 156,
    winRate: "66.7%",
    totalWinnings: 2100,
    lastActive: "2024-03-15",
    favoriteGame: "3 ባነገሰ",
    totalPlayTime: "78h 45m",
    status: "inactive",
  },
  {
    id: 4,
    username: "bob_builder",
    phone: "456-789-0123",
    isActive: false,
    avatar: "https://i.pravatar.cc/150?img=4",
    joinDate: "2024-02-15",
    totalGames: 45,
    gamesWon: 12,
    winRate: "26.7%",
    totalWinnings: 320,
    lastActive: "2024-03-05",
    favoriteGame: "2 ባነገሰ",
    totalPlayTime: "15h 20m",
    status: "active",
  },
  {
    id: 5,
    username: "charlie_brown",
    phone: "567-890-1234",
    isActive: true,
    avatar: "https://i.pravatar.cc/150?img=5",
    joinDate: "2024-01-10",
    totalGames: 189,
    gamesWon: 98,
    winRate: "51.9%",
    totalWinnings: 1680,
    lastActive: "2024-03-15",
    favoriteGame: "1 ባነገሰ",
    totalPlayTime: "62h 10m",
    status: "active",
  },
];

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => handleRowClick(user)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? "Active" : "Inactive"}
                    color={user.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Detail Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Player Details</Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  {/* Profile Section */}
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        // src={selectedUser.avatar}
                        sx={{ width: 120, height: 120, mb: 2 }}
                      />
                      <Typography variant="h5">
                        {selectedUser.username}
                      </Typography>
                      <Chip
                        label={selectedUser.status}
                        color={getStatusColor(selectedUser.status)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>

                  {/* Stats Section */}
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                          <GameIcon color="primary" />
                          <Typography variant="h6">
                            {selectedUser.totalGames}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Games
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                          <TrophyIcon color="primary" />
                          <Typography variant="h6">
                            {selectedUser.winRate}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Win Rate
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                          <MoneyIcon color="primary" />
                          <Typography variant="h6">
                            ${selectedUser.totalWinnings}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Winnings
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Additional Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Join Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedUser.joinDate}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Last Active
                        </Typography>
                        <Typography variant="body1">
                          {selectedUser.lastActive}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Favorite Game
                        </Typography>
                        <Typography variant="body1">
                          {selectedUser.favoriteGame}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Total Play Time
                        </Typography>
                        <Typography variant="body1">
                          {selectedUser.totalPlayTime}
                        </Typography>
                      </Grid>
                    </Grid>
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

export default Users;
