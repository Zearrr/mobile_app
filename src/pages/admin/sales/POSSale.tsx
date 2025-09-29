import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { saleRepo, stockMoveRepo } from '@/lib/repositories';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { Part, PaymentMethod, Sale, SaleItem } from '@/types';
import { Banknote, CreditCard, Landmark, Minus, Package, Plus, Search as SearchIcon, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

type PaymentEntry = { method: PaymentMethod; amount: number };

export default function POSSale() {
  const navigate = useNavigate();
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const { toast } = useToast();
  const settings = useRepairStore(s => s.settings);
  const parts = useRepairStore(s => s.parts);
  const loadParts = useRepairStore(s => s.loadParts);

  useEffect(() => { if (parts.length === 0) loadParts(); }, []);

  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [received, setReceived] = useState<number>(0);
  const [demoAdded, setDemoAdded] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [printAfter, setPrintAfter] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  // Top-up popup state
  const [topupOpen, setTopupOpen] = useState<boolean>(false);
  const [topupCarrier, setTopupCarrier] = useState<'AIS'|'TRUE'|'DTAC'|'OTHER'>('AIS');
  const [topupAmount, setTopupAmount] = useState<number>(50);
  const topupCommission = useMemo(() => Math.round((topupAmount || 0) * 0.05), [topupAmount]);

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

  // demo helpers
  const addDemoItems = () => {
    if (parts.length === 0) return;
    const demoParts = parts.slice(0, Math.min(3, parts.length));
    const demoItems: SaleItem[] = demoParts.map(p => ({ sku: p.sku, name: p.name, qty: 1, unitPrice: p.price, cost: p.cost }));
    setItems(demoItems);
    setDemoAdded(true);
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items]);
  const tax = useMemo(() => (settings?.vatEnabled ? Math.round(subtotal * 0.07) : 0), [settings?.vatEnabled, subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);
  const change = useMemo(() => Math.max(0, received - total), [received, total]);

  const handleSave = async () => {
    if (items.length === 0) return;
    setConfirmOpen(true);
  };

  const confirmAndSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const paidAmount = received > 0 ? received : total;
      const pm: PaymentEntry[] = [{ method: payMethod, amount: paidAmount }];

      const sale: Sale = {
        id: `SO_${Date.now()}`,
        date: new Date(),
        items,
        method: pm[0].method,
        payments: pm,
        subtotal,
        tax,
        total
      };
      await saleRepo.add(sale);
      for (const it of items) {
        const part = parts.find(p => p.sku === it.sku);
        if (part) {
          await stockMoveRepo.add({ id: `SM_${Date.now()}_${it.sku}`, partId: part.id, type: 'sale', qty: it.qty, unitCost: part.cost, createdAt: new Date() });
        }
      }
      toast({ title: 'บันทึกการขายสำเร็จ' });
      setConfirmOpen(false);
      if (printAfter) {
        navigate(`/print/receipt/${sale.id}`);
      }
      // reset inputs for next sale
      setItems([]);
      setReceived(0);
    } finally {
      setSaving(false);
    }
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
    <>
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className={`p-6 md:p-8 ${sidebarOpen ? 'max-w-7xl' : 'max-w-none'} mx-auto space-y-6`}>
        <PageHeader 
          title="ขายหน้าร้าน (POS)" 
          description="สแกน/ค้นหา SKU หรือชื่อสินค้า เพื่อเพิ่มลงตะกร้า" 
          showActions={false} 
        />
        <div className="mb-2">
          <Button variant="outline" className="rounded-full gap-2 thai-text" onClick={() => setTopupOpen(true)}>
            <Smartphone className="w-4 h-4" /> เติมเงินมือถือ / ค่าบริการ
          </Button>
        </div>

      {/* Main responsive layout: wider right column for cart/payment */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* LEFT: search + all products */}
        <div className="md:col-span-2 lg:col-span-3 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="thai-text">ค้นหา / สแกนบาร์โค้ด</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input autoFocus placeholder="สแกนหรือพิมพ์ SKU/ชื่อสินค้า แล้วกด Enter" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="pl-9 h-11 rounded-lg" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground thai-text">กด Enter เพื่อเพิ่มรายการ • กด Esc เพื่อล้างตะกร้า • Ctrl+P เพื่อชำระเงินเร็ว</div>
            {filtered.length > 0 && (
              <div className="mt-2 border rounded-md max-h-56 overflow-auto bg-background">
                {filtered.slice(0, 8).map(p => (
                  <div key={p.id} className="px-3 py-2 hover:bg-accent cursor-pointer thai-text" onClick={() => addPart(p)}>
                    {p.sku} — {p.name} ({formatCurrency(p.price)})
                  </div>
                ))}
              </div>
            )}
            {/* สินค้าทั้งหมด */}
            {parts.length > 0 && (
              <div className="mt-4">
                <div className="thai-text mb-2 text-sm text-muted-foreground">สินค้าทั้งหมด ({parts.length})</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {parts.slice(0, 24).map(p => (
                    <div
                      key={p.id}
                      className="rounded-xl border bg-card p-4 flex flex-col hover:shadow-md transition cursor-pointer"
                      onClick={() => addPart(p)}
                    >
                      <div className="w-full h-24 rounded-md bg-muted flex items-center justify-center mb-3 overflow-hidden">
                        <img src={p.imageUrl || '/placeholder.svg'} alt={p.name} className="h-full object-contain" />
                      </div>
                      <div className="thai-text font-medium line-clamp-2">{p.name}</div>
                      <div className="text-xs text-muted-foreground thai-text">รหัส: {p.sku || '-'}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="font-semibold">{formatCurrency(p.price || 0)}</div>
                        <div className="text-xs thai-text text-muted-foreground flex items-center gap-1">
                          <Package className="w-3 h-3" /> {p.stock ?? 0} คงเหลือ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: cart + payment + summary (wider) */}
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="thai-text">ตะกร้าสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {items.length === 0 ? (
                <div className="text-center thai-text text-muted-foreground py-12 border rounded-md bg-muted/20">เริ่มสแกน/ค้นหาเพื่อเพิ่มสินค้า</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="thai-text w-[55%]">สินค้า</TableHead>
                        <TableHead className="thai-text w-[10%] text-right">ราคา</TableHead>
                        <TableHead className="thai-text w-[20%] text-center">จำนวน</TableHead>
                        <TableHead className="thai-text w-[10%] text-right">รวม</TableHead>
                        <TableHead className="text-right w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={it.sku} className="hover:bg-accent/40">
                          <TableCell className="thai-text">{it.sku} — {it.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(it.unitPrice)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button aria-label="decrease" size="icon" variant="outline" className="rounded-md h-8 w-8" onClick={() => setItems(items.map((x,i)=> i===idx? { ...x, qty: Math.max(1, x.qty-1)}: x))}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <div className="w-14 h-8 inline-flex items-center justify-center rounded-md border bg-background font-mono text-xs">
                                {it.qty}
                              </div>
                              <Button aria-label="increase" size="icon" variant="outline" className="rounded-md h-8 w-8" onClick={() => setItems(items.map((x,i)=> i===idx? { ...x, qty: x.qty+1}: x))}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(it.qty * it.unitPrice)}</TableCell>
                          <TableCell className="text-right">
                            <Button aria-label="remove" variant="ghost" size="icon" className="hover:text-red-600" onClick={() => setItems(items.filter((_,i)=> i!==idx))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="thai-text">วิธีการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant={'outline'} onClick={()=>setPayMethod('cash')} className={payMethod==='cash' ? 'bg-green-600 text-white hover:bg-green-700' : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'}>
                <Banknote className="w-4 h-4 mr-2"/> เงินสด
              </Button>
              <Button variant={'outline'} onClick={()=>setPayMethod('transfer')} className={payMethod==='transfer' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'}>
                <Landmark className="w-4 h-4 mr-2"/> โอน
              </Button>
              <Button variant={'outline'} onClick={()=>setPayMethod('card')} className={payMethod==='card' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'}>
                <CreditCard className="w-4 h-4 mr-2"/> บัตร
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="thai-text mb-1 block">รับเงิน</Label>
                <Input type="number" min={0} value={received} onChange={(e)=> setReceived(Number(e.target.value)||0)} />
              </div>
              <div>
                <Label className="thai-text mb-1 block">เงินทอน</Label>
                <Input type="number" readOnly value={change} />
              </div>
            </div>

            </CardContent>
          </Card>
          <Card className="glass-card sticky top-4 h-fit">
          <CardHeader>
            <CardTitle className="thai-text">สรุปบิล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 thai-text">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>ภาษี (VAT)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>รวมทั้งสิ้น</span><span>{formatCurrency(total)}</span></div>
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="destructive" className="w-full" onClick={() => setItems([])}>ล้างตะกร้า</Button>
              <Button variant="outline" disabled={items.length===0} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5" onClick={handleSave}>ชำระเงิน</Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">พิมพ์ใบเสร็จจะเปิดในแท็บใหม่</div>
          </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="thai-text">ยืนยันการชำระเงิน</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="thai-text text-sm text-muted-foreground">รายการสินค้า</div>
            <div className="border rounded-md divide-y">
              {items.map(it => (
                <div key={it.sku} className="flex items-center justify-between p-3 thai-text">
                  <div className="truncate">{it.name} x {it.qty}</div>
                  <div className="font-medium">{formatCurrency(it.qty * it.unitPrice)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="thai-text text-sm text-muted-foreground">ข้อมูลการชำระเงิน</div>
            <div className="border rounded-md p-3 space-y-2 thai-text">
              <div className="flex justify-between"><span>ยอดรวม:</span><span className="font-semibold">{formatCurrency(total)} บาท</span></div>
              <div className="flex justify-between"><span>วิธีการชำระ:</span><span>{payMethod === 'cash' ? 'เงินสด' : payMethod === 'transfer' ? 'โอนเงิน' : 'บัตร'}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="printAfter" checked={printAfter} onCheckedChange={(v)=> setPrintAfter(Boolean(v))} />
              <Label htmlFor="printAfter" className="thai-text">พิมพ์ใบเสร็จ</Label>
            </div>
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={saving}>ยกเลิก</Button>
          <Button className="btn-gradient" onClick={confirmAndSave} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Top-up Popup */}
    <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="thai-text">เติมเงินมือถือ</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Network selection */}
          <div className="thai-text">
            <div className="mb-2 text-sm text-muted-foreground">เครือข่าย</div>
            <div className="flex items-center rounded-lg border bg-muted/30 p-1 gap-1">
              {(['AIS','TRUE','DTAC','OTHER'] as const).map(n => (
                <Button
                  key={n}
                  variant={topupCarrier===n ? 'outline' : 'outline'}
                  size="sm"
                  className={`flex-1 rounded-full ${topupCarrier===n ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent' : ''}`}
                  onClick={()=> setTopupCarrier(n)}
                >
                  {n==='OTHER' ? 'อื่น ๆ' : n}
                </Button>
              ))}
            </div>
          </div>
          {/* Quick amount chips */}
          <div className="thai-text">
            <div className="mb-2 text-sm text-muted-foreground">จำนวนเงินยอดนิยม</div>
            <div className="grid grid-cols-6 gap-2">
              {[20,50,100,200,300,500].map(v => (
                <Button
                  key={v}
                  variant={topupAmount===v ? 'outline' : 'outline'}
                  size="sm"
                  className={`rounded-full ${topupAmount===v? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent' : ''}`}
                  onClick={()=> setTopupAmount(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
          {/* Custom amount */}
          <div className="thai-text">
            <Label className="thai-text mb-1 block">จำนวนเงิน</Label>
            <Input type="number" min={1} placeholder="เช่น 100" value={topupAmount} onChange={(e)=> setTopupAmount(Math.max(0, Number(e.target.value)||0))} />
          </div>
          {/* Summary */}
          <div className="thai-text rounded-xl bg-muted/20 border p-4">
            <div className="flex items-baseline justify-between">
              <div className="text-muted-foreground">ลูกค้าจ่าย</div>
              <div className="text-xl font-bold">{formatCurrency(topupAmount)} บาท</div>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-sm">
              <div className="text-muted-foreground">คอมมิชชั่น (บันทึกเป็นรายได้)</div>
              <div className="font-medium">{formatCurrency(topupCommission)} บาท</div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-1">
          <Button variant="ghost" className="w-full sm:flex-1 h-11 rounded-full font-medium shadow-sm hover:shadow-md hover:bg-muted/60 transition-all" onClick={()=> setTopupOpen(false)}>ยกเลิก</Button>
          <Button variant="default" className="w-full sm:flex-1 h-11 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus-visible:ring-primary/30" disabled={topupAmount<=0} onClick={()=>{
            const name = `Top-up ${topupCarrier} (คอมมิชชั่น)`;
            setItems(prev => [...prev, { sku: `TOPUP_${topupCarrier}_${topupAmount}`, name, qty: 1, unitPrice: topupCommission, cost: 0 }]);
            setTopupOpen(false);
          }}>เพิ่ม</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}


