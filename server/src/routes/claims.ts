import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

router.post('/claims/from-warranty/:id', async (req, res) => {
  const id = Number(req.params.id)
  const warranty = await prisma.warranty.findUnique({ where: { id }, include: { job: true, jobItem: true, customer: true, part: true } })
  if (!warranty) return res.status(404).json({ error: 'Warranty not found' })
  const claim = await prisma.claim.create({
    data: {
      warrantyId: warranty.id,
      customerId: warranty.customerId,
      jobId: warranty.jobId,
      partId: warranty.partId ?? undefined,
      status: 'SUBMITTED',
    },
  })
  res.json({ claim })
})

export default router


