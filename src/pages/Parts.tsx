import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, Barcode, Battery, Camera, Database, Link, Monitor, Package, Plus, Printer, Smartphone, SquarePen, Trash2, Upload, Wallet, Wrench } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

interface OutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPageInfo: {
    title: string;
    description: string;
  };
}

export default function Parts() {
  const { sidebarOpen, setSidebarOpen, currentPageInfo } = useOutletContext<OutletContext>();
  const { parts, createPart, updatePart, deletePart } = useRepairStore();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    sku: '',
    name: '',
    forBrand: '',
    forModel: '',
    unit: 'ชิ้น',
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 0
  });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editPart, setEditPart] = useState({
    sku: '',
    name: '',
    forBrand: '',
    forModel: '',
    unit: 'ชิ้น',
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 0,
    imageUrl: ''
  });

  // Adjust stock dialog state
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<'increase' | 'decrease' | 'set' | ''>('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustNote, setAdjustNote] = useState('');

  // Print barcode dialog state
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [barcodeTarget, setBarcodeTarget] = useState<any>(null);
  const [barcodeQty, setBarcodeQty] = useState<number>(1);
  const [barcodeSize, setBarcodeSize] = useState<'small' | 'medium' | 'large'>('medium');
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({ contentRef: printAreaRef as any, documentTitle: 'barcode-label' });

  // Image upload state
  const [imageMethod, setImageMethod] = useState<'upload' | 'camera' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const filtered = parts.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.forModel || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.forBrand || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const totals = useMemo(() => {
    const count = filtered.length;
    const stock = filtered.reduce((s, p) => s + (p.stock || 0), 0);
    const value = filtered.reduce((v, p) => v + ((p.stock || 0) * (p.cost || 0)), 0);
    return { count, stock, value };
  }, [filtered]);

  // จัดกลุ่มสินค้าตามประเภท
  const partsByCategory = useMemo(() => {
    const categories = {
      screen: { name: 'จอ/หน้าจอ', icon: Monitor, parts: [] as any[] },
      battery: { name: 'แบตเตอรี่', icon: Battery, parts: [] as any[] },
      phone: { name: 'มือถือ/แท็บเล็ต', icon: Smartphone, parts: [] as any[] },
      other: { name: 'อื่นๆ', icon: Package, parts: [] as any[] }
    };

    filtered.forEach(part => {
      const name = part.name.toLowerCase();
      if (name.includes('จอ') || name.includes('หน้าจอ') || name.includes('screen') || name.includes('lcd')) {
        categories.screen.parts.push(part);
      } else if (name.includes('แบต') || name.includes('battery') || name.includes('แบตเตอรี่')) {
        categories.battery.parts.push(part);
      } else if (name.includes('มือถือ') || name.includes('phone') || name.includes('แท็บเล็ต') || name.includes('tablet')) {
        categories.phone.parts.push(part);
      } else {
        categories.other.parts.push(part);
      }
    });

    return categories;
  }, [filtered]);

  // จัดกลุ่มตามยี่ห้อ
  const partsByBrand = useMemo(() => {
    const brands: { [key: string]: any[] } = {};
    filtered.forEach(part => {
      const brand = part.forBrand || 'ไม่ระบุยี่ห้อ';
      if (!brands[brand]) brands[brand] = [];
      brands[brand].push(part);
    });
    return brands;
  }, [filtered]);

  // สินค้าที่สต็อกต่ำ
  const lowStockParts = useMemo(() => {
    return filtered.filter(part => part.stock <= (part.minStock || 5));
  }, [filtered]);

  // ระบุหมวดหมู่จากชื่อสินค้าอย่างง่าย
  const getCategoryLabel = (part: any) => {
    const name = (part.name || '').toLowerCase();
    if (name.includes('จอ') || name.includes('หน้าจอ') || name.includes('screen') || name.includes('lcd')) {
      return 'จอ/หน้าจอ';
    }
    if (name.includes('แบต') || name.includes('battery') || name.includes('แบตเตอรี่')) {
      return 'แบตเตอรี่';
    }
    if (name.includes('มือถือ') || name.includes('phone') || name.includes('แท็บเล็ต') || name.includes('tablet')) {
      return 'มือถือ/แท็บเล็ต';
    }
    return 'อื่นๆ';
  };

  const handleAddPart = async () => {
    try {
      await createPart(newPart);
      setNewPart({
        sku: '',
        name: '',
        forBrand: '',
        forModel: '',
        unit: 'ชิ้น',
        cost: 0,
        price: 0,
        stock: 0,
        minStock: 0
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding part:', error);
    }
  };

  const handleSaveEditPart = async () => {
    if (!editingPartId) return;
    try {
      // Handle image data
      let finalImageUrl = imageUrl;
      if (selectedFile) {
        // In a real app, you'd upload the file to a server/CDN
        // For now, we'll use a placeholder or convert to base64
        finalImageUrl = URL.createObjectURL(selectedFile);
      }
      
      await updatePart(editingPartId, { 
        ...editPart, 
        imageUrl: finalImageUrl 
      });
      setIsEditDialogOpen(false);
      setEditingPartId(null);
      setSelectedFile(null);
      setImageUrl('');
    } catch (e) {
      console.error('Error updating part:', e);
    }
  };

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { color: 'destructive', text: 'หมดสต็อก' };
    if (stock <= minStock) return { color: 'destructive', text: 'สต็อกต่ำ' };
    if (stock <= minStock * 2) return { color: 'warning', text: 'สต็อกปานกลาง' };
    return { color: 'default', text: 'สต็อกปกติ' };
  };

  // Actions - basic handlers (สามารถเชื่อมต่อ dialog/flow ภายหลังได้)
  const handleEdit = (p: any) => {
    setEditingPartId(p.id);
    setEditPart({
      sku: p.sku || '',
      name: p.name || '',
      forBrand: p.forBrand || '',
      forModel: p.forModel || '',
      unit: p.unit || 'ชิ้น',
      cost: p.cost || 0,
      price: p.price || 0,
      stock: p.stock || 0,
      minStock: p.minStock || 0,
      imageUrl: p.imageUrl || ''
    });
    setImageUrl(p.imageUrl || '');
    setSelectedFile(null);
    setImageMethod('upload');
    setIsEditDialogOpen(true);
  };
  const handleAdjustStock = (p: any) => {
    setAdjustTarget(p);
    setAdjustType('');
    setAdjustQty(0);
    setAdjustNote('');
    setIsAdjustDialogOpen(true);
  };
  const handleSaveAdjustStock = async () => {
    if (!adjustTarget || !adjustType) return;
    let newStock = Number(adjustTarget.stock || 0);
    const qty = Number(adjustQty || 0);
    if (qty <= 0) return;
    if (adjustType === 'increase') newStock = newStock + qty;
    if (adjustType === 'decrease') newStock = Math.max(0, newStock - qty);
    if (adjustType === 'set') newStock = Math.max(0, qty);
    try {
      await updatePart(adjustTarget.id, { stock: newStock });
      setIsAdjustDialogOpen(false);
      setAdjustTarget(null);
    } catch (e) {
      console.error('Adjust stock failed', e);
    }
  };
  const handlePrintBarcode = (p: any) => {
    setBarcodeTarget(p);
    setBarcodeQty(1);
    setBarcodeSize('medium');
    setIsBarcodeDialogOpen(true);
  };
  const handleDelete = async (p: any) => {
    if (confirm(`ลบสินค้า "${p.name}" ?`)) {
      await deletePart(p.id);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Gradient Info Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold">คลังสินค้า</div>
            <div className="text-white/90 thai-text text-sm md:text-base">
              จำนวนรายการ {totals.count} • คงคลังรวม {totals.stock} • มูลค่าสต็อก {formatCurrency(totals.value)}
            </div>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"> 
              <Plus className="w-4 h-4 mr-2" /> เพิ่มสินค้า
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="thai-text">เพิ่มสินค้าใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="thai-text">SKU</Label>
                  <Input
                    value={newPart.sku}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    placeholder="รหัสสินค้า"
                  />
                </div>
                <div>
                  <Label className="thai-text">หน่วย</Label>
                  <Select value={newPart.unit} onValueChange={(value) => setNewPart({ ...newPart, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                      <SelectItem value="ชุด">ชุด</SelectItem>
                      <SelectItem value="กล่อง">กล่อง</SelectItem>
                      <SelectItem value="เมตร">เมตร</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="thai-text">ชื่อสินค้า</Label>
                <Input
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="ชื่อสินค้า"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="thai-text">ยี่ห้อ</Label>
                  <Input
                    value={newPart.forBrand}
                    onChange={(e) => setNewPart({ ...newPart, forBrand: e.target.value })}
                    placeholder="ยี่ห้อ"
                  />
                </div>
                <div>
                  <Label className="thai-text">รุ่น</Label>
                  <Input
                    value={newPart.forModel}
                    onChange={(e) => setNewPart({ ...newPart, forModel: e.target.value })}
                    placeholder="รุ่น"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="thai-text">ต้นทุน</Label>
                  <Input
                    type="number"
                    value={newPart.cost}
                    onChange={(e) => setNewPart({ ...newPart, cost: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="thai-text">ราคาขาย</Label>
                  <Input
                    type="number"
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="thai-text">สต็อก</Label>
                  <Input
                    type="number"
                    value={newPart.stock}
                    onChange={(e) => setNewPart({ ...newPart, stock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label className="thai-text">สต็อกขั้นต่ำ</Label>
                <Input
                  type="number"
                  value={newPart.minStock}
                  onChange={(e) => setNewPart({ ...newPart, minStock: Number(e.target.value) })}
                  placeholder="5"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddPart} className="flex-1 thai-text">เพิ่มสินค้า</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="thai-text">ยกเลิก</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ค้นหาสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input 
            placeholder="ชื่อสินค้า / ยี่ห้อ / รุ่น" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <Button variant="outline" onClick={() => setSearch('')}>ล้าง</Button>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full" />
        <h3 className="text-xl font-semibold text-foreground">ภาพรวมคลังสินค้า</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">รวมสินค้า</div>
                <div className="text-3xl font-bold text-blue-700 mt-1">{totals.count}</div>
                <div className="text-xs text-blue-700/70 thai-text">รายการ</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Package className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">สต็อกรวม</div>
                <div className="text-3xl font-bold text-indigo-700 mt-1">{totals.stock}</div>
                <div className="text-xs text-indigo-700/70 thai-text">ชิ้น</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Database className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">มูลค่าสต็อก</div>
                <div className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(totals.value)}</div>
                <div className="text-xs text-emerald-700/70 thai-text">บาท</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">สต็อกต่ำ</div>
                <div className="text-3xl font-bold text-rose-700 mt-1">{lowStockParts.length}</div>
                <div className="text-xs text-rose-700/70 thai-text">รายการ</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="category" className="thai-text">แยกตามประเภท</TabsTrigger>
          <TabsTrigger value="brand" className="thai-text">แยกตามยี่ห้อ</TabsTrigger>
          <TabsTrigger value="lowstock" className="thai-text">สต็อกต่ำ</TabsTrigger>
          <TabsTrigger value="all" className="thai-text">รายการทั้งหมด</TabsTrigger>
        </TabsList>

        {/* แยกตามประเภท */}
        <TabsContent value="category" className="space-y-4">
          {Object.entries(partsByCategory).map(([key, category]) => (
            <Card key={key} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 thai-text">
                  <category.icon className="h-5 w-5" />
                  {category.name} ({category.parts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {category.parts.length === 0 ? (
                  <div className="text-center py-6 thai-text text-muted-foreground">ไม่มีสินค้าในหมวดนี้</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.parts.map(part => {
                      const stockStatus = getStockStatus(part.stock, part.minStock);
                      return (
                        <Card key={part.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium thai-text">{part.name}</h4>
                            <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground thai-text mb-2">
                            {part.forBrand} {part.forModel}
                          </p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="thai-text">SKU:</span>
                              <span className="font-mono">{part.sku}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="thai-text">สต็อก:</span>
                              <span className="font-medium">{part.stock} {part.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="thai-text">ราคา:</span>
                              <span className="font-medium">{formatCurrency(part.price)}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* แยกตามยี่ห้อ */}
        <TabsContent value="brand" className="space-y-4">
          {Object.entries(partsByBrand).map(([brand, brandParts]) => (
            <Card key={brand} className="glass-card">
              <CardHeader>
                <CardTitle className="thai-text">{brand} ({brandParts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandParts.map(part => {
                    const stockStatus = getStockStatus(part.stock, part.minStock);
                    return (
                      <Card key={part.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium thai-text">{part.name}</h4>
                          <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground thai-text mb-2">
                          {part.forModel}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="thai-text">SKU:</span>
                            <span className="font-mono">{part.sku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="thai-text">สต็อก:</span>
                            <span className="font-medium">{part.stock} {part.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="thai-text">ราคา:</span>
                            <span className="font-medium">{formatCurrency(part.price)}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* สต็อกต่ำ */}
        <TabsContent value="lowstock" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 thai-text text-destructive">
                <AlertTriangle className="h-5 w-5" />
                สินค้าสต็อกต่ำ ({lowStockParts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockParts.length === 0 ? (
                <div className="text-center py-6 thai-text text-muted-foreground">ไม่มีสินค้าสต็อกต่ำ</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockParts.map(part => (
                    <Card key={part.id} className="p-4 border-destructive/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium thai-text">{part.name}</h4>
                        <Badge variant="destructive">สต็อกต่ำ</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground thai-text mb-2">
                        {part.forBrand} {part.forModel}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="thai-text">SKU:</span>
                          <span className="font-mono">{part.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="thai-text">สต็อกปัจจุบัน:</span>
                          <span className="font-medium text-destructive">{part.stock} {part.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="thai-text">สต็อกขั้นต่ำ:</span>
                          <span className="font-medium">{part.minStock || 5} {part.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="thai-text">ราคา:</span>
                          <span className="font-medium">{formatCurrency(part.price)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* รายการทั้งหมด */}
        <TabsContent value="all" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="thai-text">รายการทั้งหมด ({totals.count})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-10 thai-text text-muted-foreground">ไม่พบสินค้า</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="thai-text w-[60px]">รูปภาพ</TableHead>
                        <TableHead className="thai-text">รหัสสินค้า</TableHead>
                        <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                        <TableHead className="thai-text">ยี่ห้อ/รุ่น</TableHead>
                        <TableHead className="thai-text">หมวดหมู่</TableHead>
                        <TableHead className="thai-text">ต้นทุน</TableHead>
                        <TableHead className="thai-text">ราคาขาย</TableHead>
                        <TableHead className="thai-text">สต็อก</TableHead>
                        <TableHead className="thai-text">สถานะ</TableHead>
                        <TableHead className="thai-text text-center">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(p => {
                        const stockStatus = getStockStatus(p.stock, p.minStock);
                        const categoryLabel = getCategoryLabel(p);
                        return (
                          <TableRow key={p.id}>
                            <TableCell>
                              <img
                                src={p.imageUrl || '/placeholder.svg'}
                                alt={p.name}
                                className="w-10 h-10 rounded-md object-cover bg-muted"
                              />
                            </TableCell>
                            <TableCell className="font-mono">{p.sku}</TableCell>
                            <TableCell className="thai-text font-medium">{p.name}</TableCell>
                            <TableCell className="thai-text">{p.forBrand || '-'} {p.forModel || ''}</TableCell>
                            <TableCell className="thai-text">{categoryLabel}</TableCell>
                            <TableCell>{formatCurrency(p.cost)}</TableCell>
                            <TableCell>{formatCurrency(p.price)}</TableCell>
                            <TableCell className="thai-text">{p.stock} {p.unit}</TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" className="rounded-md bg-amber-400 hover:bg-amber-500 text-black" onClick={() => handleEdit(p)}>
                                  <SquarePen className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" className="rounded-md bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => handleAdjustStock(p)}>
                                  <Wrench className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePrintBarcode(p)}>
                                  <Barcode className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" className="rounded-md bg-rose-600 hover:bg-rose-700 text-white" onClick={() => handleDelete(p)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl w-[1000px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 thai-text">
              <SquarePen className="w-4 h-4" /> แก้ไขสินค้า
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Product Information Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="thai-text">ชื่อสินค้า *</Label>
                  <Input value={editPart.name} onChange={(e) => setEditPart({ ...editPart, name: e.target.value })} />
                </div>
                <div>
                  <Label className="thai-text">รหัสสินค้า *</Label>
                  <Input value={editPart.sku} onChange={(e) => setEditPart({ ...editPart, sku: e.target.value })} />
                </div>
                <div>
                  <Label className="thai-text">หมวดหมู่ *</Label>
                  <Input value={getCategoryLabel({ name: editPart.name })} disabled />
                  <div className="text-xs text-muted-foreground mt-1 thai-text">
                    หากต้องการเพิ่มหมวดหมู่ใหม่ กรุณาไปที่{' '}
                    <span className="text-blue-600 cursor-pointer hover:underline">จัดการหมวดหมู่</span>
                  </div>
                </div>
                <div>
                  <Label className="thai-text">สถานะ</Label>
                  <Input value={editPart.stock > 0 ? 'ใช้งาน' : 'หมดสต็อก'} disabled />
                </div>
              </div>

              {/* Details Section */}
              <div>
                <Label className="thai-text">รายละเอียด</Label>
                <Textarea 
                  value={editPart.forModel} 
                  onChange={(e) => setEditPart({ ...editPart, forModel: e.target.value })} 
                  placeholder="รายละเอียด/รุ่น"
                  className="min-h-[100px] resize-y"
                />
              </div>

              {/* Pricing and Stock Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="thai-text">ราคาทุน (บาท)</Label>
                  <Input type="number" value={editPart.cost} onChange={(e) => setEditPart({ ...editPart, cost: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="thai-text">ราคาขาย (บาท) *</Label>
                  <Input type="number" value={editPart.price} onChange={(e) => setEditPart({ ...editPart, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="thai-text">จำนวนสต็อก</Label>
                  <Input type="number" value={editPart.stock} onChange={(e) => setEditPart({ ...editPart, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="thai-text">จำนวนสต็อกขั้นต่ำ</Label>
                  <Input type="number" value={editPart.minStock} onChange={(e) => setEditPart({ ...editPart, minStock: Number(e.target.value) })} />
                </div>
              </div>

              {/* Brand Section */}
              <div>
                <Label className="thai-text">แบรนด์</Label>
                <Input value={editPart.forBrand} onChange={(e) => setEditPart({ ...editPart, forBrand: e.target.value })} />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold thai-text mb-2">รูปภาพสินค้า</h3>
                <p className="text-sm text-muted-foreground thai-text">เลือกวิธีการเพิ่มรูปภาพ</p>
              </div>
              
              {/* Method Selection */}
              <div className="flex gap-2">
                <Button
                  variant={imageMethod === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageMethod('upload')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  อัพโหลดไฟล์
                </Button>
                <Button
                  variant={imageMethod === 'camera' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageMethod('camera')}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  ถ่ายภาพ
                </Button>
                <Button
                  variant={imageMethod === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageMethod('url')}
                  className="flex-1"
                >
                  <Link className="w-4 h-4 mr-1" />
                  URL
                </Button>
              </div>

              {/* Upload File Method */}
              {imageMethod === 'upload' && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground thai-text">
                          {selectedFile ? selectedFile.name : 'เลือกไฟล์'}
                        </div>
                        <div className="text-xs text-muted-foreground thai-text mt-1">
                          {selectedFile ? 'ไฟล์ที่เลือกแล้ว' : 'ไม่ได้เลือกไฟล์ใด'}
                        </div>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground thai-text">
                    อัพโหลดไฟล์ภาพ (JPG, PNG, GIF) ขนาดไม่เกิน 5MB
                  </p>
                </div>
              )}

              {/* Camera Method */}
              {imageMethod === 'camera' && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm text-muted-foreground thai-text">
                      ฟีเจอร์ถ่ายภาพจะเปิดใช้งานเร็วๆ นี้
                    </div>
                  </div>
                </div>
              )}

              {/* URL Method */}
              {imageMethod === 'url' && (
                <div className="space-y-2">
                  <Input
                    placeholder="ใส่ URL รูปภาพ"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground thai-text">
                    ใส่ลิงก์รูปภาพจากอินเทอร์เน็ต
                  </p>
                </div>
              )}

              {/* Image Preview */}
              {(selectedFile || imageUrl) && (
                <div className="mt-4">
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="thai-text">
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEditPart} className="thai-text">
              อัพเดทสินค้า
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-2xl w-[640px]">
          <DialogHeader>
            <DialogTitle className="thai-text">ปรับปรุงสต็อกสินค้า</DialogTitle>
          </DialogHeader>
          {adjustTarget && (
            <div className="space-y-4">
              <div className="thai-text">
                <div className="text-muted-foreground">ชื่อสินค้า:</div>
                <div className="font-semibold">{adjustTarget.name}</div>
              </div>
              <div className="thai-text">
                <div className="text-muted-foreground">สต็อกปัจจุบัน:</div>
                <div className="text-primary font-bold">{adjustTarget.stock || 0} ชิ้น</div>
              </div>
              <div>
                <Label className="thai-text">ประเภทการปรับปรุง:</Label>
                <Select value={adjustType} onValueChange={(v: any) => setAdjustType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">เพิ่มสต็อก</SelectItem>
                    <SelectItem value="decrease">ลดสต็อก</SelectItem>
                    <SelectItem value="set">ตั้งค่าสต็อก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="thai-text">จำนวน:</Label>
                <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} />
              </div>
              <div>
                <Label className="thai-text">หมายเหตุ:</Label>
                <Textarea placeholder="ระบุเหตุผลในการปรับปรุงสต็อก" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" className="thai-text" onClick={() => setIsAdjustDialogOpen(false)}>ยกเลิก</Button>
                <Button className="thai-text" onClick={handleSaveAdjustStock}>บันทึกการปรับปรุง</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Barcode Dialog */}
      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent className="max-w-3xl w-[760px]">
          <DialogHeader>
            <DialogTitle className="thai-text">พิมพ์บาร์โค้ดสินค้า</DialogTitle>
          </DialogHeader>
          {barcodeTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="thai-text">จำนวนป้าย:</Label>
                  <Input type="number" min={1} value={barcodeQty} onChange={(e) => setBarcodeQty(Math.max(1, Number(e.target.value)))} />
                </div>
                <div>
                  <Label className="thai-text">ขนาดป้าย:</Label>
                  <Select value={barcodeSize} onValueChange={(v: any) => setBarcodeSize(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกขนาด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">เล็ก (38x21 มม.)</SelectItem>
                      <SelectItem value="medium">กลาง (50x25 มม.)</SelectItem>
                      <SelectItem value="large">ใหญ่ (70x30 มม.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="thai-text text-center text-muted-foreground">ตัวอย่างป้ายบาร์โค้ด</div>
              <div className="flex items-center justify-center">
                <div ref={printAreaRef} className="bg-white p-6 rounded-md border shadow-sm">
                  <div className="text-center font-semibold mb-2">{barcodeTarget.name}</div>
                  {/* Simple barcode using SKU rendered as bars via CSS fallback; real barcode lib can be swapped in later */}
                  <div className="bg-black h-16 w-[360px] mx-auto mb-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" />
                  <div className="text-center text-xs font-mono">{barcodeTarget.sku || 'NO-SKU'}</div>
                  <div className="text-xs text-center mt-2 thai-text">รหัส: {barcodeTarget.sku || '-'} ราคา: {formatCurrency(barcodeTarget.price || 0)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" className="thai-text" onClick={() => setIsBarcodeDialogOpen(false)}>ยกเลิก</Button>
                <Button className="thai-text" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> พิมพ์บาร์โค้ด</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


