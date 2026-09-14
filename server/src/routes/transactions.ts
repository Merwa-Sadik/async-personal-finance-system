import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

type TransactionBody = {
  type?: string
  category?: string
  amount?: number | string
  description?: string | null
  date?: string
}

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC',
      [req.user.id],
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  const { type, category, amount, description = null, date } = req.body as TransactionBody
  if (!['income', 'expense'].includes(type ?? '') || !category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date) {
    res.status(400).json({ message: 'Type, category, positive amount, and date are required' })
    return
  }
  try {
    const transactionType = type as 'income' | 'expense'
    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, transactionType, category.trim(), Number(amount), description?.trim() || null, date],
    )
    const [rows] = await pool.execute('SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE id = ? AND user_id = ?', [(result as { insertId: number }).insertId, req.user.id])
    res.status(201).json((rows as unknown[])[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/:id', async (req, res) => {
  const { type, category, amount, description = null, date } = req.body as TransactionBody
  if (!['income', 'expense'].includes(type ?? '') || !category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date) {
    res.status(400).json({ message: 'Type, category, positive amount, and date are required' })
    return
  }
  try {
    const transactionType = type as 'income' | 'expense'
    const [result] = await pool.execute(
      'UPDATE transactions SET type = ?, category = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ?',
      [transactionType, category.trim(), Number(amount), description?.trim() || null, date, req.params.id, req.user.id],
    )
    if (!(result as { affectedRows: number }).affectedRows) {
      res.status(404).json({ message: 'Transaction not found' })
      return
    }
    const [rows] = await pool.execute('SELECT id, type, category, amount, description, date, created_at FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json((rows as unknown[])[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!(result as { affectedRows: number }).affectedRows) {
      res.status(404).json({ message: 'Transaction not found' })
      return
    }
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
