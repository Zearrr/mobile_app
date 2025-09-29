import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, Phone, Printer, Smartphone, User, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ClaimEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, getCustomerById, updateJob } = useRepairStore();
  const navigate = useNavigate();

  const job = useMemo(() => {
    const foundJob = jobs.find(j => j.id === id);
    if (foundJob) return foundJob;
    
    // ข้อมูลตัวอย่างหากไม่พบในฐานข้อมูล
    if (id === '25' || id === '1') {
      return {
        id: id || '25',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        issueDesc: 'แบตบวม',
        status: 'done' as any,
        completedAt: new Date('2025-08-19T02:36:00'),
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
        createdAt: new Date(),
        updatedAt: new Date()
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
    initialProblem: job?.preCheck || 'เปลี่ยนแบตเตอรี่',
    claimReason: job?.issueDesc || 'แบตบวม',
    technicianNotes: 'เริ่มดำเนินการเครม',
    resolution: 'เปลี่ยนแบตใหม่',
    claimStatus: job?.status === 'done' ? 'completed' : 
                job?.status === 'in_progress' ? 'in_progress' : 'pending'
  });

  const [isEditing, setIsEditing] = useState(false);

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
          preCheck: claimData.initialProblem,
          issueDesc: claimData.claimReason,
          status: claimData.claimStatus === 'completed' ? 'done' : 
                  claimData.claimStatus === 'in_progress' ? 'in_progress' : 'received'
        });
        setIsEditing(false);
        // แสดง toast สำเร็จ
        alert('บันทึกข้อมูลเครมสำเร็จ');
      }
    } catch (error) {
      // แสดง toast error
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
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              รายละเอียดเครม #{String(job?.id || '1').replace(/^R?/,'')}
            </h1>
            <p className="text-lg text-gray-300">ข้อมูลเครมและประวัติการดำเนินการ</p>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white hover:bg-gray-700 border-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Button>
            <Link to="/claims">
              <Button variant="outline" className="bg-bull-500 text-white hover:bg-bull-600 border-bull-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าเครม
              </Button>
            </Link>
            <Link to={`/claims/${job?.id}/edit`}>
              <Button 
                variant="outline" 
                className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500"
              >
                แก้ไข
              </Button>
            </Link>
            <Link to={`/print/warranty/${job?.id || '1'}`} target="_blank">
              <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600 border-green-500">
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์ใบเครม
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ข้อมูลเครม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">ข้อมูลเครม</h2>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ชื่อลูกค้า</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{customer?.name || 'Test'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">เบอร์โทรศัพท์</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{customer?.phone || '085-285-4665'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ยี่ห้อและรุ่น</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{job?.brand || 'Apple'} {job?.model || 'iPhone 15 Pro Max'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">รหัสเครม</Label>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-lg">#{String(job?.id || '1').replace(/^R?/,'')}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">อ้างอิงใบซ่อม</Label>
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-lg">{job?.id || '#25'}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">วันที่แจ้งเครม</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{job?.completedAt ? new Date(job.completedAt).toLocaleString('th-TH') : '19/08/2025 02:36 น.'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">วันที่แก้ไขเสร็จ</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{job?.completedAt ? new Date(job.completedAt).toLocaleString('th-TH') : '19/08/2025 02:39 น.'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">สถานะเครม</Label>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <select 
                      value={claimData.claimStatus}
                      onChange={(e) => setClaimData(prev => ({ ...prev, claimStatus: e.target.value as any }))}
                      className="p-2 border rounded-lg"
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="in_progress">กำลังดำเนินการ</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                  ) : (
                    getStatusBadge(claimData.claimStatus)
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* รายละเอียดปัญหาและการดำเนินการ */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">รายละเอียดปัญหาและการดำเนินการ</h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-muted-foreground">ปัญหาการซ่อมครั้งแรก</Label>
                    {isEditing ? (
                      <Textarea 
                        value={claimData.initialProblem}
                        onChange={(e) => setClaimData(prev => ({ ...prev, initialProblem: e.target.value }))}
                        placeholder="ระบุปัญหาการซ่อมครั้งแรก"
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">{claimData.initialProblem || '-'}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-muted-foreground">สาเหตุการเครม</Label>
                    {isEditing ? (
                      <Textarea 
                        value={claimData.claimReason}
                        onChange={(e) => setClaimData(prev => ({ ...prev, claimReason: e.target.value }))}
                        placeholder="ระบุสาเหตุการเครม"
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">{claimData.claimReason || '-'}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-muted-foreground">หมายเหตุช่าง</Label>
                    {isEditing ? (
                      <Textarea 
                        value={claimData.technicianNotes}
                        onChange={(e) => setClaimData(prev => ({ ...prev, technicianNotes: e.target.value }))}
                        placeholder="ระบุหมายเหตุช่าง"
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">{claimData.technicianNotes || '-'}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-muted-foreground">การแก้ไขและผลลัพธ์</Label>
                    {isEditing ? (
                      <Textarea 
                        value={claimData.resolution}
                        onChange={(e) => setClaimData(prev => ({ ...prev, resolution: e.target.value }))}
                        placeholder="ระบุการแก้ไขและผลลัพธ์"
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">{claimData.resolution || '-'}</div>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6">
                  <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-green-600">
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    // รีเซ็ตข้อมูลกลับเป็นค่าเดิม
                    setClaimData({
                      initialProblem: job?.preCheck || 'เปลี่ยนแบตเตอรี่',
                      claimReason: job?.issueDesc || 'แบตบวม',
                      technicianNotes: 'เริ่มดำเนินการเครม',
                      resolution: 'เปลี่ยนแบตใหม่',
                      claimStatus: job?.status === 'done' ? 'completed' : 
                                  job?.status === 'in_progress' ? 'in_progress' : 'pending'
                    });
                  }}>
                    ยกเลิก
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* ข้อมูลการซ่อมเดิม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">ข้อมูลการซ่อมเดิม</h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">เลขที่ใบซ่อม</span>
                  <span className="font-mono font-medium">{job?.id || 'R00025'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">วันที่ซ่อม</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{job?.receivedAt ? new Date(job.receivedAt).toLocaleDateString('th-TH') : '19/08/2025'}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ราคาซ่อม</span>
                  <span className="font-medium">฿ {(job?.total || 2400).toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">สถานะการซ่อม</span>
                  <Badge variant="outline" className="capitalize">{job?.status || 'delivered'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* สถิติการเครม */}
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">สถิติการเครม</h2>
            </div>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1</div>
              <div className="text-sm text-muted-foreground mb-4">จำนวนเครมทั้งหมด</div>
              <Link to="/customers">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  ดูประวัติลูกค้า
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClaimEdit;
