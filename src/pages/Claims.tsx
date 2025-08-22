import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, CheckCircle, Eye, Hash, LayoutGrid, List as ListIcon, Pencil, Phone, Printer, Search, Timer, User, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const Claims = () => {
  const { jobs, getCustomerById, updateJob } = useRepairStore();
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const hasWarranty = (j: any) => (j.warrantyDays || 0) > 0;
  const claimableJobs = useMemo(() => {
    return jobs
      .filter(hasWarranty)
      .filter(j =>
        (!searchPhone || (getCustomerById(j.customerId)?.phone || '').includes(searchPhone)) &&
        (!searchName || (getCustomerById(j.customerId)?.name || '').toLowerCase().includes(searchName.toLowerCase())) &&
        (!searchCode || j.id.toLowerCase().includes(searchCode.toLowerCase()))
      )
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
  }, [jobs, searchPhone, searchName, searchCode, getCustomerById]);

  const totalClaims = claimableJobs.length;
  const pendingClaims = claimableJobs.filter(j => ['received', 'checking', 'waiting_parts'].includes(j.status)).length;
  const inProgressClaims = claimableJobs.filter(j => ['in_progress', 'testing'].includes(j.status)).length;
  const completedClaims = claimableJobs.filter(j => ['done', 'delivered'].includes(j.status)).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Page Header - gradient bar with action buttons */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold">จัดการเครมการซ่อม</div>
            <div className="text-white/90 thai-text text-sm md:text-base">ดูรายการเครม ค้นหา และพิมพ์ใบเครม</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/warranty/new">
            <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 shadow-lg">
              เพิ่มเครมใหม่
            </Button>
          </Link>
          <Link to="/">
            <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 shadow-lg">
              กลับหน้าหลัก
            </Button>
          </Link>
          <div className="ml-2 flex rounded-md overflow-hidden border border-white/30">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'card' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('card')} className="rounded-none text-white/90 hover:bg-white/20">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>แสดงแบบการ์ด</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('table')} className="rounded-none border-l border-white/30 text-white/90 hover:bg-white/20">
                  <ListIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>แสดงแบบตาราง</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl shadow-lg border border-border/10 bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-600">เครมทั้งหมด</div>
              <div className="text-3xl font-extrabold text-indigo-600">{totalClaims}</div>
              <div className="text-xs text-slate-400 mt-1">รายการ</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg border border-border/10 bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-600">รอดำเนินการ</div>
              <div className="text-3xl font-extrabold text-rose-600">{pendingClaims}</div>
              <div className="text-xs text-slate-400 mt-1">รายการ</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg border border-border/10 bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-600">เสร็จสิ้นแล้ว</div>
              <div className="text-3xl font-extrabold text-emerald-600">{completedClaims}</div>
              <div className="text-xs text-slate-400 mt-1">รายการ</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg border border-border/10 bg-white">
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-600">กำลังดำเนินการ</div>
              <div className="text-3xl font-extrabold text-amber-600">{inProgressClaims}</div>
              <div className="text-xs text-slate-400 mt-1">รายการ</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
              <Timer className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="เบอร์โทรลูกค้า" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} />
            </div>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="ชื่อลูกค้า" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="เลขที่ใบแจ้งซ่อม" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
              </div>
              <Button className="shrink-0"><Search className="w-4 h-4 mr-2" />ค้นหา</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-muted-foreground">
                <tr>
                  <th className="text-left p-3">รหัสเครม</th>
                  <th className="text-left p-3">ลูกค้า</th>
                  <th className="text-left p-3">เครื่อง</th>
                  <th className="text-left p-3">สาเหตุเครม</th>
                  <th className="text-left p-3">วันที่แจ้ง</th>
                  <th className="text-left p-3">สถานะ</th>
                  <th className="text-left p-3">เครมทั้งหมด</th>
                  <th className="text-left p-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {claimableJobs.map(j => (
                  <tr key={j.id} className="border-t border-border/60 hover:bg-accent/40">
                    <td className="p-3 font-mono text-primary">#{String(j.id).replace(/^R?/,'')}</td>
                    <td className="p-3">
                      <div className="font-medium">{getCustomerById(j.customerId)?.name || j.customerId}</div>
                      <div className="text-xs text-muted-foreground">{getCustomerById(j.customerId)?.phone}</div>
                    </td>
                    <td className="p-3">{j.brand} {j.model}</td>
                    <td className="p-3">
                      <div className="font-medium">{j.issueDesc || '-'}</div>
                      {j.preCheck && (
                        <div className="text-xs text-muted-foreground">ปัญหาเดิม: {j.preCheck}</div>
                      )}
                    </td>
                    <td className="p-3">
                      {j.completedAt ? (
                        <>
                          <div>{new Date(j.completedAt).toLocaleDateString('th-TH')}</div>
                          <div className="text-xs text-muted-foreground">{new Date(j.completedAt).toLocaleTimeString('th-TH')}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      {['done','delivered'].includes(j.status) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-xs">เสร็จสิ้น</span>
                      ) : ['in_progress','testing'].includes(j.status) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500 text-white text-xs">กำลังดำเนินการ</span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500 text-white text-xs">รอดำเนินการ</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs">ครั้งแรก</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/claims/${j.id}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                        <Link to={`/print/warranty/${j.id}`} target="_blank"><Button variant="outline" size="sm"><Printer className="w-4 h-4" /></Button></Link>
                        <Link to={`/claims/${j.id}/edit`}><Button variant="outline" size="sm"><Pencil className="w-4 h-4" /></Button></Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {claimableJobs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">ไม่พบงานที่อยู่ในเงื่อนไขรับประกัน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {claimableJobs.map(j => (
            <Card key={j.id} className="rounded-2xl shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">เครม #{String(j.id).replace(/^R?/,'')}</div>
                    <div className="text-xs text-muted-foreground">ใบซ่อม {j.id}</div>
                  </div>
                  <div>
                    {['done','delivered'].includes(j.status) ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-xs">เสร็จสิ้น</span>
                    ) : ['in_progress','testing'].includes(j.status) ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500 text-white text-xs">กำลังดำเนินการ</span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500 text-white text-xs">รอดำเนินการ</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">ข้อมูลลูกค้า</div>
                    <div className="text-sm">ชื่อ: {getCustomerById(j.customerId)?.name || j.customerId}</div>
                    <div className="text-sm">เบอร์: {getCustomerById(j.customerId)?.phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">ข้อมูลเครื่อง</div>
                    <div className="text-sm">ยี่ห้อ: {j.brand}</div>
                    <div className="text-sm">รุ่น: {j.model}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">รายละเอียด</div>
                  <div className="text-sm">การซ่อมครั้งแรก: {j.preCheck || '-'}</div>
                  <div className="text-sm">สาเหตุเครม: <span className="text-rose-600">{j.issueDesc || '-'}</span></div>
                </div>

                <div>
                  <div className="text-sm font-medium">ประวัติ</div>
                  <div className="text-sm">วันที่แจ้งเครม: {j.completedAt ? new Date(j.completedAt).toLocaleString('th-TH') : '-'}</div>
                  <div className="text-sm">จำนวนเครมของลูกค้า: 1 ครั้ง</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link to={`/claims/${j.id}`}><Button variant="outline" className="flex-1"><Eye className="w-4 h-4 mr-2" />ดูรายละเอียด</Button></Link>
                  <Link to={`/claims/${j.id}/edit`}><Button variant="outline" className="flex-1"><Pencil className="w-4 h-4 mr-2" />แก้ไข</Button></Link>
                </div>
                <div className="flex gap-2">
                  <Link to={`/print/warranty/${j.id}`} target="_blank"><Button className="flex-1"><Printer className="w-4 h-4 mr-2" />พิมพ์ใบเครม</Button></Link>
                  <Link to={`/customers`}><Button variant="outline" className="flex-1"><User className="w-4 h-4 mr-2" />ประวัติลูกค้า</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {claimableJobs.length === 0 && (
            <div className="text-center text-muted-foreground">ไม่พบงานที่อยู่ในเงื่อนไขรับประกัน</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Claims;


