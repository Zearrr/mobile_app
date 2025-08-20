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
import { Link } from 'react-router-dom';

export const Dashboard = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              แดชบอร์ด
            </h1>
            <p className="text-lg text-muted-foreground thai-text">
              ภาพรวมของระบบร้านซ่อมมือถือ ดูข้อมูลสำคัญและติดตามสถานะงานได้อย่างรวดเร็ว
            </p>
          </div>
          <Link to="/jobs/new">
            <Button className="btn-primary text-lg px-6 py-4 h-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <Plus className="w-6 h-6 mr-2" />
              แจ้งซ่อมใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Repair Button - Prominent */}
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
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
          <h2 className="text-2xl font-semibold text-foreground">สถานะงาน</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">งานทั้งหมด</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stats.totalJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">รายการงาน</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">รอดำเนินการ</CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning mb-1">{stats.pendingJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">{stats.pendingPercent}% ของงานทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">กำลังดำเนินการ</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stats.inProgressJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">{stats.inProgressPercent}% ของงานทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">เสร็จสิ้น</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success mb-1">{stats.completedJobs}</div>
              <p className="text-sm text-muted-foreground thai-text">{stats.completedPercent}% ของงานทั้งหมด</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-info to-primary rounded-full"></div>
          <h2 className="text-2xl font-semibold text-foreground">ตัวชี้วัดธุรกิจ</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card className="glass-card-hover">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-background">
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                <Activity className="h-6 w-6 text-primary" />
                งานล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job, index) => (
                    <div key={job.id} className="group p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {job.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">{job.deviceModel}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${getStatusColor(job.status)} font-medium`}>
                            {getStatusText(job.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium thai-text">ยังไม่มีงานซ่อม</p>
                  <p className="text-sm thai-text">เริ่มต้นด้วยการสร้างงานซ่อมใหม่</p>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border/50">
                <Link to="/jobs">
                  <Button className="w-full btn-primary">
                    <Wrench className="w-4 h-4 mr-2" />
                    ดูงานทั้งหมด
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-success to-primary rounded-full"></div>
            <h3 className="text-lg font-semibold text-foreground">การดำเนินการด่วน</h3>
          </div>

          <div className="space-y-4">
            <Link to="/jobs/new">
              <div className="group p-4 text-center action-tile action-success hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">แจ้งซ่อมใหม่</h3>
                <p className="text-white/90 text-xs thai-text">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
              </div>
            </Link>

            <Link to="/jobs">
              <div className="group p-4 text-center action-tile action-primary hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">รายการซ่อม</h3>
                <p className="text-white/90 text-xs thai-text">ดูและจัดการงานซ่อมทั้งหมด</p>
              </div>
            </Link>

            <Link to="/customers">
              <div className="group p-4 text-center action-tile action-warning hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">ลูกค้า</h3>
                <p className="text-white/90 text-xs thai-text">จัดการข้อมูลลูกค้า</p>
              </div>
            </Link>

            <Link to="/parts">
              <div className="group p-4 text-center action-tile action-danger hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">อะไหล่</h3>
                <p className="text-white/90 text-xs thai-text">จัดการสต็อกอะไหล่</p>
              </div>
            </Link>

            <Link to="/calculator">
              <div className="group p-4 text-center action-tile action-info hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">คำนวณราคา</h3>
                <p className="text-white/90 text-xs thai-text">คำนวณราคางานซ่อมและอะไหล่</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};