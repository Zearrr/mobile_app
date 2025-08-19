import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">ผู้จำหน่าย</h1>
          <p className="thai-text text-muted-foreground">จัดการผู้จำหน่ายอะไหล่</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">เพิ่มผู้จำหน่าย</CardTitle>
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
            <Input placeholder="ค้นหา" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
  );
}


