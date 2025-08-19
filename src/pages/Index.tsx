import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

      {/* Quick Actions as compact buttons */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">การดำเนินการด่วน</CardTitle>
          <CardDescription className="thai-text">เลือกการทำงานที่ต้องการอย่างรวดเร็ว</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to="/jobs/new">
              <Button className="btn-soft w-full justify-center py-6 text-base">
                <Smartphone className="w-5 h-5 mr-2" /> แจ้งซ่อมใหม่
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="w-full justify-center py-6 text-base">
                <List className="w-5 h-5 mr-2" /> รายการซ่อม
              </Button>
            </Link>
            <Link to="/pricing">
              <Button className="btn-gradient w-full justify-center py-6 text-base">
                <Calculator className="w-5 h-5 mr-2" /> คำนวณราคา
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats – unified colored tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-tile stat-primary">
          <div className="stat-title"><Wrench className="w-4 h-4" /> งานทั้งหมด</div>
          <div className="stat-value">{stats.totalJobs}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>

        <div className="stat-tile stat-warning">
          <div className="stat-title"><Clock className="w-4 h-4" /> รอดำเนินการ</div>
          <div className="stat-value">{stats.pendingJobs}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>

        <div className="stat-tile stat-info">
          <div className="stat-title"><AlertCircle className="w-4 h-4" /> กำลังดำเนินการ</div>
          <div className="stat-value">{stats.inProgressJobs}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>

        <div className="stat-tile stat-success">
          <div className="stat-title"><CheckCircle className="w-4 h-4" /> เสร็จสิ้น</div>
          <div className="stat-value">{stats.completedJobs}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>
      </div>

      {/* Additional Stats – colored tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-tile stat-success">
          <div className="stat-title"><TrendingUp className="w-4 h-4" /> รายได้รวม</div>
          <div className="stat-value">฿{stats.totalRevenue.toLocaleString()}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>

        <div className="stat-tile stat-primary">
          <div className="stat-title"><Users className="w-4 h-4" /> ลูกค้า</div>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="opacity-80 thai-text text-sm">คน</div>
        </div>

        <div className="stat-tile stat-info">
          <div className="stat-title"><Package className="w-4 h-4" /> อะไหล่</div>
          <div className="stat-value">{stats.totalParts}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>

        <div className="stat-tile stat-danger">
          <div className="stat-title"><AlertCircle className="w-4 h-4" /> สต็อกต่ำ</div>
          <div className="stat-value">{stats.lowStockParts}</div>
          <div className="opacity-80 thai-text text-sm">รายการ</div>
        </div>
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
