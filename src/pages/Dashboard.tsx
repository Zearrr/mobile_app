// Dashboard with summary cards and recent jobs
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Wrench,
  CheckCircle,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  Eye,
  Edit,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge, PaymentBadge } from '@/components/ui/status-badge';
import { useRepairStore } from '@/stores/useRepairStore';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  trend?: number;
  className?: string;
}

function StatCard({ title, value, description, icon: Icon, trend, className = '' }: StatCardProps) {
  return (
    <Card className={`glass-card shadow-card hover:shadow-glow transition-all duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium thai-text text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {title.includes('กำไร') || title.includes('รายได') ? formatCurrency(value) : value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground thai-text">
          {description}
          {trend && (
            <span className={`ml-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { 
    getDashboardSummary, 
    getFilteredJobs, 
    getCustomerById,
    jobs,
    customers 
  } = useRepairStore();
  
  const [summary, setSummary] = useState(getDashboardSummary());
  const [recentJobs, setRecentJobs] = useState(jobs.slice(0, 8));

  useEffect(() => {
    setSummary(getDashboardSummary());
    setRecentJobs(jobs.slice(0, 8));
  }, [jobs, getDashboardSummary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">แดชบอร์ด</h1>
          <p className="text-muted-foreground thai-text">
            ภาพรวมของงานซ่อมทั้งหมด • {format(new Date(), 'EEEE d MMMM yyyy', { locale: th })}
          </p>
        </div>
        <Button asChild className="btn-gradient">
          <Link to="/jobs/new">
            <Plus className="w-4 h-4 mr-2" />
            แจ้งซ่อมใหม่
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="งานทั้งหมด"
          value={summary.totalJobs}
          description="จำนวนงานซ่อมทั้งหมด"
          icon={Wrench}
        />
        <StatCard
          title="งานเสร็จสิ้น"
          value={summary.completedJobs}
          description="งานที่ซ่อมเสร็จแล้ว"
          icon={CheckCircle}
          className="border-green-200"
        />
        <StatCard
          title="รายได้รวม"
          value={summary.totalRevenue}
          description="จากงานที่ชำระแล้ว"
          icon={CreditCard}
          className="border-blue-200"
        />
        <StatCard
          title="กำไรรวม"
          value={summary.totalProfit}
          description="กำไรสุทธิที่ได้รับ"
          icon={TrendingUp}
          className="border-purple-200"
        />
      </div>

      {/* Alert Cards */}
      {(summary.overdueJobs > 0 || summary.pendingJobs > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.overdueJobs > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-800 thai-text">งานค้างส่ง</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{summary.overdueJobs}</p>
                <p className="text-sm text-red-700 thai-text">งานที่เลยกำหนดส่งแล้ว</p>
              </CardContent>
            </Card>
          )}
          
          {summary.pendingJobs > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-800 thai-text">งานรอดำเนินการ</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{summary.pendingJobs}</p>
                <p className="text-sm text-orange-700 thai-text">งานที่กำลังดำเนินการ</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Jobs */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="thai-text">งานล่าสุด</CardTitle>
              <CardDescription className="thai-text">
                รายการงานซ่อมที่เพิ่งเข้ามา
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link to="/jobs">
                ดูทั้งหมด
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="thai-text">รหัสงาน</TableHead>
                    <TableHead className="thai-text">ลูกค้า</TableHead>
                    <TableHead className="thai-text">อุปกรณ์</TableHead>
                    <TableHead className="thai-text">สถานะงาน</TableHead>
                    <TableHead className="thai-text">สถานะชำระ</TableHead>
                    <TableHead className="thai-text">วันที่รับ</TableHead>
                    <TableHead className="thai-text">ยอดรวม</TableHead>
                    <TableHead className="text-right thai-text">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => {
                    const customer = getCustomerById(job.customerId);
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono font-semibold">
                          {job.id}
                        </TableCell>
                        <TableCell>
                          <div className="thai-text">
                            <div className="font-medium">{customer?.name}</div>
                            <div className="text-sm text-muted-foreground">{customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="thai-text">
                          {job.brand} {job.model}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={job.paymentStatus} />
                        </TableCell>
                        <TableCell className="thai-text">
                          {format(job.receivedAt, 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(job.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/jobs/${job.id}`}>
                                <Eye className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/jobs/${job.id}/edit`}>
                                <Edit className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/print/job/${job.id}`}>
                                <Printer className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="thai-text">ยังไม่มีงานซ่อม</p>
              <Button asChild className="mt-4">
                <Link to="/jobs/new">เริ่มแจ้งซ่อมงานแรก</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}