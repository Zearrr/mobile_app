import express from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { POSService } from '../services/POSService'

const router = express.Router()
const service = new POSService(prisma)

const paySchema = z.object({ saleId: z.number().int().positive(), amount: z.number().positive(), method: z.string() })
router.post('/pos/pay', async (req, res) => {
  const idem = (req.headers['idempotency-key'] as string) || ''
  if (!idem) return res.status(400).json({ error: 'Idempotency-Key required' })
  const parsed = paySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const result = await service.pay({ ...parsed.data, idemKey: idem, requestBody: req.body })
    res.json(result)
  } catch (e: any) { res.status(400).json({ error: e.message }) }
})

router.post('/pos/void/:id', async (req, res) => {
  const role = (req.headers['x-role'] as string) || 'STAFF'
  try {
    const sale = await service.voidSale({ saleId: Number(req.params.id), role: role as any, reason: req.body?.reason })
    res.json({ sale })
  } catch (e: any) { res.status(400).json({ error: e.message }) }
})

export default router


