import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, ArrowLeft, BarChart3, Phone, Plus, User, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CustomerHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, jobs, getCustomerById, getJobsByCustomer } = useRepairStore();
  const navigate = useNavigate();

  // หากไม่มี id ให้แสดงข้อมูลตัวอย่าง
  const customer = useMemo(() => {
    if (id) {
      return getCustomerById(id);
    }
    // ข้อมูลตัวอย่างตามรูป
    return {
      id: 'sample-customer',
      name: 'Test',
      phone: '085-285-4665',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, [id, getCustomerById]);

  const customerJobs = useMemo(() => {
    if (id) {
      return getJobsByCustomer(id);
    }
    // ข้อมูลตัวอย่างตามรูป - แสดงทั้งการซ่อมและเครม
    return [
      {
        id: '1',
        type: 'claim', // เครม
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        issueDesc: 'แบตบวม',
        status: 'done',
        completedAt: new Date('2025-08-19T02:36:00'),
        total: 0,
        customerId: 'sample-customer',
        receivedAt: new Date('2025-08-19'),
        costParts: 0,
        costLabor: 0,
        deposit: 0,
        profit: 0,
        paymentStatus: 'paid',
        warrantyDays: 30,
        lockType: 'none',
        accessories: '',
        preCheck: 'เปลี่ยนแบตเตอรี่',
        claimReason: 'แบตบวม',
        resolution: 'เปลี่ยนแบตใหม่',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '25',
        type: 'repair', // การซ่อม
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        issueDesc: 'เปลี่ยนแบตเตอรี่',
        status: 'delivered',
        completedAt: new Date('2025-08-19T02:22:00'),
        total: 2400,
        customerId: 'sample-customer',
        receivedAt: new Date('2025-08-19'),
        costParts: 2000,
        costLabor: 400,
        deposit: 0,
        profit: 400,
        paymentStatus: 'paid',
        warrantyDays: 30,
        lockType: 'none',
        accessories: '',
        preCheck: 'แบตเสื่อม',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }, [id, getJobsByCustomer]);

  if (!customer) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="text-center text-muted-foreground">ไม่พบข้อมูลลูกค้า</div>
      </div>
    );
  }

  const totalRepairs = customerJobs.filter(j => (j as any).type === 'repair' || !(j as any).type).length;
  const totalClaims = customerJobs.filter(j => (j as any).type === 'claim').length;
  const claimRate = totalRepairs > 0 ? Math.round((totalClaims / totalRepairs) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header with Color Bar */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">ประวัติลูกค้า</h1>
                <p className="text-lg">{customer.name}</p>
                <p className="text-sm opacity-90">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {customer.phone}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/30 text-white hover:bg-white/10" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าเครม
              </Button>
              <Button variant="outline" className="bg-yellow-500 text-black hover:bg-yellow-600 border-yellow-500">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มเครม
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Customer Stats */}
        <div className="lg:col-span-1">
          {/* สถิติการเครม */}
          <Card className="rounded-xl shadow-lg mb-6">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800">สถิติการเครม</h2>
            </div>
            <CardContent className="p-6 text-center">
              <div className="text-6xl font-bold text-blue-600 mb-3">{totalClaims}</div>
              <div className="text-lg text-muted-foreground mb-6">จำนวนเครมทั้งหมด</div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <User className="w-4 h-4 mr-2" />
                ดูประวัติลูกค้า
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="space-y-4">
            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200/60">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700/80">ครั้งที่ซ่อม</span>
                </div>
                <div className="text-3xl font-extrabold text-blue-700">{totalRepairs}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-red-100 to-red-200 border border-red-200/60">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700/80">ครั้งที่เครม</span>
                </div>
                <div className="text-3xl font-extrabold text-red-700">{totalClaims}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-yellow-100 to-orange-200 border border-orange-200/60">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-orange-700/80">อัตราเครม</span>
                </div>
                <div className="text-3xl font-extrabold text-orange-700">{claimRate}%</div>
              </CardContent>
            </Card>

            {/* ความเสี่ยงสูง Badge */}
            <div className="mt-6">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl text-center">
                <div className="font-bold text-lg mb-1">ความเสี่ยงสูง</div>
                <div className="text-sm opacity-90">ระดับความเสี่ยง</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-3">
          <Card className="rounded-xl shadow-lg">
            <div className="bg-blue-100 p-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                ประวัติการซ่อมและเครม
              </h2>
              <p className="text-sm text-blue-600">เรียงลำดับจากล่าสุด</p>
            </div>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {customerJobs.map((job, index) => {
                  const isRepair = (job as any).type === 'repair' || !(job as any).type;
                  const isClaim = (job as any).type === 'claim';
                  
                  return (
                    <div key={job.id} className={`border-l-4 ${isClaim ? 'border-red-500' : 'border-green-500'} pl-6 relative`}>
                      <div className={`absolute -left-2 top-0 w-4 h-4 ${isClaim ? 'bg-red-500' : 'bg-green-500'} rounded-full`}></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {isClaim ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                เครม #{job.id}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <Wrench className="w-3 h-3 mr-1" />
                                การซ่อม #{job.id}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {job.completedAt ? new Date(job.completedAt).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : isClaim ? '19/08/2025 02:36' : '19/08/2025 02:22'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {isClaim && (
                              <div>
                                <strong>อ้างอิงใบซ่อม:</strong> #25
                              </div>
                            )}
                            <div>
                              <strong>เครื่อง:</strong> {job.brand} {job.model}
                            </div>
                            
                            {isClaim ? (
                              <>
                                <div>
                                  <strong>ปัญหาเดิม:</strong> {job.preCheck || 'เปลี่ยนแบตเตอรี่'}
                                </div>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <strong>สาเหตุเครม:</strong> 
                                    <span className="text-red-600 ml-1">{job.claimReason || job.issueDesc || 'แบตบวม'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <strong>สถานะ:</strong>
                                    <Badge className="bg-green-600 text-white ml-1">เสร็จสิ้น</Badge>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <strong>การแก้ไข:</strong> <span className="text-green-600">{job.resolution || 'เปลี่ยนแบตใหม่'}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <strong>ปัญหา:</strong> {job.issueDesc || 'เปลี่ยนแบตเตอรี่'}
                                </div>
                                <div>
                                  <strong>ราคา:</strong> {job.total ? `${job.total.toLocaleString()} บาท` : '2,400 บาท'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <strong>สถานะ:</strong>
                                  <Badge variant="outline" className="ml-1 capitalize">{job.status || 'delivered'}</Badge>
                                </div>
                              </>
                            )}
                          </div>

                          {isClaim && (
                            <div className="mt-4">
                              <Link to={`/claims/1`}>
                                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                  ดูรายละเอียด
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {customerJobs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    ไม่มีประวัติการซ่อมหรือเครม
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;
