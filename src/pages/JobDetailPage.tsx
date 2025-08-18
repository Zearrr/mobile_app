import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Printer, CreditCard, Calendar, User, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { useRepairStore } from '@/stores/useRepairStore';
import { formatDate } from '@/lib/utils';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, getCustomerById } = useRepairStore();
  
  const job = id ? getJobById(id) : null;
  const customer = job ? getCustomerById(job.customerId) : null;

  if (!job || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-destructive">ไม่พบงานซ่อม</h1>
            <p className="text-muted-foreground mt-1">งานซ่อมที่ระบุอาจถูกลบหรือไม่มีอยู่</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">ไม่พบงานซ่อมหมายเลข {id}</p>
            <Link to="/jobs">
              <Button>กลับไปรายการงาน</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateRevenue = () => {
    return job.total || (job.estimateParts + job.estimateLabor);
  };

  const calculateCost = () => {
    return (job.costParts || 0) + (job.costLabor || 0);
  };

  const calculateProfit = () => {
    return calculateRevenue() - calculateCost();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">งานซ่อม {job.id}</h1>
            <p className="text-muted-foreground mt-1">รายละเอียดงานซ่อมและสถานะ</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/print/jobs/${job.id}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์ใบแจ้งซ่อม
            </Button>
          </Link>
          <Button className="gap-2">
            <Edit2 className="w-4 h-4" />
            แก้ไข
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลลูกค้า
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ชื่อลูกค้า</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">โทรศัพท์</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                {customer.lineId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Line ID</p>
                    <p className="font-medium">{customer.lineId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                ข้อมูลอุปกรณ์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ยี่ห้อ/รุ่น</p>
                  <p className="font-medium">{job.brand} {job.model}</p>
                </div>
                {job.color && (
                  <div>
                    <p className="text-sm text-muted-foreground">สี</p>
                    <p className="font-medium">{job.color}</p>
                  </div>
                )}
                {job.imei && (
                  <div>
                    <p className="text-sm text-muted-foreground">IMEI</p>
                    <p className="font-medium font-mono">{job.imei}</p>
                  </div>
                )}
                {job.serial && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium font-mono">{job.serial}</p>
                  </div>
                )}
              </div>
              
              {job.lockType !== 'none' && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">รหัสล็อกหน้าจอ</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {job.lockType === 'pin' ? 'PIN' : 'Pattern'}
                      </Badge>
                      {job.lockNote && (
                        <span className="text-sm">{job.lockNote}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">อาการเสีย/ปัญหา</p>
                <p className="mt-1">{job.issueDesc}</p>
              </div>
              
              {job.accessories && (
                <div>
                  <p className="text-sm text-muted-foreground">อุปกรณ์ที่ฝากมาด้วย</p>
                  <p className="mt-1">{job.accessories}</p>
                </div>
              )}
              
              {job.preCheck && (
                <div>
                  <p className="text-sm text-muted-foreground">การตรวจเช็คเบื้องต้น</p>
                  <p className="mt-1">{job.preCheck}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดค่าใช้จ่าย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>ค่าอะไหล่</span>
                  <span className="font-medium">฿{job.estimateParts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าแรง</span>
                  <span className="font-medium">฿{job.estimateLabor.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>รวมทั้งสิ้น</span>
                  <span>฿{calculateRevenue().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>ต้นทุน</span>
                  <span>฿{calculateCost().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>กำไร</span>
                  <span className={calculateProfit() >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    ฿{calculateProfit().toLocaleString()}
                  </span>
                </div>
                {job.deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>มัดจำที่รับ</span>
                    <span className="font-medium">฿{job.deposit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">สถานะงาน</p>
                <StatusBadge status={job.status} />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">สถานะชำระเงิน</p>
                <Badge 
                  variant={
                    job.paymentStatus === 'paid' ? 'default' : 
                    job.paymentStatus === 'deposit' ? 'secondary' : 'outline'
                  }
                >
                  {job.paymentStatus === 'paid' ? 'ชำระแล้ว' :
                   job.paymentStatus === 'deposit' ? 'มัดจำ' : 'ยังไม่ชำระ'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                ไทม์ไลน์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">วันที่รับงาน</p>
                <p className="font-medium">{formatDate(job.receivedAt)}</p>
              </div>
              
              {job.dueAt && (
                <div>
                  <p className="text-sm text-muted-foreground">วันนัดรับ</p>
                  <p className="font-medium">{formatDate(job.dueAt)}</p>
                </div>
              )}
              
              {job.completedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">วันที่เสร็จ</p>
                  <p className="font-medium">{formatDate(job.completedAt)}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">รับประกัน</p>
                <p className="font-medium">{job.warrantyDays} วัน</p>
              </div>
              
              {job.technician && (
                <div>
                  <p className="text-sm text-muted-foreground">ช่างผู้รับผิดชอบ</p>
                  <p className="font-medium">{job.technician}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การกระทำ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-2" variant="outline">
                <Edit2 className="w-4 h-4" />
                เปลี่ยนสถานะงาน
              </Button>
              
              <Button className="w-full gap-2" variant="outline">
                <CreditCard className="w-4 h-4" />
                บันทึกการชำระเงิน
              </Button>
              
              <Link to={`/warranty/${job.id}`} target="_blank">
                <Button className="w-full" variant="outline">
                  ดูหน้าเช็คประกัน
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}