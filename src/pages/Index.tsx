import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Link, useOutletContext } from 'react-router-dom';

interface OutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPageInfo: {
    title: string;
    description: string;
  };
}

const Index = () => {
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
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              แดชบอร์ด
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed thai-text">
            ภาพรวมของร้านซ่อมมือถือ ดูข้อมูลสำคัญและติดตามสถานะงานได้อย่างรวดเร็ว
          </p>
        </div>

      {/* Quick Action Buttons */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">การดำเนินการด่วน</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link to="/jobs/new" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">แจ้งซ่อมใหม่</h3>
              <p className="text-white/85 text-xs">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
            </div>
          </Link>
          
          <Link to="/jobs" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">รายการแจ้งซ่อม</h3>
              <p className="text-white/85 text-xs">ดูและจัดการงานซ่อมทั้งหมด</p>
            </div>
          </Link>
          
          <Link to="/pricing" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-all duration-300">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">คำนวณราคา</h3>
              <p className="text-white/85 text-xs">คำนวณราคาและสร้างใบเสนอราคา</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Work Status Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">สถานะงาน</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/85 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-muted-foreground">งานทั้งหมด</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md">
                <Wrench className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground thai-text">ใหม่วันนี้ +0</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-muted-foreground">ซ่อมเสร็จ</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-success to-success/80 rounded-lg shadow-md">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground thai-text">อัตราสำเร็จ {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-muted-foreground">รายได้รวม</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md">
                <Calculator className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">฿{jobs.reduce((sum, job) => sum + (job.total || 0), 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground thai-text">จากการชำระเงินทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-muted-foreground">กำไรสุทธิ</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-success to-success/80 rounded-lg shadow-md">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">฿{(jobs.reduce((sum, job) => sum + (job.total || 0), 0) * 0.3).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground thai-text">จากงานที่ชำระแล้ว</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-warning via-purple-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">ตัวชี้วัดธุรกิจ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white/85 backdrop-blur-sm border-l-4 border-l-info shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">ลูกค้า</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-info to-info/80 rounded-lg shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-info">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground thai-text">คน</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur-sm border-l-4 border-l-primary shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">อะไหล่</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{stats.totalParts}</div>
              <p className="text-xs text-muted-foreground thai-text">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-white/85 backdrop-blur-sm border-l-4 border-l-warning shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">สต็อกต่ำ</CardTitle>
              <div className="p-2.5 bg-gradient-to-br from-warning to-warning/80 rounded-lg shadow-md">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-warning">{stats.lowStockParts}</div>
              <p className="text-xs text-muted-foreground thai-text">รายการ</p>
            </CardContent>
          </Card>
        </div>
      </div>

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
                          <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-[11px] rounded-full font-medium">รับงาน</span>
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
