import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
	const [rows] = await pool.execute(
		'SELECT id, category, amount, month, year, created_at FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC, category',
		[req.user.id],
	)
	res.json(rows)
})

router.post('/', async (req, res) => {
	const { category, amount, month, year } = req.body
	if (!category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !Number.isInteger(Number(month)) || Number(month) < 1 || Number(month) > 12 || !Number.isInteger(Number(year))) {
		return res.status(400).json({ message: 'Category, positive amount, valid month, and year are required' })
	}
	const [result] = await pool.execute(
		'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
		[req.user.id, category.trim(), Number(amount), Number(month), Number(year)],
	)
	const [rows] = await pool.execute('SELECT id, category, amount, month, year, created_at FROM budgets WHERE id = ? AND user_id = ?', [result.insertId, req.user.id])
	res.status(201).json(rows[0])
})

export default router
