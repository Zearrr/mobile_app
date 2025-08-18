import { useParams } from 'react-router-dom';
import { Shield, Calendar, Smartphone, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useRepairStore } from '@/stores/useRepairStore';
import { formatDate, formatDateOnly } from '@/lib/utils';

export function WarrantyPublicPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { getJobById, getCustomerById, settings } = useRepairStore();
  
  const job = jobId ? getJobById(jobId) : null;
  const customer = job ? getCustomerById(job.customerId) : null;

  if (!job || !customer) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">ไม่พบงานซ่อม</h1>
            <p className="text-muted-foreground">
              ไม่พบงานซ่อมหมายเลข {jobId} กรุณาตรวจสอบหมายเลขอีกครั้ง
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const warrantyEndDate = new Date(job.receivedAt);
  warrantyEndDate.setDate(warrantyEndDate.getDate() + job.warrantyDays);
  
  const isWarrantyActive = new Date() <= warrantyEndDate;
  const daysLeft = Math.ceil((warrantyEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusIcon = () => {
    switch (job.status) {
      case 'done':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'received':
        return 'รับงานแล้ว';
      case 'in_progress':
        return 'กำลังซ่อม';
      case 'waiting_parts':
        return 'รออะไหล่';
      case 'done':
        return 'ซ่อมเสร็จแล้ว';
      case 'returned':
        return 'คืนเครื่องแล้ว';
      case 'cancelled':
        return 'ยกเลิกงาน';
      default:
        return job.status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{settings?.storeName || 'Mobile Repair Pro'}</h1>
            <p className="text-muted-foreground">ตรวจสอบสถานะงานซ่อมและการรับประกัน</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        {/* Job Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <div className="text-2xl font-bold">งานซ่อม {job.id}</div>
                <div className="text-lg text-muted-foreground">{getStatusText()}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  ข้อมูลลูกค้า
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>ชื่อ:</strong> {customer.name.slice(0, 3)}***</div>
                  <div><strong>โทรศัพท์:</strong> {customer.phone.slice(0, 3)}***{customer.phone.slice(-4)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  ข้อมูลอุปกรณ์
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>อุปกรณ์:</strong> {job.brand} {job.model}</div>
                  {job.color && <div><strong>สี:</strong> {job.color}</div>}
                  {job.imei && (
                    <div><strong>IMEI:</strong> {job.imei.slice(0, 8)}***{job.imei.slice(-4)}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty Status */}
        <Card className={isWarrantyActive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isWarrantyActive ? 'text-green-600' : 'text-red-600'}`} />
              สถานะการรับประกัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">
                  {job.warrantyDays} วัน
                </div>
                <div className="text-sm text-muted-foreground">ระยะเวลารับประกัน</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold">
                  {formatDateOnly(warrantyEndDate)}
                </div>
                <div className="text-sm text-muted-foreground">วันหมดประกัน</div>
              </div>
              
              <div className="text-center">
                <Badge 
                  variant={isWarrantyActive ? 'default' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {isWarrantyActive 
                    ? `เหลือ ${daysLeft} วัน` 
                    : 'หมดประกันแล้ว'
                  }
                </Badge>
              </div>
            </div>
            
            {isWarrantyActive && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-green-800 mb-2">การรับประกันครอบคลุม:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• งานซ่อมที่ดำเนินการในครั้งนี้</li>
                  <li>• อะไหล่ที่เปลี่ยนใหม่</li>
                  <li>• ค่าแรงในการซ่อมแซม</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ไทม์ไลน์งานซ่อม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <div className="font-medium">รับงาน</div>
                  <div className="text-sm text-muted-foreground">{formatDate(job.receivedAt)}</div>
                </div>
              </div>
              
              {job.status === 'in_progress' && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">กำลังซ่อม</div>
                    <div className="text-sm text-muted-foreground">งานอยู่ระหว่างดำเนินการ</div>
                  </div>
                </div>
              )}
              
              {job.status === 'waiting_parts' && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">รออะไหล่</div>
                    <div className="text-sm text-muted-foreground">กำลังรออะไหล่เข้ามา</div>
                  </div>
                </div>
              )}
              
              {job.completedAt && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">ซ่อมเสร็จ</div>
                    <div className="text-sm text-muted-foreground">{formatDate(job.completedAt)}</div>
                  </div>
                </div>
              )}
              
              {job.dueAt && job.status !== 'done' && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <div className="font-medium text-gray-600">กำหนดเสร็จ</div>
                    <div className="text-sm text-muted-foreground">{formatDate(job.dueAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>ติดต่อเรา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {settings?.phone && (
                <div>
                  <strong>โทรศัพท์:</strong> {settings.phone}
                </div>
              )}
              
              {settings?.line && (
                <div>
                  <strong>Line:</strong> {settings.line}
                </div>
              )}
              
              {settings?.address && (
                <div className="md:col-span-2">
                  <strong>ที่อยู่:</strong> {settings.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>หากมีข้อสงสัยเกี่ยวกับการรับประกัน กรุณาติดต่อร้านโดยตรง</p>
          <p className="mt-1">นำใบแจ้งซ่อมมาด้วยทุกครั้งที่มาใช้บริการ</p>
        </div>
      </div>
    </div>
  );
}