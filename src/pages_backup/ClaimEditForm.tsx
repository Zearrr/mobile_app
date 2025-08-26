import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, Clock, Eye, Pencil, Phone, User, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ClaimEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, getCustomerById, updateJob } = useRepairStore();
  const navigate = useNavigate();

  const job = useMemo(() => {
    const foundJob = jobs.find(j => j.id === id);
    if (foundJob) return foundJob;
    
    // ข้อมูลตัวอย่างหากไม่พบในฐานข้อมูล
    if (id === '25' || id === '1') {
      return {
        id: id || '1',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        issueDesc: 'แบตบวม',
        status: 'done' as any,
        completedAt: new Date('2025-08-19T02:39:00'),
        total: 2400,
        customerId: 'sample-customer',
        receivedAt: new Date('2025-08-19'),
        costParts: 2000,
        costLabor: 400,
        deposit: 0,
        profit: 400,
        paymentStatus: 'paid' as any,
        warrantyDays: 30,
        lockType: 'none' as any,
        accessories: '',
        preCheck: 'เปลี่ยนแบตเตอรี่',
        createdAt: new Date('2025-08-19T02:36:00'),
        updatedAt: new Date('2025-08-19T02:39:00')
      } as any;
    }
    return null;
  }, [jobs, id]);

  const customer = useMemo(() => {
    if (job && job.customerId) {
      const foundCustomer = getCustomerById(job.customerId);
      if (foundCustomer) return foundCustomer;
      
      // ข้อมูลลูกค้าตัวอย่าง
      return {
        id: 'sample-customer',
        name: 'Test',
        phone: '085-285-4665',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return null;
  }, [job, getCustomerById]);

  // State สำหรับข้อมูลเครม
  const [claimData, setClaimData] = useState({
    claimStatus: job?.status === 'done' ? 'completed' : 
                job?.status === 'in_progress' ? 'in_progress' : 'pending',
    technicianNotes: 'เริ่มดำเนินการเครม',
    resolution: 'เปลี่ยนแบตใหม่'
  });

  if (!job || !customer) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="text-center text-muted-foreground">ไม่พบข้อมูลเครม</div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      if (job) {
        await updateJob(job.id, {
          status: claimData.claimStatus === 'completed' ? 'done' : 
                  claimData.claimStatus === 'in_progress' ? 'in_progress' : 'received',
          updatedAt: new Date()
        });
        alert('บันทึกการเปลี่ยนแปลงสำเร็จ');
        navigate(`/claims/${job.id}`);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 text-white flex items-center gap-1"><CheckCircle className="w-3 h-3" />เสร็จสิ้น</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500 text-white flex items-center gap-1">กำลังดำเนินการ</Badge>;
      default:
        return <Badge className="bg-rose-500 text-white flex items-center gap-1">รอดำเนินการ</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header with Color Bar */}
      <div className="mb-6">
        <div className="bg-gray-800 text-white p-6 rounded-t-xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <Pencil className="w-8 h-8 text-yellow-400" />
              แก้ไขเครม #{String(job.id).replace(/^R?/,'')}
            </h1>
            <p className="text-lg text-gray-300">อัพเดทสถานะและรายละเอียดการดำเนินการ</p>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <Link to="/claims">
              <Button variant="outline" className="bg-bull-300 text-white hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าเครม
              </Button>
            </Link>
            <Link to={`/claims/${job.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                ดูรายละเอียด
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Claim Information and Original Problem */}
        <div className="lg:col-span-1 space-y-6">
          {/* ข้อมูลเครม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">ข้อมูลเครม</h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">รหัสเครม</Label>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-lg">#{String(job.id).replace(/^R?/,'')}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ลูกค้า</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">เบอร์โทรศัพท์</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">เครื่อง</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Wrench className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{job.brand} {job.model}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">อ้างอิงใบซ่อม</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Link to={`/jobs/25`} className="text-blue-600 hover:underline">#25</Link>
                    <div className="text-sm text-muted-foreground mt-1">วันที่ซ่อม: 19/08/2025</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">วันที่แจ้งเครม</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>19/08/2025 02:36 น.</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">สถานะปัจจุบัน</Label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(claimData.claimStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ปัญหาเดิม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-yellow-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ปัญหาเดิม
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ปัญหาการซ่อมครั้งแรก</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">เปลี่ยนแบตเตอรี่</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">สาเหตุการเครม</Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-red-600">แบตบวม</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Update Claim Information and Update History */}
        <div className="lg:col-span-2 space-y-6">
          {/* อัพเดทข้อมูลเครม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-yellow-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                อัพเดทข้อมูลเครม
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">สถานะเครม</Label>
                  <Select 
                    value={claimData.claimStatus} 
                    onValueChange={(value) => setClaimData(prev => ({ ...prev, claimStatus: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">รอดำเนินการ</SelectItem>
                      <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">วันที่แก้ไขเสร็จ</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    19/08/2025 02:39 น.
                  </div>
                  <p className="text-xs text-muted-foreground">
                    จะอัพเดทอัตโนมัติเมื่อเปลี่ยนสถานะเป็น "เสร็จสิ้น"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">หมายเหตุช่าง</Label>
                  <Textarea 
                    value={claimData.technicianNotes}
                    onChange={(e) => setClaimData(prev => ({ ...prev, technicianNotes: e.target.value }))}
                    placeholder="บันทึกการตรวจสอบ, การวินิจฉัย, หรือขั้นตอนการแก้ไข... เริ่มดำเนินการเครม"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">รายละเอียดการแก้ไข</Label>
                  <Textarea 
                    value={claimData.resolution}
                    onChange={(e) => setClaimData(prev => ({ ...prev, resolution: e.target.value }))}
                    placeholder="อธิบายว่าแก้ไขปัญหาอย่างไร, เปลี่ยนอะไรบ้าง, หรือผลลัพธ์... เปลี่ยนแบตใหม่"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    การอัพเดทจะบันทึกเวลาและผู้ดำเนินการอัตโนมัติ
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="bg-yellow-600 hover:bg-yellow-700">
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                  <Link to={`/claims/${job.id}`}>
                    <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ประวัติการอัพเดท */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-gray-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                ประวัติการอัพเดท
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">สร้างเครม</span>
                  </div>
                  <span className="text-sm text-muted-foreground">19/08/2025 02:36 น.</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">อัพเดทล่าสุด</span>
                  </div>
                  <span className="text-sm text-muted-foreground">19/08/2025 02:39 น.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClaimEditForm;
