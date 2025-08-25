# Store Update Summary - Admin Dashboard

## Overview

All Zustand stores in the admin dashboard have been updated to match the backend API structure and endpoints from the `ludo-backend` project.

## Backend API Structure

- **Base URL**: `http://localhost:4002`
- **Port**: 4002
- **Routes**: `/users`, `/games`, `/wallet`, `/auth`

## Store Updates Made

### 1. adminStore.js ✅

**Updated to use real backend endpoints:**

- `GET /users` - Fetch user count and statistics
- `GET /games` - Fetch game count and statistics
- `GET /wallet/transactions` - Fetch transaction data for revenue calculations

**Key Changes:**

- Replaced mock data with real API calls
- Added proper error handling and loading states
- Integrated with backend data models (User, GameHistory, Transaction)
- Calculates dashboard stats from real data

### 2. userStore.js ✅

**Updated to use real backend endpoints:**

- `GET /users` - Fetch all users
- `PUT /users/:id` - Update user (password change)
- `DELETE /users/:id` - Delete user

**Key Changes:**

- Replaced mock user data with real API calls
- Added user management actions (ban/unban simulation)
- Integrated with backend User model structure
- Added proper pagination and filtering

### 3. gameStore.js ✅

**Updated to use real backend endpoints:**

- `GET /games` - Fetch all games
- `GET /games/:id` - Fetch specific game (simulated)

**Key Changes:**

- Replaced mock game data with real API calls
- Integrated with backend GameHistory model
- Added game management actions (pause/resume/end simulation)
- Transforms backend data to match frontend expectations

### 4. transactionStore.js ✅

**Updated to use real backend endpoints:**

- `GET /wallet/transactions` - Fetch all transactions

**Key Changes:**

- Replaced mock transaction data with real API calls
- Integrated with backend Transaction model
- Added transaction management actions (approve/reject simulation)
- Calculates transaction statistics from real data

## Data Model Integration

### Backend Models Used:

1. **User Model**:

   - `_id`, `username`, `phone`, `role`, `isActive`, `createdAt`, `updatedAt`
   - `wallet` reference, `transactions` array

2. **GameHistory Model**:

   - `_id`, `user`, `roomId`, `room`, `winnerId`, `stake`, `status`
   - `players` array, `createdAt`, `updatedAt`

3. **Transaction Model**:

   - `_id`, `amount`, `type`, `status`, `description`, `user`
   - `createdAt`, `updatedAt`

4. **Wallet Model**:
   - `_id`, `user`, `balance`

## API Endpoints Mapping

| Frontend Store   | Backend Endpoint           | Purpose                |
| ---------------- | -------------------------- | ---------------------- |
| adminStore       | `GET /users`               | Dashboard statistics   |
| adminStore       | `GET /games`               | Game statistics        |
| adminStore       | `GET /wallet/transactions` | Revenue data           |
| userStore        | `GET /users`               | User management        |
| userStore        | `PUT /users/:id`           | Update user            |
| userStore        | `DELETE /users/:id`        | Delete user            |
| gameStore        | `GET /games`               | Game management        |
| transactionStore | `GET /wallet/transactions` | Transaction management |

## Missing Backend Endpoints (Noted for Future Implementation)

### User Management:

- `PUT /users/:id/ban` - Ban user
- `PUT /users/:id/unban` - Unban user
- `GET /users/stats` - User statistics

### Game Management:

- `PUT /games/:id/pause` - Pause game
- `PUT /games/:id/resume` - Resume game
- `PUT /games/:id/end` - End game

### Transaction Management:

- `PUT /transactions/:id/approve` - Approve transaction
- `PUT /transactions/:id/reject` - Reject transaction

## Current Status

✅ **All stores updated and integrated with backend**
✅ **Real API calls replacing mock data**
✅ **Proper error handling and loading states**
✅ **Data transformation for frontend compatibility**
✅ **Backend model integration**

## Next Steps

1. **Test Integration**: Run the admin dashboard to test API connectivity
2. **Add Missing Endpoints**: Implement missing backend endpoints for full functionality
3. **Authentication**: Add proper authentication headers to API calls
4. **Real-time Updates**: Implement WebSocket integration for live data updates
5. **Error Handling**: Add more robust error handling for network issues

## Notes

- Some actions (ban/unban, pause/resume, approve/reject) are currently simulated since the backend doesn't have those endpoints
- All stores now use the same API base URL configuration
- Data transformation ensures frontend components continue to work without changes
- Error handling follows consistent patterns across all stores
