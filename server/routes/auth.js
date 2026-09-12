import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

const router = Router()

const createToken = (user) => jwt.sign(
	{ id: user.id, email: user.email },
	process.env.JWT_SECRET,
	{ expiresIn: '7d' },
)

router.post('/register', async (req, res) => {
	const { name, email, password } = req.body
	if (!name?.trim() || !email?.trim() || !password) {
		return res.status(400).json({ message: 'Name, email, and password are required' })
	}
	if (password.length < 6) {
		return res.status(400).json({ message: 'Password must be at least 6 characters' })
	}

	try {
		const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()])
		if (existing.length) return res.status(409).json({ message: 'Email is already registered' })

		const passwordHash = await bcrypt.hash(password, 12)
		const [result] = await pool.execute(
			'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
			[name.trim(), email.trim().toLowerCase(), passwordHash],
		)
		const user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() }
		res.status(201).json({ user, token: createToken(user) })
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email is already registered' })
		throw error
	}
})

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	if (!email?.trim() || !password) {
		return res.status(400).json({ message: 'Email and password are required' })
	}

	const [users] = await pool.execute('SELECT id, name, email, password FROM users WHERE email = ?', [email.trim().toLowerCase()])
	const user = users[0]
	if (!user || !(await bcrypt.compare(password, user.password))) {
		return res.status(401).json({ message: 'Invalid email or password' })
	}

	const safeUser = { id: user.id, name: user.name, email: user.email }
	res.json({ user: safeUser, token: createToken(safeUser) })
})

export default router
