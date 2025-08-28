import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { PurchaseOrder } from '@/types';
import { Trash2, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function POPage() {
  const { suppliers, parts, loadSuppliers, loadParts, createPO, createSupplier, deleteSupplier } = useRepairStore();
  useEffect(() => { loadSuppliers(); loadParts(); }, []);

  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<Array<{ partId: string; qty: number; unitCost: number }>>([]);
  const [query, setQuery] = useState('');
  const filteredParts = useMemo(() => parts.filter(p => (p.sku||'').toLowerCase().includes(query.toLowerCase()) || (p.name||'').toLowerCase().includes(query.toLowerCase())), [query, parts]);

  // Dialog states for supplier management
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<{ name: string; phone?: string; lineId?: string; address?: string }>({ name: '' });

  const addPart = (partId: string) => {
    const exist = rows.find(r => r.partId === partId);
    if (exist) setRows(rows.map(r => r.partId === partId ? { ...r, qty: r.qty + 1 } : r));
    else setRows([...rows, { partId, qty: 1, unitCost: parts.find(p => p.id === partId)?.cost || 0 }]);
    setQuery('');
  };

  const subtotal = useMemo(() => rows.reduce((s, r) => s + r.qty * r.unitCost, 0), [rows]);

  const savePO = async () => {
    if (!supplierId || rows.length === 0) return;
    const id = `PO_${Date.now()}`;
    const po: PurchaseOrder = {
      id,
      supplierId,
      date: new Date(),
      items: rows.map(r => { const p = parts.find(x => x.id === r.partId)!; return { partId: p.id, sku: p.sku, name: p.name, qty: r.qty, unitCost: r.unitCost }; }),
      note,
      status: 'ordered',
      subtotal,
      total: subtotal
    };
    await createPO(po);
    setRows([]); setSupplierId(''); setNote('');
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name) return;
    const s = await createSupplier(newSupplier as any);
    setIsAddOpen(false);
    setNewSupplier({ name: '' });
    setSupplierId(s.id);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierId) return;
    await deleteSupplier(supplierId);
    setIsDeleteOpen(false);
    setSupplierId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="ใบสั่งซื้อ (PO)" 
          description="สร้างใบสั่งซื้อสินค้าจากผู้จำหน่าย" 
          showActions={false} 
        />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ข้อมูล PO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="thai-text">ผู้จำหน่าย</Label>
            <select className="w-full h-10 rounded-md border px-3" value={supplierId} onChange={(e)=> setSupplierId(e.target.value)}>
              <option value="">-- เลือก --</option>
              {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" /> เพิ่มผู้จำหน่าย
              </Button>
              <Button size="sm" variant="destructive" disabled={!supplierId} onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> ลบผู้จำหน่าย
              </Button>
            </div>
          </div>
          <div className="md:col-span-3">
            <Label className="thai-text">หมายเหตุ</Label>
            <Input value={note} onChange={(e)=> setNote(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Add Supplier */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="thai-text">เพิ่มผู้จำหน่าย</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="thai-text">ชื่อ</Label>
              <Input value={newSupplier.name} onChange={(e)=> setNewSupplier({ ...newSupplier, name: e.target.value })} />
            </div>
            <div>
              <Label className="thai-text">โทร</Label>
              <Input value={newSupplier.phone || ''} onChange={(e)=> setNewSupplier({ ...newSupplier, phone: e.target.value })} />
            </div>
            <div>
              <Label className="thai-text">Line</Label>
              <Input value={newSupplier.lineId || ''} onChange={(e)=> setNewSupplier({ ...newSupplier, lineId: e.target.value })} />
            </div>
            <div>
              <Label className="thai-text">ที่อยู่</Label>
              <Input value={newSupplier.address || ''} onChange={(e)=> setNewSupplier({ ...newSupplier, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setIsAddOpen(false)}>ยกเลิก</Button>
            <Button className="btn-gradient" onClick={handleCreateSupplier}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Supplier */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="thai-text">ยืนยันการลบผู้จำหน่าย</DialogTitle>
          </DialogHeader>
          <div className="thai-text">คุณต้องการลบผู้จำหน่ายนี้ออกจากระบบหรือไม่? การลบจะไม่สามารถย้อนกลับได้</div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายการสั่งซื้อ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <Input placeholder="ค้นหา/สแกน SKU/ชื่อสินค้า" value={query} onChange={(e)=> setQuery(e.target.value)} />
              {filteredParts.slice(0, 6).map(p => (
                <div key={p.id} className="px-3 py-2 hover:bg-accent cursor-pointer thai-text" onClick={()=> addPart(p.id)}>
                  {p.sku} — {p.name}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">สินค้า</TableHead>
                  <TableHead className="thai-text">จำนวน</TableHead>
                  <TableHead className="thai-text">ราคาต่อหน่วย</TableHead>
                  <TableHead className="thai-text">รวม</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => { const p = parts.find(x => x.id === r.partId)!; return (
                  <TableRow key={r.partId}>
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
            <div className="thai-text">Subtotal: {formatCurrency(subtotal)}</div>
            <Button className="btn-gradient" onClick={savePO}>บันทึก PO</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


