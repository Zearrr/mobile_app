import { PrismaClient } from '@prisma/client'

export class JobService {
  constructor(private prisma: PrismaClient) {}

  async close(jobId: number) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId }, include: { items: true, customer: true } })
      if (!job) throw new Error('Job not found')
      if (job.status === 'CLOSED') return job
      const now = new Date()
      for (const it of job.items) {
        if (it.warrantyDays > 0) {
          const start = now
          const end = new Date(now.getTime() + it.warrantyDays * 24 * 3600 * 1000)
          await tx.warranty.create({
            data: {
              jobId: job.id,
              jobItemId: it.id,
              customerId: job.customerId,
              partId: it.partId ?? undefined,
              startAt: start,
              endAt: end,
            },
          })
        }
      }
      const updated = await tx.job.update({ where: { id: job.id }, data: { status: 'CLOSED', closedAt: now } })
      return updated
    })
  }
}


