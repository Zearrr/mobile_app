import { PrismaClient } from '@prisma/client';

export class GRService {
  constructor(private prisma: PrismaClient) {}

  async receive(poId: number, items: { poItemId: number; qty: number; unitCost?: number; ref?: string }[]) {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.pO.findUnique({ where: { id: poId }, include: { items: true } })
      if (!po) throw new Error('PO not found')
      const gr = await tx.goodsReceipt.create({ data: { poId, number: `GR${Date.now()}` } })

      for (const it of items) {
        const poi = po.items.find(i => i.id === it.poItemId)
        if (!poi) throw new Error('PO item not found')
        const remaining = poi.qtyOrdered - poi.qtyReceived
        if (it.qty <= 0 || it.qty > remaining + 1e-9) throw new Error('Invalid receive qty')
        const unitCost = it.unitCost ?? poi.unitCost
        await tx.gRItem.create({ data: { grId: gr.id, poItemId: poi.id, qtyReceived: it.qty, unitCost } })
        await tx.pOItem.update({ where: { id: poi.id }, data: { qtyReceived: { increment: it.qty } } })
        // Create batch (+remaining) and stock move in
        const batch = await tx.batch.create({ data: { partId: poi.partId, receivedQty: it.qty, remainingQty: it.qty, unitCost, reference: gr.number } })
        await tx.stockMove.create({ data: { partId: poi.partId, batchId: batch.id, type: 'RECEIVE', qty: it.qty, unitCost, totalCost: it.qty * unitCost, reference: gr.number } })
        // Update part onHand and moving average
        const part = await tx.part.findUnique({ where: { id: poi.partId } })
        if (!part) throw new Error('Part not found')
        const oldQty = part.onHandQty
        const oldCost = part.movingAvgCost
        const newQty = oldQty + it.qty
        const newMAC = newQty === 0 ? 0 : (oldQty * oldCost + it.qty * unitCost) / newQty
        await tx.part.update({ where: { id: poi.partId }, data: { onHandQty: newQty, movingAvgCost: newMAC } })
      }

      // Update PO status
      const updatedItems = await tx.pOItem.findMany({ where: { poId } })
      const allReceived = updatedItems.every(i => i.qtyReceived >= i.qtyOrdered - 1e-9)
      const anyReceived = updatedItems.some(i => i.qtyReceived > 0)
      const status = allReceived ? 'RECEIVED' : anyReceived ? 'PARTIAL' : po.status
      if (status !== po.status) await tx.pO.update({ where: { id: poId }, data: { status } })

      return await tx.goodsReceipt.findUnique({ where: { id: gr.id }, include: { items: true } })
    })
  }
}


