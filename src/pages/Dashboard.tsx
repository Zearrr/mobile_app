// Dashboard with summary cards and recent jobs
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Calculator,
    CheckCircle,
    Clock,
    DollarSign,
    List,
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
    const totalRevenue = jobs.filter(j => j.status === 'delivered').reduce((sum, j) => sum + j.total, 0);
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
      totalRevenue,
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
        return 'bg-warning/15 text-warning-foreground border-warning/30';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">แดชบอร์ด</h1>
        <p className="thai-text text-muted-foreground text-base sm:text-lg">
          ภาพรวมของระบบร้านซ่อมมือถือ
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="outline" className="thai-text hover:bg-primary hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4 mr-2" />
              กลับไปหน้าแรก
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Cards – light glass style to match the rest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="glass-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">งานทั้งหมด</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">รายการงาน</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">รอดำเนินการ</CardTitle>
            <div className="p-2 bg-warning/15 rounded-lg">
              <Clock className="h-5 w-5 text-warning-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning-foreground">{stats.pendingJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.pendingPercent}% ของงานทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">กำลังดำเนินการ</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.inProgressJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.inProgressPercent}% ของงานทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">เสร็จสิ้น</CardTitle>
            <div className="p-2 bg-success/15 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.completedJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.completedPercent}% ของงานทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats – light glass style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="glass-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">รายได้รวม</CardTitle>
            <div className="p-2 bg-success/15 rounded-lg">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">฿{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground thai-text">บาท</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">ลูกค้า</CardTitle>
            <div className="p-2 bg-purple/15 rounded-lg">
              <Users className="h-5 w-5 text-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple">{stats.totalCustomers}</div>
            <p className="text-sm text-muted-foreground thai-text">คน</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">อะไหล่</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalParts}</div>
            <p className="text-sm text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-muted-foreground">สต็อกต่ำ</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockParts}</div>
            <p className="text-sm text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="thai-text flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                งานล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="recent-job-item">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium thai-text text-foreground">{job.customerName}</p>
                          <p className="text-sm text-muted-foreground thai-text">{job.deviceModel}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        <Badge className={`status-badge ${getStatusColor(job.status)} thai-text`}>
                          {getStatusText(job.status)}
                        </Badge>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground thai-text">
                  ยังไม่มีงานซ่อม
                </div>
              )}
              <div className="mt-4">
                <Link to="/jobs">
                  <Button variant="outline" className="w-full thai-text">
                    <List className="w-4 h-4 mr-2" />
                    ดูงานทั้งหมด
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold thai-text text-foreground">การดำเนินการด่วน</h3>

          <Link to="/jobs/new">
            <div className="action-tile action-success p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/15 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-white">แจ้งซ่อมใหม่</h3>
              <p className="thai-text text-white/90 text-xs sm:text-sm">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
            </div>
          </Link>

          <Link to="/jobs">
            <div className="action-tile action-info p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/15 rounded-full flex items-center justify-center">
                <List className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-white">รายการซ่อม</h3>
              <p className="thai-text text-white/90 text-xs sm:text-sm">ดูและจัดการงานซ่อมทั้งหมด</p>
            </div>
          </Link>

          <Link to="/pricing">
            <div className="action-tile action-primary p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/15 rounded-full flex items-center justify-center">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-white">คำนวณราคา</h3>
              <p className="text-white/90 text-xs sm:text-sm">คำนวณราคาและสร้างใบเสนอราคา</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};