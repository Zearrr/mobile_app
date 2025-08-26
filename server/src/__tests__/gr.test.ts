import { PrismaClient } from '@prisma/client'
import { GRService } from '../services/GRService'

const prisma = new PrismaClient()
const svc = new GRService(prisma)

beforeAll(async () => { await prisma.$connect() })
beforeEach(async () => {
  await prisma.gRItem.deleteMany()
  await prisma.goodsReceipt.deleteMany()
  await prisma.pOItem.deleteMany()
  await prisma.pO.deleteMany()
  await prisma.stockMove.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.part.deleteMany()
})
afterAll(async () => { await prisma.$disconnect() })

test('partial receive twice: status transitions and moving average', async () => {
  const part = await prisma.part.create({ data: { sku: 'GRP1', name: 'Part', onHandQty: 0, movingAvgCost: 0 } })
  const po = await prisma.pO.create({ data: { number: 'PO1', status: 'APPROVED' } })
  const poi = await prisma.pOItem.create({ data: { poId: po.id, partId: part.id, qtyOrdered: 10, unitCost: 10 } })
  // first partial 6 @10
  await svc.receive(po.id, [{ poItemId: poi.id, qty: 6 }])
  let poAfter = await prisma.pO.findUnique({ where: { id: po.id } })
  let partAfter = await prisma.part.findUnique({ where: { id: part.id } })
  expect(poAfter?.status).toBe('PARTIAL')
  expect(partAfter?.onHandQty).toBeCloseTo(6)
  expect(partAfter?.movingAvgCost).toBeCloseTo(10)

  // second partial 4 @12
  await svc.receive(po.id, [{ poItemId: poi.id, qty: 4, unitCost: 12 }])
  poAfter = await prisma.pO.findUnique({ where: { id: po.id } })
  partAfter = await prisma.part.findUnique({ where: { id: part.id } })
  expect(poAfter?.status).toBe('RECEIVED')
  expect(partAfter?.onHandQty).toBeCloseTo(10)
  expect(partAfter!.movingAvgCost).toBeGreaterThan(10)
  expect(partAfter!.movingAvgCost).toBeLessThan(12)
})


