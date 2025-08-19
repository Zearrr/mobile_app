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
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
      case 'testing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="dashboard-stat-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">งานทั้งหมด</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">รายการงาน</p>
            <div className="mt-3 progress-bar">
              <div className="progress-fill bg-blue-500" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">รอดำเนินการ</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.pendingPercent}% ของงานทั้งหมด</p>
            <div className="mt-3 progress-bar">
              <div className="progress-fill bg-orange-500" style={{ width: `${stats.pendingPercent}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">กำลังดำเนินการ</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgressJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.inProgressPercent}% ของงานทั้งหมด</p>
            <div className="mt-3 progress-bar">
              <div className="progress-fill bg-blue-500" style={{ width: `${stats.inProgressPercent}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">เสร็จสิ้น</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedJobs}</div>
            <p className="text-sm text-muted-foreground thai-text mt-1">{stats.completedPercent}% ของงานทั้งหมด</p>
            <div className="mt-3 progress-bar">
              <div className="progress-fill bg-green-500" style={{ width: `${stats.completedPercent}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">รายได้รวม</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground thai-text">บาท</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">ลูกค้า</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
            <p className="text-sm text-muted-foreground thai-text">คน</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">อะไหล่</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalParts}</div>
            <p className="text-sm text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium thai-text text-gray-600">สต็อกต่ำ</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockParts}</div>
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
                <Activity className="h-5 w-5 text-blue-600" />
                งานล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="recent-job-item">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium thai-text text-gray-900">{job.customerName}</p>
                          <p className="text-sm text-gray-600 thai-text">{job.deviceModel}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        <Badge className={`status-badge ${getStatusColor(job.status)} thai-text`}>
                          {getStatusText(job.status)}
                        </Badge>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 thai-text">
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
          <h3 className="text-base sm:text-lg font-semibold thai-text text-gray-900">การดำเนินการด่วน</h3>
          
          <Link to="/jobs/new">
            <Card className="quick-action-card">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-gray-900">แจ้งซ่อมใหม่</h3>
                <p className="thai-text text-muted-foreground text-xs sm:text-sm">สร้างงานซ่อมใหม่สำหรับลูกค้า</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/jobs">
            <Card className="quick-action-card">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <List className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-gray-900">รายการซ่อม</h3>
                <p className="thai-text text-muted-foreground text-xs sm:text-sm">ดูและจัดการงานซ่อมทั้งหมด</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/pricing">
            <Card className="quick-action-card">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold thai-text mb-2 text-gray-900">คำนวณราคา</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">คำนวณราคาและสร้างใบเสนอราคา</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};