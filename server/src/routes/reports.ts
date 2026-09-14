import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

const router = Router()
router.use(authMiddleware)

router.get('/summary', async (req, res) => {
  try {
    const { period } = req.query as { period?: string }
    const now = new Date()
    let startDate: string | null = null

    if (period === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 6)
      startDate = d.toISOString().slice(0, 10)
    } else if (period === 'month') {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    } else if (period === 'quarter') {
      const qStart = Math.floor(now.getMonth() / 3) * 3
      startDate = `${now.getFullYear()}-${String(qStart + 1).padStart(2, '0')}-01`
    } else if (period === 'year') {
      startDate = `${now.getFullYear()}-01-01`
    }

    const dateFilter = startDate ? 'AND date >= ?' : ''
    const params = startDate ? [req.user.id, startDate] : [req.user.id]

    const [totals] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses
       FROM transactions WHERE user_id = ? ${dateFilter}`,
      params,
    )
    const [byCategory] = await pool.execute(
      `SELECT category, type, COALESCE(SUM(amount), 0) AS total
       FROM transactions WHERE user_id = ? ${dateFilter} GROUP BY category, type ORDER BY total DESC`,
      params,
    )
    const totalsRow = (totals as Array<{ totalIncome: number | string; totalExpenses: number | string }>)[0]
    const totalIncome = Number(totalsRow.totalIncome)
    const totalExpenses = Number(totalsRow.totalExpenses)
    res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, byCategory })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
