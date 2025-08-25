# Ludo Game Admin Dashboard

A modern, professional admin dashboard for managing the Ludo game platform built with React, Material-UI, and Zustand for state management.

## Features

### 🎯 Dashboard Overview

- **Real-time Statistics**: Live updates of user counts, active games, revenue, and online users
- **Interactive Charts**: Revenue trends, user growth, and game distribution visualizations
- **Performance Metrics**: User engagement, game completion rates, and player retention analytics

### 👥 User Management

- **User Statistics**: Total users, active users, banned users, and new user registrations
- **User Actions**: Ban/unban users, update user information, and delete accounts
- **User Search & Filters**: Advanced filtering by status, role, and date range

### 🎮 Game Management

- **Active Games Monitor**: Real-time view of all active games with player information
- **Game Controls**: Pause, resume, and end games as needed
- **Game Statistics**: Total games, completed games, and average game duration
- **Game Types**: Support for Classic, Tournament, Quick Play, and Team modes

### 💰 Transaction Management

- **Pending Transactions**: Monitor and approve/reject withdrawal requests
- **Transaction History**: Complete audit trail of all financial transactions
- **Financial Analytics**: Revenue tracking, transaction volumes, and pending amounts
- **Transaction Types**: Deposits, withdrawals, game winnings, bonuses, and refunds

## Technology Stack

- **Frontend**: React 19, Material-UI 7, Tailwind CSS
- **State Management**: Zustand with devtools
- **Charts**: Recharts for data visualization
- **Icons**: Material-UI Icons and React Icons
- **Build Tool**: Vite

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   └── Sidebar.jsx            # Navigation sidebar
│   ├── Store/                     # Zustand stores
│   │   ├── adminStore.js          # Main dashboard state
│   │   ├── userStore.js           # User management state
│   │   ├── gameStore.js           # Game management state
│   │   ├── transactionStore.js    # Transaction management state
│   │   └── index.js               # Store exports
│   ├── pages/                     # Page components
│   └── main.jsx                   # App entry point
├── package.json
└── README.md
```

## Zustand Stores

### Admin Store (`adminStore.js`)

Manages the main dashboard state including:

- Dashboard statistics and metrics
- Real-time data updates
- Chart data for visualizations
- Filter states and loading states

### User Store (`userStore.js`)

Handles user management operations:

- User data and statistics
- User actions (ban, unban, delete, update)
- User filtering and pagination
- Loading and error states

### Game Store (`gameStore.js`)

Manages game-related operations:

- Active games and game history
- Game statistics and metrics
- Game control actions (pause, resume, end)
- Game filtering and search

### Transaction Store (`transactionStore.js`)

Handles financial transactions:

- Transaction data and history
- Pending transaction management
- Transaction approval/rejection
- Financial analytics and reporting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd admin
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Store Usage Examples

### Using the Admin Store

```javascript
import { useAdminStore } from "../Store";

const Dashboard = () => {
  const { dashboardStats, realTimeData, loading, initializeDashboard } =
    useAdminStore();

  useEffect(() => {
    initializeDashboard();
  }, []);

  return (
    <div>
      <h1>Total Users: {dashboardStats.totalUsers}</h1>
      <p>Online Users: {realTimeData.onlineUsers}</p>
    </div>
  );
};
```

### Using the User Store

```javascript
import { useUserStore } from "../Store";

const UserManagement = () => {
  const { users, userStats, banUser, loading } = useUserStore();

  const handleBanUser = async (userId, reason) => {
    await banUser(userId, reason);
  };

  return (
    <div>
      <h1>Total Users: {userStats.totalUsers}</h1>
      {users.map((user) => (
        <div key={user.id}>
          {user.username} - {user.status}
          <button onClick={() => handleBanUser(user.id, "Violation")}>
            Ban User
          </button>
        </div>
      ))}
    </div>
  );
};
```

## API Integration

The stores currently use mock data for demonstration. To integrate with real APIs:

1. Replace the mock API calls in each store with actual API endpoints
2. Update the data structures to match your backend API responses
3. Add proper error handling and retry logic
4. Implement real-time updates using WebSockets or polling

### Example API Integration

```javascript
// In adminStore.js
fetchDashboardData: async () => {
  set({ loading: { ...get().loading, dashboard: true } });
  try {
    const response = await fetch("/api/admin/dashboard");
    const data = await response.json();
    set({ dashboardStats: data });
  } catch (error) {
    set({ errors: { ...get().errors, dashboard: error.message } });
  } finally {
    set({ loading: { ...get().loading, dashboard: false } });
  }
};
```

## Customization

### Theme Customization

The dashboard uses Material-UI theming. Customize colors, typography, and spacing in your theme configuration.

### Component Styling

All components use Material-UI's `sx` prop for styling, making them easy to customize and maintain.

### Adding New Features

1. Create new store files for additional functionality
2. Add new components to the components directory
3. Update the main Dashboard component to include new sections
4. Export new stores from the Store index file

## Performance Features

- **Lazy Loading**: Components load data only when needed
- **Real-time Updates**: Automatic refresh every 30 seconds
- **Optimized Rendering**: Efficient re-renders using Zustand
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error states and user feedback

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for new components (if applicable)
3. Add proper error handling and loading states
4. Test thoroughly before submitting changes
5. Update documentation for new features

## License

This project is part of the Ludo Game platform.

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
