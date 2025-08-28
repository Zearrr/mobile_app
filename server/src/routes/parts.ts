import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

// GET /parts - list parts with optional q filter
router.get('/parts', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    const where: any = {
      AND: [
        q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {},
      ]
    }
    const parts = await prisma.part.findMany({ where, orderBy: { id: 'desc' } })
    res.json({ data: parts })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router


