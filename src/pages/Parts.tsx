import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, Battery, Database, Monitor, Package, Plus, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Parts() {
  const { parts, createPart } = useRepairStore();
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

  // จัดกลุ่มอะไหล่ตามประเภท
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

  // อะไหล่ที่สต็อกต่ำ
  const lowStockParts = useMemo(() => {
    return filtered.filter(part => part.stock <= (part.minStock || 5));
  }, [filtered]);

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

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { color: 'destructive', text: 'หมดสต็อก' };
    if (stock <= minStock) return { color: 'destructive', text: 'สต็อกต่ำ' };
    if (stock <= minStock * 2) return { color: 'warning', text: 'สต็อกปานกลาง' };
    return { color: 'default', text: 'สต็อกปกติ' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">อะไหล่</h1>
          <p className="thai-text text-muted-foreground">
            จำนวนรายการ {totals.count} • คงคลังรวม {totals.stock} • มูลค่าสต็อก {formatCurrency(totals.value)}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="thai-text">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มอะไหล่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="thai-text">เพิ่มอะไหล่ใหม่</DialogTitle>
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
                <Label className="thai-text">ชื่ออะไหล่</Label>
                <Input
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="ชื่ออะไหล่"
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
                <Button onClick={handleAddPart} className="flex-1 thai-text">เพิ่มอะไหล่</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="thai-text">ยกเลิก</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ค้นหาอะไหล่</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input 
            placeholder="ชื่ออะไหล่ / ยี่ห้อ / รุ่น" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <Button variant="outline" onClick={() => setSearch('')}>ล้าง</Button>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">รวมอะไหล่</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.count}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">สต็อกรวม</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.stock}</div>
            <p className="text-xs text-muted-foreground thai-text">ชิ้น</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">มูลค่าสต็อก</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.value)}</div>
            <p className="text-xs text-muted-foreground thai-text">บาท</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium thai-text">สต็อกต่ำ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockParts.length}</div>
            <p className="text-xs text-muted-foreground thai-text">รายการ</p>
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
                  <div className="text-center py-6 thai-text text-muted-foreground">ไม่มีอะไหล่ในหมวดนี้</div>
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
                อะไหล่สต็อกต่ำ ({lowStockParts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockParts.length === 0 ? (
                <div className="text-center py-6 thai-text text-muted-foreground">ไม่มีอะไหล่สต็อกต่ำ</div>
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
                <div className="text-center py-10 thai-text text-muted-foreground">ไม่พบอะไหล่</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="thai-text">SKU</TableHead>
                        <TableHead className="thai-text">ชื่อ</TableHead>
                        <TableHead className="thai-text">ยี่ห้อ/รุ่น</TableHead>
                        <TableHead className="thai-text">ต้นทุน</TableHead>
                        <TableHead className="thai-text">ราคาขาย</TableHead>
                        <TableHead className="thai-text">สต็อก</TableHead>
                        <TableHead className="thai-text">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(p => {
                        const stockStatus = getStockStatus(p.stock, p.minStock);
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono">{p.sku}</TableCell>
                            <TableCell className="thai-text font-medium">{p.name}</TableCell>
                            <TableCell className="thai-text">{p.forBrand || '-'} {p.forModel || ''}</TableCell>
                            <TableCell>{formatCurrency(p.cost)}</TableCell>
                            <TableCell>{formatCurrency(p.price)}</TableCell>
                            <TableCell className="thai-text">{p.stock} {p.unit}</TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.color as any}>{stockStatus.text}</Badge>
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
    </div>
  );
}


