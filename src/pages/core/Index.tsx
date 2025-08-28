import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  Package,
  Plus,
  Target,
  Users,
  Wrench
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { jobs, customers, parts } = useRepairStore();

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter(j => j.status === 'received' || j.status === 'checking' || j.status === 'waiting_parts').length;
    const inProgressJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'testing').length;
    const completedJobs = jobs.filter(j => j.status === 'done' || j.status === 'delivered').length;
    const totalCustomers = customers.length;
    const totalParts = parts.length;
    const lowStockParts = parts.filter(p => p.stock <= (p.minStock || 5)).length;

    return {
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      totalCustomers,
      totalParts,
      lowStockParts
    };
  }, [jobs, customers, parts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      {/* Main Content */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader title="หน้าแรก" description="ภาพรวมและทางลัดการทำงานในระบบ" showActions={false} />

      {/* Work Status Section - move to top to show 6 cards first */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* งานทั้งหมด */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/60 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-blue-700 dark:text-blue-300">{stats.totalJobs}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-blue-700 dark:text-blue-300 thai-text">งานทั้งหมด</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* รอดำเนินการ */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/60 dark:from-sky-950/30 dark:to-blue-950/30 dark:border-sky-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-sky-700 dark:text-sky-300">{stats.pendingJobs}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-sky-700 dark:text-sky-300 thai-text">รอดำเนินการ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* กำลังซ่อม */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200/60 dark:from-indigo-950/30 dark:to-purple-950/30 dark:border-indigo-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-indigo-700 dark:text-indigo-300">{stats.inProgressJobs}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-indigo-700 dark:text-indigo-300 thai-text">กำลังซ่อม</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* เสร็จสิ้น */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200/60 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-emerald-700 dark:text-emerald-300">{stats.completedJobs}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-emerald-700 dark:text-emerald-300 thai-text">เสร็จสิ้น</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ลูกค้าทั้งหมด */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200/60 dark:from-cyan-950/30 dark:to-blue-950/30 dark:border-cyan-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-cyan-700 dark:text-cyan-300">{stats.totalCustomers}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-cyan-700 dark:text-cyan-300 thai-text">ลูกค้าทั้งหมด</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* สต็อกต่ำ */}
          <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/60 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-orange-800/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold leading-none text-orange-700 dark:text-orange-300">{stats.lowStockParts}</div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-orange-700 dark:text-orange-300 thai-text">สต็อกต่ำ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Buttons - moved below status cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Job */}
          <Link to="/jobs/new" className="group block">
            <Card className="rounded-2xl shadow-lg border border-emerald-200/60 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-800/40 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white flex items-center justify-center shadow-md">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">แจ้งซ่อมใหม่</div>
                    <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 thai-text">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Jobs List */}
          <Link to="/jobs" className="group block">
            <Card className="rounded-2xl shadow-lg border border-blue-200/60 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/40 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">รายการแจ้งซ่อม</div>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 thai-text">ดูและจัดการงานซ่อมทั้งหมด</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Pricing */}
          <Link to="/pricing" className="group block">
            <Card className="rounded-2xl shadow-lg border border-violet-200/60 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/30 dark:to-fuchsia-950/30 dark:border-violet-800/40 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-violet-700 dark:text-violet-300">คำนวณราคา</div>
                    <p className="text-sm text-violet-700/80 dark:text-violet-300/80 thai-text">คำนวณราคาและสร้างใบเสนอราคา</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Business Metrics Section - removed as requested */}

      {/* Recent Jobs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">งานซ่อมล่าสุด</h2>
          </div>
          <Link to="/jobs">
            <Button className="px-5 py-2.5 rounded-lg">
              <Target className="w-4 h-4 mr-2" />
              ดูทั้งหมด
            </Button>
          </Link>
        </div>
        <Card className="bg-white/85 backdrop-blur-sm border border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            {jobs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-xl font-medium mb-2 thai-text text-foreground">ยังไม่มีงานซ่อมในระบบ</p>
                <p className="text-sm text-muted-foreground thai-text">เริ่มต้นด้วยการสร้างงานซ่อมใหม่</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job, index) => (
                  <div key={job.id} className="group p-5 rounded-xl border border-border/30 hover:border-primary/40 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-mono text-xs text-primary mb-1 bg-primary/10 px-2.5 py-0.5 rounded-full inline-block">R{String(job.id).padStart(5, '0')}</div>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-300 text-[11px] rounded-full font-medium">รับงาน</span>
                          <span className="px-2.5 py-0.5 bg-success/20 text-success text-[11px] rounded-full font-medium">ชำระมัดจำ</span>
                        </div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base mb-1">
                          {job.customerId} • {job.brand} {job.model}
                        </h4>
                        <p className="text-xs text-muted-foreground thai-text leading-relaxed">
                          {job.issueDesc.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary mb-1">฿{job.total.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          {new Date(job.receivedAt).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
};

export default Index;
