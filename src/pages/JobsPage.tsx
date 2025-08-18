import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit2, Printer, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useRepairStore } from '@/stores/useRepairStore';
import { formatDate } from '@/lib/utils';

export function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  const { 
    jobs, 
    customers, 
    getFilteredJobs, 
    getCustomerById, 
    getDashboardSummary,
    setFilters,
    filters
  } = useRepairStore();

  const summary = getDashboardSummary();

  // Apply filters
  React.useEffect(() => {
    setFilters({
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : [statusFilter as any],
      paymentStatus: paymentFilter === 'all' ? undefined : [paymentFilter as any]
    });
  }, [searchTerm, statusFilter, paymentFilter, setFilters]);

  const filteredJobs = getFilteredJobs();

  const calculateRevenue = (job: any) => {
    return job.total || (job.estimateParts + job.estimateLabor);
  };

  const calculateProfit = (job: any) => {
    const revenue = calculateRevenue(job);
    const cost = (job.costParts || 0) + (job.costLabor || 0);
    return revenue - cost;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">รายการงานซ่อม</h1>
          <p className="text-muted-foreground mt-1">จัดการงานซ่อมทั้งหมด</p>
        </div>
        <Link to="/jobs/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            แจ้งซ่อมใหม่
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">งานทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalJobs}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ซ่อมเสร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completedJobs}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายได้รวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{summary.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">กำไรรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ฿{summary.totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ค้นหาเลขที่งาน, ยี่ห้อ, รุ่น, ชื่อลูกค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="received">รับงาน</SelectItem>
                <SelectItem value="in_progress">กำลังซ่อม</SelectItem>
                <SelectItem value="waiting_parts">รออะไหล่</SelectItem>
                <SelectItem value="done">ซ่อมเสร็จ</SelectItem>
                <SelectItem value="returned">คืนแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะชำระ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="unpaid">ยังไม่ชำระ</SelectItem>
                <SelectItem value="deposit">มัดจำ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการงาน ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบงานซ่อม</h3>
              <p className="text-muted-foreground mb-4">ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
              <Link to="/jobs/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างงานใหม่
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>อุปกรณ์</TableHead>
                    <TableHead>อาการ</TableHead>
                    <TableHead>ค่าใช้จ่าย</TableHead>
                    <TableHead>กำไร</TableHead>
                    <TableHead>สถานะงาน</TableHead>
                    <TableHead>สถานะชำระ</TableHead>
                    <TableHead>วันที่รับ</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const customer = getCustomerById(job.customerId);
                    const revenue = calculateRevenue(job);
                    const profit = calculateProfit(job);
                    
                    return (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">{job.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer?.name}</div>
                            <div className="text-sm text-muted-foreground">{customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.brand} {job.model}</div>
                            <div className="text-sm text-muted-foreground">{job.color}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={job.issueDesc}>
                            {job.issueDesc}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ฿{revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className={profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          ฿{profit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              job.paymentStatus === 'paid' ? 'default' : 
                              job.paymentStatus === 'deposit' ? 'secondary' : 'outline'
                            }
                          >
                            {job.paymentStatus === 'paid' ? 'ชำระแล้ว' :
                             job.paymentStatus === 'deposit' ? 'มัดจำ' : 'ยังไม่ชำระ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(job.receivedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link to={`/jobs/${job.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/print/jobs/${job.id}`}>
                              <Button variant="ghost" size="sm">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}