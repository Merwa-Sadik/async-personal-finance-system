import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import pool from '../config/db.js'

type BudgetBody = {
  category?: string
  amount?: number | string
  month?: number | string
  year?: number | string
}

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, category, amount, month, year, created_at FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC, category',
      [req.user.id],
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  const { category, amount, month, year } = req.body as BudgetBody
  if (!category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !Number.isInteger(Number(month)) || Number(month) < 1 || Number(month) > 12 || !Number.isInteger(Number(year))) {
    res.status(400).json({ message: 'Category, positive amount, valid month, and year are required' })
    return
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category.trim(), Number(amount), Number(month), Number(year)],
    )
    const [rows] = await pool.execute('SELECT id, category, amount, month, year, created_at FROM budgets WHERE id = ? AND user_id = ?', [(result as { insertId: number }).insertId, req.user.id])
    res.status(201).json((rows as unknown[])[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/:id', async (req, res) => {
  const { category, amount, month, year } = req.body as BudgetBody
  if (!category?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !Number.isInteger(Number(month)) || Number(month) < 1 || Number(month) > 12 || !Number.isInteger(Number(year))) {
    res.status(400).json({ message: 'Category, positive amount, valid month, and year are required' })
    return
  }
  try {
    const [result] = await pool.execute(
      'UPDATE budgets SET category = ?, amount = ?, month = ?, year = ? WHERE id = ? AND user_id = ?',
      [category.trim(), Number(amount), Number(month), Number(year), req.params.id, req.user.id],
    )
    if (!(result as { affectedRows: number }).affectedRows) {
      res.status(404).json({ message: 'Budget not found' })
      return
    }
    const [rows] = await pool.execute('SELECT id, category, amount, month, year, created_at FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json((rows as unknown[])[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!(result as { affectedRows: number }).affectedRows) {
      res.status(404).json({ message: 'Budget not found' })
      return
    }
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
