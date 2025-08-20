// Dashboard with summary cards and recent jobs
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  Activity,
  AlertCircle,
  Calculator,
  CheckCircle,
  Clock,
  Package,
  Plus,
  Users,
  Wrench
} from 'lucide-react';
import { useMemo } from 'react';
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

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter(j => j.status === 'received' || j.status === 'checking' || j.status === 'waiting_parts').length;
    const inProgressJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'testing').length;
    const completedJobs = jobs.filter(j => j.status === 'done' || j.status === 'delivered').length;
    const totalCustomers = customers.length;
    const totalParts = parts.length;
    const lowStockParts = parts.filter(p => p.stock <= (p.minStock || 5)).length;

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
      pendingPercent,
      inProgressPercent,
      completedPercent
    };
  }, [jobs, customers, parts]);

  // Get recent jobs (last 5) with customer info
  const recentJobs = useMemo(() => {
    return jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(job => {
        const customer = customers.find(c => c.id === job.customerId);
        return {
          ...job,
          customerName: customer?.name || 'ไม่ระบุ',
          deviceModel: `${job.brand} ${job.model}`
        };
      });
  }, [jobs, customers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
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
      case 'waiting_parts': return 'รออะไหล่';
      case 'in_progress': return 'กำลังซ่อม';
      case 'testing': return 'ทดสอบ';
      case 'done': return 'เสร็จสิ้น';
      case 'delivered': return 'ส่งมอบ';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* ===== HERO HEADER SECTION ===== */}
      <section className="relative mb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>

      </section>

      {/* ===== QUICK ACTIONS SECTION ===== */}
      <section className="mb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* New Repair Job */}
            <Link to="/jobs/new" className="group">
              <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white shadow-2xl hover:shadow-emerald-500/30 transform hover:-translate-y-4 transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Plus className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">แจ้งซ่อมใหม่</h3>
                  <p className="text-white/90 text-lg leading-relaxed thai-text">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
                </div>
              </div>
            </Link>
            
            {/* View All Jobs */}
            <Link to="/jobs" className="group">
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-4 transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Wrench className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">รายการแจ้งซ่อม</h3>
                  <p className="text-white/90 text-lg leading-relaxed thai-text">ดูและจัดการงานซ่อมทั้งหมด</p>
                </div>
              </div>
            </Link>
            
            {/* Price Calculator */}
            <Link to="/pricing" className="group">
              <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-4 transition-all duration-500 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Calculator className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">คำนวณราคา</h3>
                  <p className="text-white/90 text-lg leading-relaxed thai-text">คำนวณราคาและสร้างใบเสนอราคา</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WORK STATUS OVERVIEW SECTION ===== */}
      <section className="mb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-xl"></div>
            <h2 className="text-4xl font-bold text-foreground">ภาพรวมสถานะงานซ่อม</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Total Jobs */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">งานทั้งหมด</CardTitle>
                <div className="p-4 bg-blue-500/15 rounded-2xl group-hover:bg-blue-500/25 transition-all duration-300">
                  <Wrench className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-blue-700 dark:text-blue-300 mb-3">{stats.totalJobs}</div>
                <p className="text-base text-blue-600/70 dark:text-blue-400/70 thai-text">รายการงานทั้งหมด</p>
              </CardContent>
            </Card>

            {/* Pending Jobs */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-amber-700 dark:text-amber-300">รอดำเนินการ</CardTitle>
                <div className="p-4 bg-amber-500/15 rounded-2xl group-hover:bg-amber-500/25 transition-all duration-300">
                  <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-amber-700 dark:text-amber-300 mb-3">{stats.pendingJobs}</div>
                <p className="text-base text-amber-600/70 dark:text-amber-400/70 thai-text">{stats.pendingPercent}% ของงานทั้งหมด</p>
              </CardContent>
            </Card>

            {/* In Progress Jobs */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">กำลังดำเนินการ</CardTitle>
                <div className="p-4 bg-indigo-500/15 rounded-2xl group-hover:bg-indigo-500/25 transition-all duration-300">
                  <Activity className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">{stats.inProgressJobs}</div>
                <p className="text-base text-indigo-600/70 dark:text-indigo-400/70 thai-text">{stats.inProgressPercent}% ของงานทั้งหมด</p>
              </CardContent>
            </Card>

            {/* Completed Jobs */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">เสร็จสิ้น</CardTitle>
                <div className="p-4 bg-emerald-500/15 rounded-2xl group-hover:bg-emerald-500/25 transition-all duration-300">
                  <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-emerald-700 dark:text-emerald-300 mb-3">{stats.completedJobs}</div>
                <p className="text-base text-emerald-600/70 dark:text-emerald-400/70 thai-text">{stats.completedPercent}% ของงานทั้งหมด</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== BUSINESS METRICS SECTION ===== */}
      <section className="mb-20 px-6">
        <div className="max-w-6xl mx-auto">       
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Customers */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/50 dark:to-blue-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">ลูกค้า</CardTitle>
                <div className="p-4 bg-cyan-500/15 rounded-2xl group-hover:bg-cyan-500/25 transition-all duration-300">
                  <Users className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-cyan-700 dark:text-cyan-300 mb-3">{stats.totalCustomers}</div>
                <p className="text-base text-cyan-600/70 dark:text-cyan-400/70 thai-text">คน</p>
              </CardContent>
            </Card>

            {/* Parts */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-violet-700 dark:text-violet-300">อะไหล่</CardTitle>
                <div className="p-4 bg-violet-500/15 rounded-2xl group-hover:bg-violet-500/25 transition-all duration-300">
                  <Package className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-violet-700 dark:text-violet-300 mb-3">{stats.totalParts}</div>
                <p className="text-base text-violet-600/70 dark:text-violet-400/70 thai-text">รายการ</p>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/50">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-5">
                <CardTitle className="text-lg font-semibold text-rose-700 dark:text-rose-300">สต็อกต่ำ</CardTitle>
                <div className="p-4 bg-rose-500/15 rounded-2xl group-hover:bg-rose-500/25 transition-all duration-300">
                  <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl font-bold text-rose-700 dark:text-rose-300 mb-3">{stats.lowStockParts}</div>
                <p className="text-base text-rose-600/70 dark:text-rose-400/70 thai-text">รายการ</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Recent Jobs - Enhanced Design */}
            <div className="lg:col-span-2">
              <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-950/80">
                  <CardTitle className="flex items-center gap-4 text-foreground">
                    <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <span className="text-3xl font-bold">งานล่าสุด</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8">
                  {recentJobs.length > 0 ? (
                    <div className="space-y-6">
                      {recentJobs.map((job, index) => (
                        <div key={job.id} className="group/item p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-300 shadow-sm hover:shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-xl text-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                  {job.customerName}
                                </p>
                                <p className="text-lg text-muted-foreground">{job.deviceModel}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <Badge className={`${getStatusColor(job.status)} font-medium text-base px-4 py-2 rounded-full`}>
                                {getStatusText(job.status)}
                              </Badge>
                              <span className="text-base text-muted-foreground">
                                {new Date(job.createdAt).toLocaleDateString('th-TH')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-muted-foreground">
                      <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                        <Package className="w-12 h-12 text-blue-500/50 dark:text-blue-400/50" />
                      </div>
                      <p className="text-2xl font-medium thai-text mb-3">ยังไม่มีงานซ่อม</p>
                      <p className="text-lg thai-text">เริ่มต้นด้วยการสร้างงานซ่อมใหม่</p>
                    </div>
                  )}
                  <div className="mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
                    <Link to="/jobs">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                        <Wrench className="w-6 h-6 mr-3" />
                        ดูงานทั้งหมด
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar - Enhanced Design */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full shadow-lg"></div>
                <h3 className="text-2xl font-bold text-foreground">การดำเนินการด่วน</h3>
              </div>

              <div className="space-y-6">
                {/* New Repair Job */}
                <Link to="/jobs/new">
                  <div className="group p-6 text-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">แจ้งซ่อมใหม่</h3>
                    <p className="text-white/90 text-base thai-text leading-relaxed">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
                  </div>
                </Link>

                {/* View All Jobs */}
                <Link to="/jobs">
                  <div className="group p-6 text-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Wrench className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">รายการซ่อม</h3>
                    <p className="text-white/90 text-base thai-text leading-relaxed">ดูและจัดการงานซ่อมทั้งหมด</p>
                  </div>
                </Link>

                {/* Customers */}
                <Link to="/customers">
                  <div className="group p-6 text-center bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">ลูกค้า</h3>
                    <p className="text-white/90 text-base thai-text leading-relaxed">จัดการข้อมูลลูกค้า</p>
                  </div>
                </Link>

                {/* Parts */}
                <Link to="/parts">
                  <div className="group p-6 text-center bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl text-white shadow-lg hover:shadow-2xl hover:shadow-violet-500/25 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">อะไหล่</h3>
                    <p className="text-white/90 text-base thai-text leading-relaxed">จัดการสต็อกอะไหล่</p>
                  </div>
                </Link>

                {/* Price Calculator */}
                <Link to="/pricing">
                  <div className="group p-6 text-center bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl text-white shadow-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">คำนวณราคา</h3>
                    <p className="text-white/90 text-base thai-text leading-relaxed">คำนวณราคางานซ่อมและอะไหล่</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;