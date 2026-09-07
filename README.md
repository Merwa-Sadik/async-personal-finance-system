# Async Personal Finance System

A full-stack personal finance management system built with React, Node.js, and MySQL.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL

## Features

- Track income and expenses
- Manage multiple accounts
- Set and monitor budgets
- View transaction history
- Financial reports and summaries

## Project Structure

```
async-personal-finance-system/
├── client/                        # React + Tailwind CSS frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Images, icons
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page-level components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Budgets.jsx
│   │   │   └── Reports.jsx
│   │   ├── context/               # React context (auth, finance state)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # Axios API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                        # Node.js + Express backend
    ├── config/
    │   └── db.js                  # MySQL connection
    ├── controllers/               # Route handler logic
    │   ├── authController.js
    │   ├── transactionController.js
    │   ├── budgetController.js
    │   └── reportController.js
    ├── routes/                    # Express routes
    │   ├── auth.js
    │   ├── transactions.js
    │   ├── budgets.js
    │   └── reports.js
    ├── middleware/
    │   └── authMiddleware.js      # JWT verification
    ├── schema.sql                 # Database schema
    ├── .env
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE personal_finance;
```

2. Import the schema:
```bash
mysql -u root -p personal_finance < server/schema.sql
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env   # fill in your DB credentials
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your_password>
DB_NAME=personal_finance
JWT_SECRET=<your_jwt_secret>
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create a budget |
| GET | `/api/reports/summary` | Get financial summary |

## License

MIT
