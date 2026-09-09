import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

const router = Router()

router.use(authMiddleware)

router.get('/summary', async (req, res) => {
	const [totals] = await pool.execute(
		`SELECT
			 COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
			 COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses
		 FROM transactions WHERE user_id = ?`,
		[req.user.id],
	)
	const [byCategory] = await pool.execute(
		`SELECT category, type, COALESCE(SUM(amount), 0) AS total
		 FROM transactions WHERE user_id = ? GROUP BY category, type ORDER BY total DESC`,
		[req.user.id],
	)
	const totalIncome = Number(totals[0].totalIncome)
	const totalExpenses = Number(totals[0].totalExpenses)
	res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, byCategory })
})

export default router
