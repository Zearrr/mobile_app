import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export class POSService {
  constructor(private prisma: PrismaClient) {}

  async pay({ saleId, amount, method, idemKey, requestBody }: { saleId: number; amount: number; method: string; idemKey: string; requestBody: unknown }) {
    return this.prisma.$transaction(async (tx) => {
      // idempotency check
      const hash = crypto.createHash('sha256').update(JSON.stringify(requestBody || {})).digest('hex')
      const existing = await tx.idempotencyKey.findUnique({ where: { key: idemKey } })
      if (existing) {
        if (existing.requestHash !== hash) throw new Error('Idempotency Key conflict')
        // return prior response if desired
        const prior = existing.response as any
        if (prior?.paymentId) return prior
        return { reused: true }
      }
      const idem = await tx.idempotencyKey.create({ data: { key: idemKey, endpoint: '/pos/pay', requestHash: hash } })

      const sale = await tx.sale.findUnique({ where: { id: saleId } })
      if (!sale) throw new Error('Sale not found')
      if (sale.status === 'VOID') throw new Error('Sale voided')

      const payment = await tx.payment.create({ data: { saleId, amount, method, idempotencyKeyId: idem.id } })
      const paidAgg = await tx.payment.aggregate({ _sum: { amount: true }, where: { saleId, voidedAt: null, refund: false } })
      const paid = paidAgg._sum.amount ?? 0
      if (paid >= sale.grandTotal - 1e-6) {
        await tx.sale.update({ where: { id: saleId }, data: { status: 'PAID' } })
      }
      await tx.auditLog.create({ data: { entity: 'POS', action: 'PAY', ref: String(saleId), meta: { amount, method } } })
      await tx.idempotencyKey.update({ where: { id: idem.id }, data: { response: { paymentId: payment.id } as any } })
      return { paymentId: payment.id }
    })
  }

  async voidSale({ saleId, role, reason }: { saleId: number; role: 'MANAGER' | 'OWNER' | string; reason?: string }) {
    if (role !== 'MANAGER' && role !== 'OWNER') throw new Error('Forbidden')
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } })
      if (!sale) throw new Error('Sale not found')
      if (sale.status === 'VOID') return sale
      // revert stock_moves is domain-dependent; here we only mark payments refund/void
      await tx.payment.updateMany({ where: { saleId, voidedAt: null }, data: { voidedAt: new Date(), refund: true } })
      const voided = await tx.sale.update({ where: { id: saleId }, data: { status: 'VOID' } })
      await tx.auditLog.create({ data: { entity: 'POS', action: 'VOID', ref: String(saleId), meta: { reason } } })
      return voided
    })
  }
}


