import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { GoodsReceipt } from '@/types';
import { Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function GRPage() {
  const { suppliers, parts, purchaseOrders, loadSuppliers, loadParts, loadPOs, createGR } = useRepairStore();
  useEffect(() => { loadSuppliers(); loadParts(); loadPOs(); }, []);

  const [supplierId, setSupplierId] = useState('');
  const [poId, setPoId] = useState('');
  const [rows, setRows] = useState<Array<{ partId: string; qty: number; unitCost: number }>>([]);
  const [note, setNote] = useState('');

  const selectedPO = useMemo(() => purchaseOrders.find(p => p.id === poId), [purchaseOrders, poId]);
  useEffect(() => {
    if (selectedPO) {
      setSupplierId(selectedPO.supplierId);
      setRows(selectedPO.items.map(i => ({ partId: i.partId, qty: i.qty, unitCost: i.unitCost })));
    }
  }, [poId]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.qty * r.unitCost, 0), [rows]);

  const saveGR = async () => {
    const gr: GoodsReceipt = {
      id: `GR_${Date.now()}`,
      date: new Date(),
      supplierId: supplierId || undefined,
      poId: poId || undefined,
      items: rows.map(r => { const p = parts.find(x => x.id===r.partId)!; return { partId: p.id, sku: p.sku, name: p.name, qty: r.qty, unitCost: r.unitCost };}),
      note,
      total
    };
    await createGR(gr);
    setSupplierId(''); setPoId(''); setRows([]); setNote('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Gradient Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">รับของเข้าสต็อก (GR)</div>
              <div className="text-white/90 thai-text text-sm md:text-base">รับเข้าจาก PO หรือเพิ่มโดยตรง</div>
            </div>
          </div>
        </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ข้อมูลรับเข้า</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="thai-text">ผู้จำหน่าย</Label>
            <select className="w-full h-10 rounded-md border px-3" value={supplierId} onChange={(e)=> setSupplierId(e.target.value)}>
              <option value="">-- เลือก --</option>
              {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div>
            <Label className="thai-text">จาก PO</Label>
            <select className="w-full h-10 rounded-md border px-3" value={poId} onChange={(e)=> setPoId(e.target.value)}>
              <option value="">-- ไม่เลือกรับจาก PO --</option>
              {purchaseOrders.map(po => (<option key={po.id} value={po.id}>{po.id}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="thai-text">หมายเหตุ</Label>
            <Input value={note} onChange={(e)=> setNote(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายการรับเข้า</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">สินค้า</TableHead>
                  <TableHead className="thai-text">จำนวน</TableHead>
                  <TableHead className="thai-text">ต้นทุนต่อหน่วย</TableHead>
                  <TableHead className="thai-text">รวม</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => { const p = parts.find(x => x.id===r.partId)!; return (
                  <TableRow key={`${r.partId}-${idx}`}>
                    <TableCell className="thai-text">{p.sku} — {p.name}</TableCell>
                    <TableCell><Input type="number" min={1} value={r.qty} onChange={(e)=> setRows(rows.map((x,i)=> i===idx? { ...x, qty: Number(e.target.value)||1}: x))} /></TableCell>
                    <TableCell><Input type="number" min={0} value={r.unitCost} onChange={(e)=> setRows(rows.map((x,i)=> i===idx? { ...x, unitCost: Number(e.target.value)||0}: x))} /></TableCell>
                    <TableCell>{formatCurrency(r.qty * r.unitCost)}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={()=> setRows(rows.filter((_,i)=> i!==idx))}>ลบ</Button></TableCell>
                  </TableRow>
                ); })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="thai-text">รวมทั้งสิ้น: {formatCurrency(total)}</div>
            <Button className="btn-gradient" onClick={saveGR}>บันทึกการรับเข้า</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


