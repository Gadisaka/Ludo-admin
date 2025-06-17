import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  SportsEsports as GamesIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Enhanced mock data
const revenueData = [
  { name: "Jan", revenue: 4000, users: 24 },
  { name: "Feb", revenue: 3000, users: 13 },
  { name: "Mar", revenue: 5000, users: 38 },
  { name: "Apr", revenue: 4500, users: 43 },
  { name: "May", revenue: 6000, users: 52 },
  { name: "Jun", revenue: 5500, users: 48 },
];

const gameDistributionData = [
  { name: "1 ባነገሰ", value: 45, color: "#0088FE" },
  { name: "2 ባነገሰ", value: 30, color: "#00C49F" },
  { name: "3 ባነገሰ", value: 25, color: "#FFBB28" },
];

const recentActivities = [
  {
    user: "Abel",
    action: "Won Tournament",
    amount: "500 birr",
    time: "2h ago",
  },
  {
    user: "Naol",
    action: "Deposited",
    amount: "100 birr",
    time: "4h ago",
  },
  { user: "sami", action: "withdrew", amount: "-200 birr", time: "5h ago" },
];

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <Card
    sx={{
      height: "100%",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 3,
      },
    }}
  >
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {trend === "up" ? (
              <ArrowUpwardIcon sx={{ color: "success.main", fontSize: 16 }} />
            ) : (
              <ArrowDownwardIcon sx={{ color: "error.main", fontSize: 16 }} />
            )}
            <Typography
              variant="body2"
              color={trend === "up" ? "success.main" : "error.main"}
            >
              {trendValue}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: "50%",
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ActivityCard = ({ user, action, amount, time }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>{user.charAt(0)}</Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2">{user}</Typography>
      <Typography variant="body2" color="textSecondary">
        {action}
      </Typography>
    </Box>
    <Box sx={{ textAlign: "right" }}>
      <Typography
        variant="subtitle2"
        color={amount === "-" ? "textSecondary" : "success.main"}
      >
        {amount}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {time}
      </Typography>
    </Box>
  </Box>
);

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeRange, setTimeRange] = useState("week");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Dashboard Overview</Typography>
        <Button
          variant="outlined"
          startIcon={<CalendarIcon />}
          onClick={handleMenuClick}
        >
          {timeRange === "week"
            ? "This Week"
            : timeRange === "month"
            ? "This Month"
            : "This Year"}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              setTimeRange("week");
              handleMenuClose();
            }}
          >
            This Week
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTimeRange("month");
              handleMenuClose();
            }}
          >
            This Month
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTimeRange("year");
              handleMenuClose();
            }}
          >
            This Year
          </MenuItem>
        </Menu>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Players"
            value="2,847"
            icon={<PeopleIcon sx={{ color: "#1976d2" }} />}
            color="#1976d2"
            trend="up"
            trendValue="12% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily Games"
            value="156"
            icon={<GamesIcon sx={{ color: "#2e7d32" }} />}
            color="#2e7d32"
            trend="up"
            trendValue="8% from last Week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value="12,450 Birr"
            icon={<MoneyIcon sx={{ color: "#ed6c02" }} />}
            color="#ed6c02"
            trend="up"
            trendValue="15.3% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Growth"
            value="+15.3%"
            icon={<TrendingUpIcon sx={{ color: "#9c27b0" }} />}
            color="#9c27b0"
            trend="up"
            trendValue="5% from last month"
          />
        </Grid>
      </Grid>

      {/* Charts and Activities */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Revenue Overview</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label="Revenue" color="primary" size="small" />
                <Chip label="Users" variant="outlined" size="small" />
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1976d2"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#2e7d32"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {recentActivities.map((activity, index) => (
                <ActivityCard key={index} {...activity} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Game Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Game Distribution</Typography>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gameDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gameDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              {gameDistributionData.map((entry) => (
                <Box
                  key={entry.name}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: entry.color,
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="body2">{entry.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Metrics
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">User Engagement</Typography>
                  <Typography variant="body2" color="primary">
                    85%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} />
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Game Completion Rate</Typography>
                  <Typography variant="body2" color="primary">
                    92%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} />
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Player Retention</Typography>
                  <Typography variant="body2" color="primary">
                    78%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
