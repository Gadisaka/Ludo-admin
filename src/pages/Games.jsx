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
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Casino as GameIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

const data = [
  {
    id: "GAME001",
    type: "1 ባነገሰ",
    status: "finished",
    players: [
      {
        username: "Abel",
        position: 1,
      },
      {
        username: "Nahom",
        position: 2,
      },
    ],
    startTime: "2024-03-15 14:30",
    duration: "200 seconds",
    entryFee: 50,
    prizePool: 100,
    currentTurn: "Abel",
    winner: "Abel",
  },
  {
    id: "GAME002",
    type: "2 ባነገሰ",
    status: "finished",
    players: [
      {
        username: "Firs",
        position: 1,
      },
      {
        username: "Fistum",
        position: 2,
      },
    ],
    startTime: "2024-03-15 13:00",
    duration: "250 seconds",
    entryFee: 20,
    prizePool: 40,
    currentTurn: null,
    winner: "Fistum",
  },
  {
    id: "GAME003",
    type: "3 ባነገሰ",
    status: "finished",
    players: [
      {
        username: "Nathan",
        position: 1,
      },
      {
        username: "Alazar",
        position: 2,
      },
    ],
    startTime: "2024-03-15 15:00",
    duration: "500 seconds",
    entryFee: 200,
    prizePool: 400,
    winner: "Alazar",
  },
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount) => {
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
              <TableCell>Game ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prize Pool</TableCell>
              <TableCell>Start Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((game) => (
              <TableRow
                key={game.id}
                onClick={() => handleRowClick(game)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>{game.id}</TableCell>
                <TableCell>
                  <Chip
                    icon={<GameIcon />}
                    label={game.type}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon fontSize="small" />
                    {game.players.length}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      game.status.charAt(0).toUpperCase() + game.status.slice(1)
                    }
                    color={getStatusColor(game.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatCurrency(game.prizePool)}</TableCell>
                <TableCell>{game.startTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Game Detail Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedGame && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Game Details</Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  {/* Game Header */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <GameIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h5">
                          {selectedGame.type}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                          {selectedGame.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Game Stats */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Game Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Status
                          </Typography>
                          <Chip
                            label={
                              selectedGame.status.charAt(0).toUpperCase() +
                              selectedGame.status.slice(1)
                            }
                            color={getStatusColor(selectedGame.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Entry Fee
                          </Typography>
                          <Typography variant="body1">
                            {formatCurrency(selectedGame.entryFee)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Prize Pool
                          </Typography>
                          <Typography variant="body1">
                            {formatCurrency(selectedGame.prizePool)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Duration
                          </Typography>
                          <Typography variant="body1">
                            {selectedGame.duration}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Current Turn
                          </Typography>
                          <Typography variant="body1">
                            {selectedGame.currentTurn || "Game Completed"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Players Section */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Players
                      </Typography>
                      {selectedGame.players.map((player) => (
                        <Box key={player.username} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 1,
                            }}
                          >
                            <Avatar src={player.avatar} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1">
                                {player.username}
                                {selectedGame.winner === player.username && (
                                  <TrophyIcon sx={{ ml: 1, color: "gold" }} />
                                )}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Position: {player.position}
                              </Typography>
                            </Box>
                            <Typography variant="h6">{player.score}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(player.score / 100) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Paper>
                  </Grid>

                  {/* Game Timeline */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Game Timeline
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <TimerIcon color="primary" />
                        <Typography variant="body1">
                          Started: {selectedGame.startTime}
                        </Typography>
                        {selectedGame.status === "completed" && (
                          <>
                            <Typography variant="body1">→</Typography>
                            <Typography variant="body1">
                              Completed: {selectedGame.startTime.split(" ")[0]}{" "}
                              {selectedGame.duration}
                            </Typography>
                          </>
                        )}
                      </Box>
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

export default Games;
