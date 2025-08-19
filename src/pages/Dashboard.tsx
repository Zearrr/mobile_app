// Dashboard with summary cards and recent jobs
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle,
    Clock,
    Package,
    TrendingUp,
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

    return {
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobs,
      totalRevenue,
      totalCustomers,
      totalParts,
      lowStockParts
    };
  }, [jobs, customers, parts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text">แดชบอร์ด</h1>
        <p className="thai-text text-muted-foreground text-lg">
          ภาพรวมของระบบร้านซ่อมมือถือ
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="outline" className="thai-text">
              <ArrowRight className="w-4 h-4 mr-2" />
              กลับไปหน้าแรก
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">งานทั้งหมด</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">รอดำเนินการ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">กำลังดำเนินการ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressJobs}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">เสร็จสิ้น</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">รายได้รวม</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground thai-text">บาท</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">ลูกค้า</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground thai-text">คน</p>
              </CardContent>
            </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">อะไหล่</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.totalParts}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
              </CardContent>
            </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">สต็อกต่ำ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockParts}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/jobs/new">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Wrench className="w-8 h-8 text-primary" />
                          </div>
              <h3 className="text-xl font-semibold thai-text mb-2">แจ้งซ่อมใหม่</h3>
              <p className="thai-text text-muted-foreground">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
            </CardContent>
          </Card>
                              </Link>

        <Link to="/jobs">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold thai-text mb-2">รายการซ่อม</h3>
              <p className="thai-text text-muted-foreground">ดูและจัดการงานซ่อมทั้งหมด</p>
            </CardContent>
          </Card>
                              </Link>

        <Link to="/pricing">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-green-500" />
                          </div>
              <h3 className="text-xl font-semibold thai-text mb-2">คำนวณราคา</h3>
              <p className="thai-text text-muted-foreground">คำนวณราคาและสร้างใบเสนอราคา</p>
        </CardContent>
      </Card>
        </Link>
      </div>
    </div>
  );
};