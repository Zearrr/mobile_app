import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WarrantyNew = () => {
  const { jobs, updateJob, getCustomerById } = useRepairStore();
  const navigate = useNavigate();

  const jobsWithoutCompleted = useMemo(() => {
    return jobs.filter(j => j.status !== 'cancelled');
  }, [jobs]);

  const [jobId, setJobId] = useState('');
  const [imei, setImei] = useState('');
  const [days, setDays] = useState<number>(7);
  const [type, setType] = useState('จอ');
  const [daysByJob, setDaysByJob] = useState<Record<string, number>>({});
  const [typeByJob, setTypeByJob] = useState<Record<string, string>>({});

  const handleSave = async () => {
    if (!jobId) return;
    await updateJob(jobId, { warrantyDays: days, warrantyType: type, serial: imei });
    navigate('/warranty');
  };

  const jobsWithoutWarranty = useMemo(() => {
    return jobs
      .filter(j => !j.warrantyDays || j.warrantyDays <= 0)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [jobs]);

  const handleAddWarranty = async (rowJobId: string) => {
    const d = daysByJob[rowJobId] ?? 7;
    const wt = typeByJob[rowJobId] ?? 'จอ';
    await updateJob(rowJobId, { warrantyDays: d, warrantyType: wt });
    toast({ title: 'บันทึกสำเร็จ', description: `เพิ่มรับประกัน ${d} วัน (${wt})` });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl border-2 border-primary/20 bg-white/80 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2 text-primary" />
            <span className="font-medium">กลับหน้าแรก</span>
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-foreground">เพิ่มข้อมูลการรับประกัน</h1>
          <p className="text-muted-foreground">เพิ่มข้อมูลการรับประกันสำหรับงานซ่อม</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-bold mb-2 text-center">ข้อมูลการรับประกัน</h2>

              <div className="space-y-2">
                <Label htmlFor="job">เลขที่แจ้งซ่อม</Label>
                <select id="job" value={jobId} onChange={(e) => setJobId(e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3">
                  <option value="">เลือกเลขที่แจ้งซ่อม</option>
                  {jobsWithoutCompleted.map(j => (
                    <option key={j.id} value={j.id}>{`R${String(j.id).padStart(5, '0')} - ${j.brand} ${j.model}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imei">IMEI/Serial No.</Label>
                <Input id="imei" value={imei} onChange={(e) => setImei(e.target.value)} placeholder="ใส่หมายเลข IMEI หรือ Serial" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">ระยะเวลาการรับประกัน (วัน)</Label>
                <Input id="days" type="number" min={1} value={days} onChange={(e) => setDays(parseInt(e.target.value || '0'))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">ประเภทการรับประกัน</Label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3">
                  <option value="จอ">จอ</option>
                  <option value="แบตเตอรี่">แบตเตอรี่</option>
                  <option value="กล้อง">กล้อง</option>
                  <option value="เมนบอร์ด">เมนบอร์ด</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl">บันทึกการรับประกัน</Button>
                <Button variant="outline" onClick={() => navigate('/warranty')} className="rounded-xl">กลับหน้าประกัน</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">รายการซ่อมที่ยังไม่มีการรับประกัน</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">เลขที่แจ้งซ่อม</th>
                      <th className="text-left p-3">ลูกค้า</th>
                      <th className="text-left p-3">IMEI/Serial No.</th>
                      <th className="text-left p-3">วันที่ซ่อม</th>
                      <th className="text-left p-3">เพิ่มการรับประกัน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsWithoutWarranty.map(j => (
                      <tr key={j.id} className="border-t border-border/60 hover:bg-accent/40">
                        <td className="p-3 font-mono text-primary">{`R${String(j.id).padStart(5, '0')}`}</td>
                        <td className="p-3">{getCustomerById(j.customerId)?.name || j.customerId}</td>
                        <td className="p-3">{j.imei || j.serial || '-'}</td>
                        <td className="p-3">{new Date(j.receivedAt).toLocaleString('th-TH')}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <select
                              className="h-9 rounded-md border border-border bg-background px-2"
                              value={daysByJob[j.id] ?? 7}
                              onChange={(e) => setDaysByJob(prev => ({ ...prev, [j.id]: parseInt(e.target.value) }))}
                            >
                              {[7, 15, 30, 60, 90].map(d => (
                                <option key={d} value={d}>{d} วัน</option>
                              ))}
                            </select>
                            <select
                              className="h-9 rounded-md border border-border bg-background px-2"
                              value={typeByJob[j.id] ?? 'จอ'}
                              onChange={(e) => setTypeByJob(prev => ({ ...prev, [j.id]: e.target.value }))}
                            >
                              {['จอ', 'แบตเตอรี่', 'กล้อง', 'เมนบอร์ด', 'อื่นๆ'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => handleAddWarranty(j.id)}>เพิ่ม</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobsWithoutWarranty.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">ไม่มีรายการที่ต้องเพิ่มรับประกัน</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WarrantyNew;


