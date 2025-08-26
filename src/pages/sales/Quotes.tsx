import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { Quote } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Quotes() {
  const { customers } = useRepairStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Quote[]>([]);

  // Load from Dexie directly to keep page self-contained
  useEffect(() => {
    (async () => {
      const { db } = await import('@/lib/database');
      const quotes = await db.quotes.orderBy('createdAt').reverse().toArray();
      setList(quotes as any);
    })();
  }, []);

  const filtered = useMemo(() => list.filter(q => q.id.includes(search) || customers.find(c => c.id === q.customerId)?.name.includes(search || '')), [list, search, customers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">ใบเสนอราคา</h1>
          <p className="thai-text text-muted-foreground">สร้าง/จัดการใบเสนอราคา</p>
        </div>
        <Button className="btn-gradient" onClick={()=> navigate('/quotes/new')}>สร้างใบเสนอราคา</Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="thai-text">รายการ</CardTitle>
            <Input placeholder="ค้นหา" value={search} onChange={(e)=> setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">เลขที่</TableHead>
                  <TableHead className="thai-text">ลูกค้า</TableHead>
                  <TableHead className="thai-text">อุปกรณ์</TableHead>
                  <TableHead className="thai-text">ยอดรวม</TableHead>
                  <TableHead className="thai-text">สถานะ</TableHead>
                  <TableHead className="text-right thai-text">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono">{q.id}</TableCell>
                    <TableCell className="thai-text">{customers.find(c => c.id === q.customerId)?.name || '-'}</TableCell>
                    <TableCell className="thai-text">{q.brand || '-'} {q.model || ''}</TableCell>
                    <TableCell>{q.total.toLocaleString()}</TableCell>
                    <TableCell className="thai-text">{q.status}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm"><Link to={`/quotes/${q.id}`}>แก้ไข</Link></Button>
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


