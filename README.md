# Async Personal Finance System

A full-stack personal finance management system with a responsive PFMS dashboard. The frontend uses React Native, TypeScript, Expo, and React Native Web. The backend uses Node.js, Express, and MySQL.

## Features

- PFMS login and registration screens
- Responsive desktop-first dashboard for web
- Sidebar navigation for Dashboard, Income, Expenses, Notifications, Profile, and Settings
- Data-driven income, expense, balance, and budget summary cards
- Income versus expense chart with hover and tap details
- Spending by category visualization
- Alerts and notifications with unread states
- Recent transactions view
- Add income and add expense modal popups
- Delete income and expense entries
- Responsive layouts for desktop, tablet, and mobile sizes
- Light and dark appearance modes from Settings

## Tech Stack

- **Frontend:** React Native, TypeScript, Expo, React Native Web, React Navigation
- **Backend:** Node.js, Express.js, MySQL
- **Authentication:** JWT and bcryptjs support in the server

## Project Structure

```text
async-personal-finance-system/
├── client/                         # Active Expo React Native + React Native Web frontend
│   ├── App.tsx                     # Root authentication and app navigation
│   ├── app.json                    # Expo configuration
│   ├── package.json
│   └── src/
│       ├── context/FinanceContext.tsx
│       ├── navigation/MainShell.tsx
│       ├── screens/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Income.tsx
│       │   ├── Expense.tsx
│       │   ├── Notifications.tsx
│       │   ├── Profile.tsx
│       │   └── Settings.tsx
│       └── types/index.ts
├── server/                         # Express API and MySQL integration
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── schema.sql
│   └── package.json
└── mobile/                         # Optional separate mobile project
```

The `mobile` folder is optional. The `client` folder is the active frontend and supports browser, Android, and iOS through Expo.

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8 or newer for the backend
- A browser for web development, or an Android/iOS emulator for native development

## Run the Web Frontend

```bash
cd client
npm install
npm run web
```

Expo will display a local URL, usually `http://localhost:8081`.

The web frontend requires `react-dom` and `react-native-web`, which are included in the client dependencies.

## Run on Native Platforms

Android:

```bash
cd client
npm install
npm run android
```

iOS:

```bash
cd client
npm run ios
```

Interactive Expo start menu:

```bash
cd client
npm start
```

## Run the Backend

In a separate terminal:

```bash
cd server
npm install
npm run dev
```

The backend runs on port `5000` by default.

## Database Setup

Create the database:

```sql
CREATE DATABASE personal_finance;
```

Import the schema:

```bash
mysql -u root -p personal_finance < server/schema.sql
```

Create a `server/.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=personal_finance
JWT_SECRET=your_jwt_secret
```

## API Endpoints

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | `/api/auth/register`    | Register a user       |
| POST   | `/api/auth/login`       | Authenticate a user   |
| GET    | `/api/transactions`     | Get transactions      |
| POST   | `/api/transactions`     | Add a transaction     |
| PUT    | `/api/transactions/:id` | Update a transaction  |
| DELETE | `/api/transactions/:id` | Delete a transaction  |
| GET    | `/api/budgets`          | Get budgets           |
| POST   | `/api/budgets`          | Create a budget       |
| GET    | `/api/reports/summary`  | Get financial summary |
| GET    | `/api/health`           | Check server health   |

## Notes

The current frontend context contains local finance data for the dashboard experience. The server API is available for connecting persistent authentication and finance data as backend integration is completed.

## License

MIT
