import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
	const [rows] = await pool.execute(
		'SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC',
		[req.user.id],
	)
	res.json(rows)
})

router.post('/', async (req, res) => {
	const { type, category, amount, description = null, date } = req.body
	if (!['income', 'expense'].includes(type) || !category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date) {
		return res.status(400).json({ message: 'Type, category, positive amount, and date are required' })
	}
	const [result] = await pool.execute(
		'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
		[req.user.id, type, category.trim(), Number(amount), description?.trim() || null, date],
	)
	const [rows] = await pool.execute('SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE id = ? AND user_id = ?', [result.insertId, req.user.id])
	res.status(201).json(rows[0])
})

router.put('/:id', async (req, res) => {
	const { type, category, amount, description = null, date } = req.body
	if (!['income', 'expense'].includes(type) || !category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date) {
		return res.status(400).json({ message: 'Type, category, positive amount, and date are required' })
	}
	const [result] = await pool.execute(
		'UPDATE transactions SET type = ?, category = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ?',
		[type, category.trim(), Number(amount), description?.trim() || null, date, req.params.id, req.user.id],
	)
	if (!result.affectedRows) return res.status(404).json({ message: 'Transaction not found' })
	const [rows] = await pool.execute('SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
	res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
	const [result] = await pool.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
	if (!result.affectedRows) return res.status(404).json({ message: 'Transaction not found' })
	res.status(204).send()
})

export default router
