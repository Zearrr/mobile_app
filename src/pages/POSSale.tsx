import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { saleRepo, stockMoveRepo } from '@/lib/repositories';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { Part, PaymentMethod, Sale, SaleItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PaymentEntry = { method: PaymentMethod; amount: number };

export default function POSSale() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const settings = useRepairStore(s => s.settings);
  const parts = useRepairStore(s => s.parts);
  const loadParts = useRepairStore(s => s.loadParts);

  useEffect(() => { if (parts.length === 0) loadParts(); }, []);

  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [payments, setPayments] = useState<PaymentEntry[]>([{ method: 'cash', amount: 0 }]);

  // search results
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return [] as Part[];
    return parts.filter(p => (p.sku || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q));
  }, [query, parts]);

  const addPart = (p: Part) => {
    const exist = items.find(i => i.sku === p.sku);
    if (exist) setItems(items.map(i => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i));
    else setItems([...items, { sku: p.sku, name: p.name, qty: 1, unitPrice: p.price, cost: p.cost }]);
    setQuery('');
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items]);
  const tax = useMemo(() => (settings?.vatEnabled ? Math.round((subtotal - (billDiscount || 0)) * 0.07) : 0), [settings?.vatEnabled, subtotal, billDiscount]);
  const total = useMemo(() => subtotal - (billDiscount || 0) + tax, [subtotal, billDiscount, tax]);

  const handleSave = async () => {
    if (items.length === 0) return;
    let remain = total;
    const pm: PaymentEntry[] = payments.filter(p => p.amount > 0);
    if (pm.length === 0) pm.push({ method: 'cash', amount: total });
    const sumPay = pm.reduce((s, p) => s + p.amount, 0);
    if (sumPay !== total) pm[0].amount += (total - sumPay);

    const sale: Sale = {
      id: `SO_${Date.now()}`,
      date: new Date(),
      items,
      method: pm[0].method,
      payments: pm,
      subtotal,
      discount: billDiscount || 0,
      tax,
      total
    };
    await saleRepo.add(sale);
    // stock moves
    for (const it of items) {
      const part = parts.find(p => p.sku === it.sku);
      if (part) {
        await stockMoveRepo.add({ id: `SM_${Date.now()}_${it.sku}`, partId: part.id, type: 'sale', qty: it.qty, unitCost: part.cost, createdAt: new Date() });
      }
    }
    toast({ title: 'บันทึกการขายสำเร็จ' });
    navigate(`/print/receipt/${sale.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered[0]) addPart(filtered[0]);
    if (e.key === 'Escape') setItems([]);
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">ขายหน้าร้าน (POS)</h1>
          <p className="thai-text text-muted-foreground">สแกน/ค้นหา SKU หรือชื่อสินค้า เพื่อเพิ่มลงตะกร้า</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ค้นหา / สแกนบาร์โค้ด</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input autoFocus placeholder="สแกนหรือพิมพ์ SKU/ชื่อสินค้า แล้วกด Enter" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} />
            {filtered.length > 0 && (
              <div className="mt-2 border rounded-md max-h-56 overflow-auto bg-background">
                {filtered.slice(0, 8).map(p => (
                  <div key={p.id} className="px-3 py-2 hover:bg-accent cursor-pointer thai-text" onClick={() => addPart(p)}>
                    {p.sku} — {p.name} ({formatCurrency(p.price)})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="thai-text">ส่วนลดทั้งบิล</Label>
            <Input type="number" min={0} step={1} value={billDiscount} onChange={(e) => setBillDiscount(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ตะกร้าสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center thai-text text-muted-foreground py-12">เริ่มสแกน/ค้นหาเพื่อเพิ่มสินค้า</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="thai-text">สินค้า</TableHead>
                    <TableHead className="thai-text">ราคา</TableHead>
                    <TableHead className="thai-text">จำนวน</TableHead>
                    <TableHead className="thai-text">รวม</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={it.sku}>
                      <TableCell className="thai-text">{it.sku} — {it.name}</TableCell>
                      <TableCell>{formatCurrency(it.unitPrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => setItems(items.map((x,i)=> i===idx? { ...x, qty: Math.max(1, x.qty-1)}: x))}>-</Button>
                          <Input className="w-20" type="number" min={1} value={it.qty} onChange={(e) => setItems(items.map((x,i)=> i===idx? { ...x, qty: Number(e.target.value)||1}: x))} />
                          <Button size="icon" variant="outline" onClick={() => setItems(items.map((x,i)=> i===idx? { ...x, qty: x.qty+1}: x))}>+</Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(it.qty * it.unitPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setItems(items.filter((_,i)=> i!==idx))}>ลบ</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="thai-text">ชำระเงิน (หลายช่องทางได้)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.map((p, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="thai-text">ช่องทาง</Label>
                  <select className="w-full h-10 rounded-md border px-3" value={p.method} onChange={(e)=> setPayments(payments.map((x,i)=> i===idx? { ...x, method: e.target.value as PaymentMethod}: x))}>
                    <option value="cash">เงินสด</option>
                    <option value="transfer">โอน</option>
                    <option value="promptpay">พร้อมเพย์</option>
                    <option value="card">บัตร</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="thai-text">จำนวน</Label>
                  <Input type="number" min={0} step={1} value={p.amount} onChange={(e)=> setPayments(payments.map((x,i)=> i===idx? { ...x, amount: Number(e.target.value)||0}: x))} />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPayments([...payments, { method: 'cash', amount: 0 }])}>เพิ่มช่องทาง</Button>
              <Button variant="outline" onClick={() => setPayments(payments.slice(0,1))}>ช่องทางเดียว</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">สรุปบิล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 thai-text">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>ส่วนลด</span><span>{formatCurrency(billDiscount||0)}</span></div>
            <div className="flex justify-between"><span>ภาษี (VAT)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>รวมทั้งสิ้น</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setItems([])}>ล้างตะกร้า (Esc)</Button>
              <Button className="btn-gradient" onClick={handleSave}>บันทึก & พิมพ์ใบเสร็จ (Ctrl+P)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


