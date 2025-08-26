import { PrismaClient } from '@prisma/client'
import { InventoryService } from '../services/InventoryService'

const prisma = new PrismaClient()
const svc = new InventoryService(prisma)

beforeAll(async () => { await prisma.$connect() })
beforeEach(async () => {
  await prisma.stockMove.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.part.deleteMany()
})
afterAll(async () => { await prisma.$disconnect() })

test('FIFO issue writes stock moves and updates onHand', async () => {
  const p = await prisma.part.create({ data: { sku: 'F1', name: 'F', onHandQty: 0, movingAvgCost: 0 } })
  await prisma.batch.create({ data: { partId: p.id, receivedQty: 5, remainingQty: 5, unitCost: 10 } })
  await prisma.batch.create({ data: { partId: p.id, receivedQty: 5, remainingQty: 5, unitCost: 12 } })
  await prisma.part.update({ where: { id: p.id }, data: { onHandQty: 10 } })

  await svc.issue({ partId: p.id, qty: 7, ref: 'order1' })
  const part = await prisma.part.findUnique({ where: { id: p.id } })
  expect(part?.onHandQty).toBe(3)
  const moves = await prisma.stockMove.findMany({ where: { partId: p.id }, orderBy: { id: 'asc' } })
  expect(moves.length).toBe(2)
  expect(moves[0].qty).toBe(-5)
  expect(moves[0].unitCost).toBe(10)
  expect(moves[1].qty).toBe(-2)
  expect(moves[1].unitCost).toBe(12)
})

test('concurrent issues serialize and do not go negative', async () => {
  const p = await prisma.part.create({ data: { sku: 'C1', name: 'C', onHandQty: 0, movingAvgCost: 0 } })
  await prisma.batch.create({ data: { partId: p.id, receivedQty: 10, remainingQty: 10, unitCost: 10 } })
  await prisma.part.update({ where: { id: p.id }, data: { onHandQty: 10 } })

  // Two concurrent issues of 6 each -> expect one to succeed, one to fail
  const results = await Promise.allSettled([
    svc.issue({ partId: p.id, qty: 6, ref: 'A' }),
    svc.issue({ partId: p.id, qty: 6, ref: 'B' }),
  ])
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  expect(succeeded).toBe(1)
  expect(failed).toBe(1)
  const part = await prisma.part.findUnique({ where: { id: p.id } })
  expect(part?.onHandQty).toBe(4)
})


