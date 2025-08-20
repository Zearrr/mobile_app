import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { Building2, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Suppliers() {
  const { suppliers, loadSuppliers, createSupplier, updateSupplier, deleteSupplier } = useRepairStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [address, setAddress] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadSuppliers(); }, []);

  const filtered = suppliers.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search));

  const add = async () => {
    if (!name) return;
    await createSupplier({ name, phone, lineId, address } as any);
    setName(''); setPhone(''); setLineId(''); setAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Gradient Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">ผู้จำหน่าย</div>
              <div className="text-white/90 thai-text text-sm md:text-base">จัดการผู้จำหน่ายอะไหล่</div>
            </div>
          </div>
        </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> เพิ่มผู้จำหน่าย
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="thai-text">ชื่อ</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="thai-text">โทร</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label className="thai-text">Line</Label>
            <Input value={lineId} onChange={(e) => setLineId(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label className="thai-text">ที่อยู่</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <Button className="btn-gradient" onClick={add}>บันทึก</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="thai-text">รายการผู้จำหน่าย</CardTitle>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="ค้นหา" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">ชื่อ</TableHead>
                  <TableHead className="thai-text">โทร</TableHead>
                  <TableHead className="thai-text">Line</TableHead>
                  <TableHead className="thai-text">ที่อยู่</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="thai-text">{s.name}</TableCell>
                    <TableCell className="thai-text">{s.phone || '-'}</TableCell>
                    <TableCell className="thai-text">{s.lineId || '-'}</TableCell>
                    <TableCell className="thai-text">{s.address || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => deleteSupplier(s.id)}>ลบ</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


