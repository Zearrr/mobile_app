// Dashboard with summary cards and recent jobs
import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Package,
  ShieldCheck,
  Target,
  Wallet,
  Wrench
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

interface OutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPageInfo: {
    title: string;
    description: string;
  };
}

const Dashboard = () => {
  const { sidebarOpen, setSidebarOpen, currentPageInfo } = useOutletContext<OutletContext>();
  const { jobs, customers, parts } = useRepairStore();
  const [quickQuery, setQuickQuery] = useState('');

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter(j => j.status === 'received' || j.status === 'checking' || j.status === 'waiting_parts').length;
    const inProgressJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'testing').length;
    const completedJobs = jobs.filter(j => j.status === 'done' || j.status === 'delivered').length;
    const totalCustomers = customers.length;
    const totalParts = parts.length;
    const lowStockParts = parts.filter(p => p.stock <= (p.minStock || 5)).length;
    const totalClaims = jobs.filter(j => (j.warrantyDays || 0) > 0).length;

    // Calculate percentages
    const pendingPercent = totalJobs > 0 ? Math.round((pendingJobs / totalJobs) * 100) : 0;
    const inProgressPercent = totalJobs > 0 ? Math.round((inProgressJobs / totalJobs) * 100) : 0;
    const completedPercent = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    return {
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      totalCustomers,
      totalParts,
      lowStockParts,
      totalClaims,
      pendingPercent,
      inProgressPercent,
      completedPercent
    };
  }, [jobs, customers, parts]);

  // Get recent jobs (all, sorted). We'll paginate in UI.
  const recentJobs = useMemo(() => {
    return jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(job => {
        const customer = customers.find(c => c.id === job.customerId);
        return {
          ...job,
          customerName: customer?.name || 'ไม่ระบุ',
          deviceModel: `${job.brand} ${job.model}`
        };
      });
  }, [jobs, customers]);

  // Pagination for recent jobs (4 per page)
  const [recentPage, setRecentPage] = useState(1);
  const recentPerPage = 4;
  const recentTotalPages = Math.max(1, Math.ceil(recentJobs.length / recentPerPage));
  const recentStart = (recentPage - 1) * recentPerPage;
  const recentPageItems = recentJobs.slice(recentStart, recentStart + recentPerPage);

  // Parts totals for stock and value
  const partsTotals = useMemo(() => {
    const stock = parts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const value = parts.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost || 0)), 0);
    return { stock, value };
  }, [parts]);

  // Finance KPIs
  const finance = useMemo(() => {
    const now = new Date();
    const isSameDay = (d: Date) => d.toDateString() === now.toDateString();
    const isSameWeek = (d: Date) => {
      const first = new Date(now);
      first.setDate(now.getDate() - now.getDay());
      const last = new Date(first); last.setDate(first.getDate() + 6);
      return d >= first && d <= last;
    };
    const isSameMonth = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

    const paidJobs = jobs.filter(j => j.paymentStatus === 'paid');
    const revenueToday = paidJobs.filter(j => j.completedAt && isSameDay(new Date(j.completedAt))).reduce((s, j) => s + (j.total || 0), 0);
    const revenueWeek = paidJobs.filter(j => j.completedAt && isSameWeek(new Date(j.completedAt))).reduce((s, j) => s + (j.total || 0), 0);
    const revenueMonth = paidJobs.filter(j => j.completedAt && isSameMonth(new Date(j.completedAt))).reduce((s, j) => s + (j.total || 0), 0);
    const totalRevenue = paidJobs.reduce((s, j) => s + (j.total || 0), 0);
    const completedToday = jobs.filter(j => (j.completedAt && isSameDay(new Date(j.completedAt)))).length;

    const unpaid = jobs.filter(j => j.paymentStatus !== 'paid');
    const unpaidAmount = unpaid.reduce((s, j) => s + Math.max(0, (j.total || 0) - (j.deposit || 0)), 0);
    const depositsOutstanding = jobs.reduce((s, j) => s + (j.deposit || 0), 0);

    return { revenueToday, revenueWeek, revenueMonth, totalRevenue, unpaidAmount, depositsOutstanding, completedToday };
  }, [jobs]);

  // Unpaid jobs list (top 5 by due amount)
  const unpaidJobsList = useMemo(() => {
    const enriched = jobs
      .filter(j => j.paymentStatus !== 'paid')
      .map(j => ({
        ...j,
        due: Math.max(0, (j.total || 0) - (j.deposit || 0)),
      }))
      .sort((a, b) => b.due - a.due)
      .slice(0, 5);
    return enriched;
  }, [jobs]);

  // Alerts
  const alerts = useMemo(() => {
    const now = new Date();
    const daysBetween = (a: Date, b: Date) => Math.ceil((a.getTime() - b.getTime()) / 86400000);

    const waitingParts = jobs.filter(j => j.status === 'waiting_parts');

    // Overdue: jobs not completed older than 7 days since receivedAt/createdAt
    const overdue = jobs.filter(j => !['done', 'delivered'].includes(j.status))
      .filter(j => {
        const base = new Date(j.receivedAt || j.createdAt);
        return daysBetween(now, base) > 7;
      });

    // Warranty expiring within 7 days
    const warrantyExpiring = jobs.filter(j => j.completedAt && (j.warrantyDays || 0) > 0).filter(j => {
      const start = new Date(j.completedAt as Date);
      const expire = new Date(start);
      expire.setDate(expire.getDate() + (j.warrantyDays || 0));
      const remaining = daysBetween(expire, now);
      return remaining >= 0 && remaining <= 7;
    }).map(j => ({
      id: j.id,
      customerId: j.customerId,
      remainingDays: (() => {
        const start = new Date(j.completedAt as Date);
        const expire = new Date(start); expire.setDate(expire.getDate() + (j.warrantyDays || 0));
        return Math.max(0, Math.ceil((expire.getTime() - now.getTime()) / 86400000));
      })()
    }));

    return { waitingParts, overdue, warrantyExpiring };
  }, [jobs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'checking':
      case 'waiting_parts':
        return 'bg-warning/15 text-warning border-warning/30';
      case 'in_progress':
      case 'testing':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'done':
      case 'delivered':
        return 'bg-success/15 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'รับงาน';
      case 'checking': return 'ตรวจสอบ';
      case 'waiting_parts': return 'รอสินค้า';
      case 'in_progress': return 'กำลังซ่อม';
      case 'testing': return 'ทดสอบ';
      case 'done': return 'เสร็จสิ้น';
      case 'delivered': return 'ส่งมอบ';
      default: return status;
    }
  };

  const doQuickSearch = () => {
    if (!quickQuery.trim()) return;
    // เบื้องต้น: นำทางไปหน้า Jobs เพื่อค้นหาเพิ่มเติม
    window.location.href = '/jobs';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 w-full">
        {/* Header */}

        <PageHeader 
          title="หน้าแรก" 
          description="ภาพรวมและทางลัดการทำงานในระบบ" 
          showActions={true} 
        />


      {/* ===== SIX STATUS CARDS ON TOP (restyled like sample) ===== */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* งานเสร็จวันนี้ */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-emerald-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">งานเสร็จวันนี้</div>
                  <div className="text-4xl font-extrabold text-emerald-700 mt-2">{finance.completedToday}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">งาน</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* งานซ่อมทั้งหมด */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-blue-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">งานซ่อมทั้งหมด</div>
                  <div className="text-4xl font-extrabold text-blue-700 mt-2">{stats.totalJobs}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">งาน</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* รอดำเนินการ */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-amber-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">รอดำเนินการ</div>
                  <div className="text-4xl font-extrabold text-amber-700 mt-2">{stats.pendingJobs}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">งาน</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* กำลังซ่อม */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-indigo-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">กำลังซ่อม</div>
                  <div className="text-4xl font-extrabold text-indigo-700 mt-2">{stats.inProgressJobs}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">งาน</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* เสร็จสิ้นทั้งหมด */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-emerald-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">เสร็จสิ้น</div>
                  <div className="text-4xl font-extrabold text-emerald-700 mt-2">{stats.completedJobs}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">งาน</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* สต็อกต่ำ */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-rose-200/60 shadow-lg h-full min-h-[140px]">
            <CardContent className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground thai-text">สต็อกต่ำ</div>
                  <div className="text-4xl font-extrabold text-rose-700 mt-2">{stats.lowStockParts}</div>
                  <div className="text-sm text-muted-foreground thai-text mt-1">รายการ</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== ALERTS + STOCK/WARRANTY ===== */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="rounded-2xl border-0 shadow-xl bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-600" /> แจ้งเตือนสำคัญ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl border border-rose-200/60 bg-white flex items-center justify-between">
              <div className="thai-text">รออะไหล่</div>
              <div className="font-bold text-rose-700">{alerts.waitingParts.length}</div>
            </div>
            <div className="p-3 rounded-xl border border-amber-200/60 bg-white flex items-center justify-between">
              <div className="thai-text">งานค้างเกิน 7 วัน</div>
              <div className="font-bold text-amber-700">{alerts.overdue.length}</div>
            </div>
            <div className="p-3 rounded-xl border border-emerald-200/60 bg-white flex items-center justify-between">
              <div className="thai-text">ประกันใกล้หมด (≤ 7 วัน)</div>
              <div className="font-bold text-emerald-700">{alerts.warrantyExpiring.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid jobs list */}
        <Card className="rounded-2xl border-0 shadow-xl bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-amber-600" /> งานที่ยังไม่ชำระ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unpaidJobsList.length > 0 ? (
              unpaidJobsList.map(j => (
                <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div className="thai-text text-sm">
                    <div className="font-medium">งาน {j.id}</div>
                    <div className="text-xs text-muted-foreground">{customers.find(c => c.id === j.customerId)?.name || j.customerId}</div>
                  </div>
                  <div className="text-amber-700 font-semibold">{formatCurrency(j.due)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">ไม่มีงานค้างชำระ</div>
            )}
          </CardContent>
        </Card>

        {/* Warranty expiring list */}
        <Card className="rounded-2xl border-0 shadow-xl bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> รับประกันใกล้หมด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.warrantyExpiring.slice(0,5).map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="thai-text text-sm">งาน {w.id}</div>
                <div className="text-emerald-700 font-semibold">เหลือ {w.remainingDays} วัน</div>
              </div>
            ))}
            {alerts.warrantyExpiring.length === 0 && (
              <div className="text-sm text-muted-foreground">ยังไม่มีงานที่ใกล้หมดประกัน</div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <section className="pb-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Jobs - Enhanced Design */}
        <div className="lg:col-span-2">
          <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-border/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold">งานซ่อมล่าสุด</span>
                </div>
                <Link to="/jobs">
                  <Button variant="outline" className="rounded-xl h-9 px-4 text-sm thai-text">ดูทั้งหมด</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-6">
              {recentPageItems.length > 0 ? (
                <div className="space-y-4">
                  {recentPageItems.map((job, index) => (
                    <div key={job.id} className="p-4 rounded-xl border border-border/40 bg-white/90 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-semibold">
                            {recentStart + index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-base thai-text">{job.customerName}</div>
                            <div className="text-xs text-muted-foreground thai-text">{job.deviceModel}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={job.status} />
                          <div className="text-xs text-muted-foreground mt-2">{new Date(job.createdAt).toLocaleDateString('th-TH')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-500/50 dark:text-blue-400/50" />
                  </div>
                  <p className="text-lg font-medium thai-text mb-1">ยังไม่มีงานซ่อม</p>
                  <p className="text-sm thai-text">เริ่มต้นด้วยการสร้างงานซ่อมใหม่</p>
                </div>
              )}
              {/* Pagination controls */}
              {recentTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl h-9 px-3"
                    disabled={recentPage === 1}
                    onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                  >ก่อนหน้า</Button>
                  <div className="text-sm thai-text text-muted-foreground">
                    หน้า {recentPage} / {recentTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl h-9 px-3"
                    disabled={recentPage === recentTotalPages}
                    onClick={() => setRecentPage(p => Math.min(recentTotalPages, p + 1))}
                  >ถัดไป</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar placeholder */}
        <div>
          <Card className="rounded-2xl shadow-xl border-0 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-600" /> ปฏิทิน/นัดหมาย (ตัวอย่าง)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground thai-text">พื้นที่สำหรับแสดงนัดรับเครื่อง/ติดตามลูกค้า/สั่งอะไหล่ ของวันนี้และสัปดาห์นี้</div>
            </CardContent>
          </Card>
        </div>
      </section>

      </div>
    </div>
  );
};

export default Dashboard;