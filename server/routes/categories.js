import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
	const [rows] = await pool.execute(
		'SELECT id, name, type, created_at FROM categories WHERE user_id = ? ORDER BY type, name',
		[req.user.id],
	)
	res.json(rows)
})

router.post('/', async (req, res) => {
	const { name, type } = req.body
	if (!name?.trim() || !['income', 'expense'].includes(type)) {
		return res.status(400).json({ message: 'Category name and valid type are required' })
	}

	try {
		const [existing] = await pool.execute(
			'SELECT id FROM categories WHERE user_id = ? AND type = ? AND LOWER(name) = LOWER(?)',
			[req.user.id, type, name.trim()],
		)
		if (existing.length) return res.status(409).json({ message: 'Category already exists' })

		const [result] = await pool.execute(
			'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
			[req.user.id, name.trim(), type],
		)
		const [rows] = await pool.execute(
			'SELECT id, name, type, created_at FROM categories WHERE id = ? AND user_id = ?',
			[result.insertId, req.user.id],
		)
		res.status(201).json(rows[0])
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Category already exists' })
		throw error
	}
})

export default router