import { PageHeader } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRepairStore } from '@/stores/useRepairStore';
import { CheckCircle, Clock, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Warranty = () => {
  const { jobs, getCustomerById } = useRepairStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  // Advanced search fields
  const [codeQuery, setCodeQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [imeiQuery, setImeiQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');

  const today = new Date();

  const warranties = useMemo(() => {
    return jobs
      .filter(j => j.completedAt)
      .map(j => {
        const start = new Date(j.completedAt as Date);
        const end = new Date(start);
        end.setDate(end.getDate() + (j.warrantyDays || 0));

        const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const active = remainingDays >= 0;

        return {
          id: j.id,
          code: `R${String(j.id).padStart(5, '0')}`,
          customerId: j.customerId,
          device: `${j.brand} ${j.model}`,
          completedAt: start,
          warrantyDays: j.warrantyDays,
          end,
          remainingDays,
          active,
        };
      })
      .filter(w => (showActiveOnly ? w.active : true))
      .filter(w =>
        `${w.code} ${w.customerId} ${w.device}`.toLowerCase().includes(query.toLowerCase())
      )
      .filter(w => (codeQuery ? w.id.toLowerCase().includes(codeQuery.toLowerCase()) || w.code.toLowerCase().includes(codeQuery.toLowerCase()) : true))
      .filter(w => (nameQuery ? (getCustomerById(w.customerId)?.name || '').toLowerCase().includes(nameQuery.toLowerCase()) : true))
      .filter(w => (imeiQuery ? (jobs.find(j => j.id === w.id)?.imei || jobs.find(j => j.id === w.id)?.serial || '').toLowerCase().includes(imeiQuery.toLowerCase()) : true))
      .filter(w => (phoneQuery ? (getCustomerById(w.customerId)?.phone || '').includes(phoneQuery) : true))
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }, [jobs, query, showActiveOnly, codeQuery, nameQuery, imeiQuery, phoneQuery, getCustomerById]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="รับประกัน" 
        description="รายการงานที่อยู่ในช่วงรับประกันและรายละเอียดที่เกี่ยวข้อง"
        icon={ShieldCheck}
        actions={(
          <>
            <Link to="/claims">
              <Button variant="ghost" className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 px-4 py-2 shadow-lg">
                จัดการเครมการซ่อม
              </Button>
            </Link>
            <Link to="/warranty/new">
              <Button variant="ghost" className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 px-4 py-2 shadow-lg">
                เพิ่มข้อมูลการรับประกัน
              </Button>
            </Link>
          </>
        )}
      />

      {/* Warranty Check */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-4 text-xl font-bold flex items-center gap-2"><Search className="w-5 h-5" /> ตรวจสอบการรับประกัน</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">เลขที่แจ้งซ่อม</label>
              <Input value={codeQuery} onChange={(e) => setCodeQuery(e.target.value)} placeholder="เช่น R00001" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">ชื่อลูกค้า</label>
              <Input value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} placeholder="เช่น สมชาย" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">IMEI/Serial No.</label>
              <Input value={imeiQuery} onChange={(e) => setImeiQuery(e.target.value)} placeholder="เช่น 12345…" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">เบอร์โทรศัพท์</label>
              <Input value={phoneQuery} onChange={(e) => setPhoneQuery(e.target.value)} placeholder="เช่น 0812345678" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button><Search className="w-4 h-4 mr-2" />ค้นหา</Button>
            <Button variant="outline" onClick={() => { setCodeQuery(''); setNameQuery(''); setImeiQuery(''); setPhoneQuery(''); }}>ล้างการค้นหา</Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">สามารถค้นหาด้วยข้อมูลบางส่วนได้ (ไม่จำเป็นต้องใส่ข้อมูลทั้งหมด)</div>
        </CardContent>
      </Card>

      

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">อยู่ในประกัน</div>
                <div className="text-3xl font-extrabold text-emerald-600">{warranties.filter(w => w.active).length}</div>
                <div className="text-xs text-muted-foreground">รายการ</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">ใกล้หมดประกัน (&lt;= 7 วัน)</div>
                <div className="text-3xl font-extrabold text-amber-600">{warranties.filter(w => w.remainingDays <= 7 && w.remainingDays >= 0).length}</div>
                <div className="text-xs text-muted-foreground">รายการ</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">หมดประกัน</div>
                <div className="text-3xl font-extrabold text-slate-700">{jobs.filter(j => j.completedAt && (new Date(j.completedAt as Date)).getTime() + (j.warrantyDays||0)*86400000 < today.getTime()).length}</div>
                <div className="text-xs text-muted-foreground">รายการ</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-secondary-foreground/90">
                <tr>
                  <th className="text-left p-3">รหัส</th>
                  <th className="text-left p-3">ลูกค้า</th>
                  <th className="text-left p-3">อุปกรณ์</th>
                  <th className="text-left p-3">เสร็จเมื่อ</th>
                  <th className="text-left p-3">วันรับประกัน</th>
                  <th className="text-left p-3">หมดประกัน</th>
                  <th className="text-left p-3">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {warranties.map(w => (
                  <tr key={w.id} className="border-t border-border hover:bg-accent">
                    <td className="p-3 font-mono text-primary">{w.code}</td>
                    <td className="p-3">
                      <div className="font-medium">{getCustomerById(w.customerId)?.name || w.customerId}</div>
                      <div className="text-xs text-muted-foreground">{getCustomerById(w.customerId)?.phone || ''}</div>
                    </td>
                    <td className="p-3">{w.device}</td>
                    <td className="p-3">{w.completedAt.toLocaleDateString('th-TH')}</td>
                    <td className="p-3">{w.warrantyDays} วัน</td>
                    <td className="p-3">{w.end.toLocaleDateString('th-TH')}</td>
                    <td className="p-3">
                      {w.active ? (
                        <Badge className="bg-emerald-600 text-white">ยังรับประกัน</Badge>
                      ) : (
                        <Badge variant="destructive">หมดประกัน</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {warranties.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">ไม่พบข้อมูลรับประกัน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Warranty;


