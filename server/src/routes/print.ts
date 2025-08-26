import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

router.get('/print/credit-note/:id', async (req, res) => {
  const id = Number(req.params.id)
  const sale = await prisma.sale.findUnique({ where: { id }, include: { payments: true } })
  if (!sale) return res.status(404).send('Not found')
  const css = `<style> body{font-family:Arial;margin:24px;} h1{font-size:20px;} .row{margin:6px 0;} </style>`
  const refunded = sale.payments.filter(p => p.refund && !p.voidedAt).reduce((s, p) => s + p.amount, 0)
  const html = `<html><head><meta charset="utf-8"/>${css}</head><body>
    <h1>Credit Note</h1>
    <div class='row'>Sale No: ${sale.number}</div>
    <div class='row'>Status: ${sale.status}</div>
    <div class='row'>Refunded: ${refunded}</div>
  </body></html>`
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
})

export default router


