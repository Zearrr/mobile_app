import { Prisma, PrismaClient } from '@prisma/client';

export class InventoryService {
  constructor(private prisma: PrismaClient) {}

  async issue({ partId, qty, ref }: { partId: number; qty: number; ref?: string }) {
    if (qty <= 0) throw new Error('qty must be > 0')
    return this.prisma.$transaction(async (tx) => {
      // Lock part row to prevent race on onHandQty
      await tx.$executeRawUnsafe(`SELECT id FROM Part WHERE id = ${partId} FOR UPDATE`)
      const part = await tx.part.findUnique({ where: { id: partId } })
      if (!part) throw new Error('Part not found')
      const onHand = new Prisma.Decimal(part.onHandQty)
      const need = new Prisma.Decimal(qty)
      if (onHand.lt(need)) throw new Error('Insufficient stock')

      // Lock eligible batches in FIFO order
      const batches = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM Batch WHERE partId = ${partId} AND remainingQty > 0 ORDER BY id ASC FOR UPDATE`
      )

      let remaining = need
      for (const b of batches) {
        if (remaining.lte(0)) break
        const available = new Prisma.Decimal(b.remainingQty)
        if (available.lte(0)) continue
        const take = Prisma.Decimal.min(available, remaining)
        const newRemain = available.sub(take)
        await tx.batch.update({ where: { id: b.id }, data: { remainingQty: newRemain } })
        await tx.stockMove.create({
          data: {
            partId,
            batchId: b.id,
            type: 'ISSUE',
            qty: Number(take.neg().toNumber()),
            unitCost: Number(new Prisma.Decimal(b.unitCost).toNumber()),
            totalCost: Number(take.mul(b.unitCost).toNumber()),
            reference: ref ?? undefined,
          },
        })
        remaining = remaining.sub(take)
      }
      if (remaining.gt(0)) throw new Error('Insufficient batches')

      await tx.part.update({ where: { id: partId }, data: { onHandQty: onHand.sub(need) } })
      return await tx.part.findUnique({ where: { id: partId } })
    })
  }
}


