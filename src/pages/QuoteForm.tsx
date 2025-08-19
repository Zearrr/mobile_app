import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { Quote } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function QuoteForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customers } = useRepairStore();

  const [customerId, setCustomerId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState<'draft'|'sent'|'approved'|'rejected'>('draft');
  const [rows, setRows] = useState<Array<{ name: string; qty: number; unitPrice: number; cost?: number }>>([{ name: '', qty: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  useEffect(() => {
    (async () => {
      if (!isNew && id) {
        const q = await db.quotes.get(id);
        if (q) {
          setCustomerId(q.customerId);
          setBrand(q.brand || '');
          setModel(q.model || '');
          setRows(q.items as any);
          setDiscount(q.discount || 0);
          setTax(q.tax || 0);
          setStatus(q.status);
        }
      }
    })();
  }, [id, isNew]);

  const subtotal = useMemo(() => rows.reduce((s, r) => s + (r.qty * r.unitPrice), 0), [rows]);
  const total = useMemo(() => subtotal - (discount || 0) + (tax || 0), [subtotal, discount, tax]);

  const save = async () => {
    if (!customerId) return;
    const q: Quote = {
      id: isNew ? `Q_${Date.now()}` : (id as string),
      customerId,
      brand, model,
      items: rows,
      subtotal,
      discount,
      tax,
      total,
      status,
      createdAt: new Date()
    };
    if (isNew) await db.quotes.add(q as any); else await db.quotes.put(q as any);
    toast({ title: 'บันทึกใบเสนอราคาแล้ว' });
    navigate('/quotes');
  };

  const copyPublicLink = async () => {
    const qid = isNew ? `Q_${Date.now()}` : id;
    const link = `${location.origin}/public/quote/${qid}`;
    await navigator.clipboard.writeText(link);
    toast({ title: 'คัดลอกลิงก์แล้ว', description: link });
  };

  const approve = async () => {
    if (!id) return;
    await db.quotes.update(id, { status: 'approved', approvedAt: new Date() } as any);
    toast({ title: 'อนุมัติใบเสนอราคาแล้ว' });
    navigate(`/public/quote/${id}`);
  };

  const createJobFromQuote = async () => {
    if (!id) return;
    const q = await db.quotes.get(id);
    if (!q) return;
    // prefill NewJob via querystring
    const params = new URLSearchParams({ brand: q.brand || '', model: q.model || '', issue: q.items.map(i=>i.name).join(', ') });
    navigate(`/jobs/new?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{isNew ? 'สร้าง' : 'แก้ไข'} ใบเสนอราคา</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyPublicLink}>คัดลอกลิงก์ส่งลูกค้า</Button>
          {!isNew && (
            <>
              <Button variant="outline" onClick={approve}>อนุมัติ</Button>
              <Button className="btn-gradient" onClick={createJobFromQuote}>สร้างงานซ่อมจากใบนี้</Button>
            </>
          )}
          <Button className="btn-gradient" onClick={save}>บันทึก</Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ข้อมูลลูกค้า/อุปกรณ์</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="thai-text">ลูกค้า</Label>
            <select className="w-full h-10 rounded-md border px-3" value={customerId} onChange={(e)=> setCustomerId(e.target.value)}>
              <option value="">-- เลือก --</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <Label className="thai-text">ยี่ห้อ</Label>
            <Input value={brand} onChange={(e)=> setBrand(e.target.value)} />
          </div>
          <div>
            <Label className="thai-text">รุ่น</Label>
            <Input value={model} onChange={(e)=> setModel(e.target.value)} />
          </div>
          <div>
            <Label className="thai-text">สถานะ</Label>
            <select className="w-full h-10 rounded-md border px-3" value={status} onChange={(e)=> setStatus(e.target.value as any)}>
              <option value="draft">draft</option>
              <option value="sent">sent</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายการเสนอราคา</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">รายการ</TableHead>
                  <TableHead className="thai-text">จำนวน</TableHead>
                  <TableHead className="thai-text">ราคาต่อหน่วย</TableHead>
                  <TableHead className="thai-text">รวม</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Input value={r.name} onChange={(e)=> setRows(rows.map((x,i)=> i===idx? { ...x, name: e.target.value }: x))} /></TableCell>
                    <TableCell><Input type="number" min={1} value={r.qty} onChange={(e)=> setRows(rows.map((x,i)=> i===idx? { ...x, qty: Number(e.target.value)||1 }: x))} /></TableCell>
                    <TableCell><Input type="number" min={0} value={r.unitPrice} onChange={(e)=> setRows(rows.map((x,i)=> i===idx? { ...x, unitPrice: Number(e.target.value)||0 }: x))} /></TableCell>
                    <TableCell>{formatCurrency(r.qty * r.unitPrice)}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={()=> setRows(rows.filter((_,i)=> i!==idx))}>ลบ</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" className="mt-2" onClick={()=> setRows([...rows, { name: '', qty: 1, unitPrice: 0 }])}>เพิ่มรายการ</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">สรุป</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 thai-text">
          <div>
            <Label>ส่วนลด</Label>
            <Input type="number" min={0} value={discount} onChange={(e)=> setDiscount(Number(e.target.value)||0)} />
          </div>
          <div>
            <Label>ภาษี</Label>
            <Input type="number" min={0} value={tax} onChange={(e)=> setTax(Number(e.target.value)||0)} />
          </div>
          <div className="flex items-end justify-end gap-4">
            <div>Subtotal: {formatCurrency(subtotal)}</div>
            <div>Total: <b>{formatCurrency(total)}</b></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


