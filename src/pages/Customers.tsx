import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { useState } from 'react';

export default function Customers() {
  const { customers } = useRepairStore();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">ลูกค้า</h1>
          <p className="thai-text text-muted-foreground">ลูกค้าทั้งหมด {customers.length} ราย</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ค้นหาลูกค้า</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="ค้นหาจากชื่อ/เบอร์โทร" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="outline" onClick={() => setSearch('')}>ล้าง</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายชื่อลูกค้า ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10 thai-text text-muted-foreground">ไม่พบลูกค้า</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="thai-text">ชื่อ</TableHead>
                    <TableHead className="thai-text">เบอร์โทร</TableHead>
                    <TableHead className="thai-text">Line ID</TableHead>
                    <TableHead className="thai-text">วันที่สร้าง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="thai-text font-medium">{c.name}</TableCell>
                      <TableCell className="thai-text">{c.phone}</TableCell>
                      <TableCell className="thai-text">{c.lineId || '-'}</TableCell>
                      <TableCell className="thai-text">{new Date(c.createdAt).toLocaleDateString('th-TH')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


