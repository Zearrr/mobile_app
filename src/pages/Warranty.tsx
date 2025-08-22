import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRepairStore } from '@/stores/useRepairStore';
import { ArrowLeft, Filter, Search, ShieldCheck } from 'lucide-react';
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
      {/* Page Header - gradient bar with action buttons */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold">รับประกัน</div>
            <div className="text-white/90 thai-text text-sm md:text-base">รายการงานที่อยู่ในช่วงรับประกันและรายละเอียดที่เกี่ยวข้อง</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/claims">
            <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 shadow-lg">
              จัดการเครมการซ่อม
            </Button>
          </Link>
          <Link to="/warranty/new">
            <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 shadow-lg">
              เพิ่มข้อมูลการรับประกัน
            </Button>
          </Link>
        </div>
      </div>

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
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />ย้อนกลับ</Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">สามารถค้นหาด้วยข้อมูลบางส่วนได้ (ไม่จำเป็นต้องใส่ข้อมูลทั้งหมด)</div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="ค้นหาจากรหัสงาน, ลูกค้า, รุ่นเครื่อง"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant={showActiveOnly ? 'default' : 'outline'}
              onClick={() => setShowActiveOnly(v => !v)}
            >
              <Filter className="w-4 h-4 mr-2" />เฉพาะที่ยังรับประกัน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-2xl shadow-lg border border-emerald-200/60 bg-gradient-to-br from-emerald-100 to-green-100">
          <CardContent className="p-6">
            <div className="text-sm text-emerald-700/80">อยู่ในประกัน</div>
            <div className="text-3xl font-extrabold text-emerald-700">{warranties.filter(w => w.active).length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg border border-amber-200/60 bg-gradient-to-br from-amber-100 to-orange-100">
          <CardContent className="p-6">
            <div className="text-sm text-amber-700/80">ใกล้หมดประกัน (&lt;= 7 วัน)</div>
            <div className="text-3xl font-extrabold text-amber-700">{warranties.filter(w => w.remainingDays <= 7 && w.remainingDays >= 0).length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-200/60">
          <CardContent className="p-6">
            <div className="text-sm text-slate-700/80">หมดประกัน</div>
            <div className="text-3xl font-extrabold text-slate-700">{jobs.filter(j => j.completedAt && (new Date(j.completedAt as Date)).getTime() + (j.warrantyDays||0)*86400000 < today.getTime()).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-muted-foreground">
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
                  <tr key={w.id} className="border-t border-border/60 hover:bg-accent/40">
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


