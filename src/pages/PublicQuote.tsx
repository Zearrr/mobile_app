import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';
import { Quote } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PublicQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState<Quote | null>(null);

  useEffect(() => {
    (async () => {
      const data = await db.quotes.get(id!);
      setQ(data as any);
    })();
  }, [id]);

  const approve = async () => {
    if (!id) return;
    await db.quotes.update(id, { status: 'approved', approvedAt: new Date() } as any);
    navigate(`/quotes/${id}`);
  };

  if (!q) return <div className="p-6 thai-text">กำลังโหลด…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ใบเสนอราคา #{q.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="thai-text">อุปกรณ์: {q.brand || '-'} {q.model || ''}</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายละเอียด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">รายการ</TableHead>
                  <TableHead className="thai-text">จำนวน</TableHead>
                  <TableHead className="thai-text">ราคา</TableHead>
                  <TableHead className="thai-text">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="thai-text">{it.name}</TableCell>
                    <TableCell className="thai-text">{it.qty}</TableCell>
                    <TableCell>{formatCurrency(it.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(it.qty * it.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-4 thai-text mt-4">
            <div>Subtotal: {formatCurrency(q.subtotal)}</div>
            <div>ส่วนลด: {formatCurrency(q.discount || 0)}</div>
            <div>ภาษี: {formatCurrency(q.tax || 0)}</div>
            <div className="font-bold">รวม: {formatCurrency(q.total)}</div>
          </div>
        </CardContent>
      </Card>

      {q.status !== 'approved' && (
        <div className="flex justify-end">
          <Button className="btn-gradient" onClick={approve}>อนุมัติ</Button>
        </div>
      )}
    </div>
  );
}


