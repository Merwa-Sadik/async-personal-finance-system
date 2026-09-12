import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import { NotificationProvider } from './context/NotificationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expense from './pages/Expense'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Layout><Dashboard /></Layout>} />
    <Route path="/income" element={<Layout><Income /></Layout>} />
    <Route path="/expense" element={<Layout><Expense /></Layout>} />
    <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
    <Route path="/budgets" element={<Layout><Budgets /></Layout>} />
    <Route path="/reports" element={<Layout><Reports /></Layout>} />
    <Route path="/profile" element={<Layout><Profile /></Layout>} />
    <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
  </Routes>
)

function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </FinanceProvider>
    </BrowserRouter>
  )
}

export default App
