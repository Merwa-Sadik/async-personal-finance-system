import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

type RegisterBody = {
  name?: string
  email?: string
  password?: string
}

type LoginBody = {
  email?: string
  password?: string
}

type User = {
  id: number
  name: string
  email: string
}

const router = Router()

const createToken = (user: Pick<User, 'id' | 'email'>): string => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET as string,
  { expiresIn: '7d' },
)

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body as RegisterBody
  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ message: 'Name, email, and password are required' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' })
    return
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail])
    if (Array.isArray(existing) && existing.length) {
      res.status(409).json({ message: 'Email is already registered' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash],
    )
    const user: User = { id: (result as { insertId: number }).insertId, name: name.trim(), email: normalizedEmail }
    res.status(201).json({ user, token: createToken(user) })
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Email is already registered' })
      return
    }
    throw error
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body as LoginBody
  if (!email?.trim() || !password) {
    res.status(400).json({ message: 'Email and password are required' })
    return
  }

  const [users] = await pool.execute('SELECT id, name, email, password FROM users WHERE email = ?', [email.trim().toLowerCase()])
  const user = (users as Array<User & { password: string }>)[0]
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid email or password' })
    return
  }

  const safeUser: User = { id: user.id, name: user.name, email: user.email }
  res.json({ user: safeUser, token: createToken(safeUser) })
})

export default router
