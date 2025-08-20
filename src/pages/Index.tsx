import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  Menu,
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
}

const Index = () => {
  const { sidebarOpen, setSidebarOpen } = useOutletContext<OutletContext>();
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
    <div className="min-h-screen bg-secondary animate-fade-in">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-border shadow-sm w-full">
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent rounded-lg p-2"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="text-sm text-muted-foreground thai-text">หน้าแรก</div>
          </div>
          
          {/* Quick Repair Button in Header */}

        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            แดชบอร์ด
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed thai-text">
            ภาพรวมของร้านซ่อมมือถือ ดูข้อมูลสำคัญและติดตามสถานะงานได้อย่างรวดเร็ว
          </p>
        </div>

      {/* Quick Action Buttons */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-success to-primary rounded-full"></div>
          <h2 className="text-2xl font-semibold text-foreground">การดำเนินการด่วน</h2>
        </div>
        <div className="flex justify-center gap-6">
          <Link to="/jobs/new">
            <Button className="btn-primary text-lg px-6 py-4 h-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <Plus className="w-6 h-6 mr-2" />
              แจ้งซ่อมใหม่
            </Button>
          </Link>
          <Link to="/jobs">
            <Button className="btn-primary text-lg px-6 py-4 h-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <Wrench className="w-6 h-6 mr-2" />
              รายการแจ้งซ่อม
            </Button>
          </Link>
          <Link to="/pricing">
            <Button className="btn-primary text-lg px-6 py-4 h-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <Calculator className="w-6 h-6 mr-2" />
              คำนวณราคา
            </Button>
          </Link>
        </div>
      </div>

      {/* Work Status Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-info to-primary rounded-full"></div>
          <h2 className="text-2xl font-semibold text-foreground">สถานะงาน</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">งานทั้งหมด</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stats.totalJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">ใหม่วันนี้ +0</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ซ่อมเสร็จ</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success mb-1">{stats.completedJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">อัตราสำเร็จ {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">รายได้รวม</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">฿{jobs.reduce((sum, job) => sum + (job.total || 0), 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground thai-text">จากการชำระเงินทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">กำไรสุทธิ</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success mb-1">฿{(jobs.reduce((sum, job) => sum + (job.total || 0), 0) * 0.3).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground thai-text">จากงานที่ชำระแล้ว</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-warning to-primary rounded-full"></div>
          <h2 className="text-2xl font-semibold text-foreground">ตัวชี้วัดธุรกิจ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card-hover border-l-4 border-l-info">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ลูกค้า</CardTitle>
              <div className="p-2 bg-info/10 rounded-lg">
                <Users className="h-5 w-5 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info mb-1">{stats.totalCustomers}</div>
              <p className="text-sm text-muted-foreground thai-text">คน</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">อะไหล่</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-1">{stats.totalParts}</div>
              <p className="text-sm text-muted-foreground thai-text">รายการ</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">สต็อกต่ำ</CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning mb-1">{stats.lowStockParts}</div>
              <p className="text-sm text-muted-foreground thai-text">รายการ</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
            <h2 className="text-2xl font-semibold text-foreground">งานซ่อมล่าสุด</h2>
          </div>
          <Link to="/jobs">
            <Button variant="outline" className="btn-outline">
              <Target className="w-4 h-4 mr-2" />
              ดูทั้งหมด
            </Button>
          </Link>
        </div>
        <Card className="bg-white border border-border shadow-sm">
          <CardContent className="p-6">
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                <p className="text-xl font-medium mb-2 thai-text">ยังไม่มีงานซ่อมในระบบ</p>
                <p className="text-muted-foreground thai-text">เริ่มต้นด้วยการสร้างงานซ่อมใหม่</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job, index) => (
                  <div key={job.id} className="group p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="font-mono text-sm text-primary mb-1">R{String(job.id).padStart(5, '0')}</div>
                          <div className="flex gap-2 mb-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">รับงาน</span>
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">ชำระมัดจำ</span>
                          </div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.customerId} • {job.brand} {job.model}
                          </h4>
                          <p className="text-sm text-muted-foreground thai-text">
                            {job.issueDesc.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">฿{job.total.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
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
