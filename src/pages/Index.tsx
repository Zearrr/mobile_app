import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import {
    AlertCircle,
    Calculator,
    CheckCircle,
    Clock,
    List,
    Package,
    Smartphone,
    TrendingUp,
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
        <h1 className="text-3xl font-bold gradient-text">ระบบแจ้งซ่อมมือถือ</h1>
        <p className="thai-text text-muted-foreground text-lg">
          จัดการงานซ่อมมือถืออย่างเป็นระบบและมีประสิทธิภาพ
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/jobs/new">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Smartphone className="w-8 h-8 text-primary" />
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
                <List className="w-8 h-8 text-blue-500" />
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
                <Calculator className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold thai-text mb-2">คำนวณราคา</h3>
              <p className="thai-text text-muted-foreground">คำนวณราคาและสร้างใบเสนอราคา</p>
            </CardContent>
          </Card>
        </Link>
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

      {/* Recent Jobs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">งานล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 thai-text text-muted-foreground">
              ยังไม่มีงานซ่อมในระบบ
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium thai-text">{job.brand} {job.model}</h4>
                      <p className="text-sm text-muted-foreground thai-text">
                        {job.customerId} • {job.issueDesc.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium thai-text">฿{job.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground thai-text">
                      {new Date(job.receivedAt).toLocaleDateString('th-TH')}
                    </div>
      </div>
                </div>
              ))}
            </div>
          )}
          {jobs.length > 5 && (
            <div className="mt-4 text-center">
              <Link to="/jobs">
                <Button variant="outline" className="thai-text">ดูงานทั้งหมด</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
