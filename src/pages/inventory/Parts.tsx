import { PageHeader } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, Barcode, Battery, Database, Edit, Eye, Filter, Monitor, Package, RotateCcw, Smartphone, Trash2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { parts, deletePart } = useRepairStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { color: 'destructive', text: 'หมดสต็อก' };
    if (stock <= minStock) return { color: 'destructive', text: 'สต็อกต่ำ' };
    if (stock <= minStock * 2) return { color: 'warning', text: 'สต็อกปานกลาง' };
    return { color: 'default', text: 'สต็อกปกติ' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader 
          title="จัดการอะไหล่/สินค้า" 
          description="จัดการสต็อกอะไหล่และสินค้าทั้งหมด" 
          showActions={true} 
        />

        {/* Dashboard Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">ภาพรวมสต็อก</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-border/50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">รายการสินค้า</div>
                    <div className="text-3xl font-bold text-blue-700 mt-1">{totals.count}</div>
                    <div className="text-xs text-blue-700/70">รายการ</div>
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
                    <div className="text-xs text-muted-foreground">จำนวนในสต็อก</div>
                    <div className="text-3xl font-bold text-emerald-700 mt-1">{totals.stock}</div>
                    <div className="text-xs text-emerald-700/70">ชิ้น</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
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
                    <div className="text-3xl font-bold text-cyan-700 mt-1">{formatCurrency(totals.value)}</div>
                    <div className="text-xs text-cyan-700/70">บาท</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
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
                    <div className="text-xs text-rose-700/70">รายการ</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <span className="thai-text font-medium">ค้นหาและกรอง</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:gap-3 gap-4">
              <Input 
                placeholder="ค้นหา: ชื่อสินค้า, SKU, ยี่ห้อ, รุ่น" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="thai-text md:flex-[2]" 
              />
              <div className="md:w-56">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="หมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                    <SelectItem value="screen">จอ/หน้าจอ</SelectItem>
                    <SelectItem value="battery">แบตเตอรี่</SelectItem>
                    <SelectItem value="phone">มือถือ/แท็บเล็ต</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => { setSearch(''); setCategoryFilter('all'); }} className="btn-outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                ล้าง
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="thai-text">ทั้งหมด ({filtered.length})</TabsTrigger>
            <TabsTrigger value="screen" className="thai-text">จอ/หน้าจอ ({partsByCategory.screen.parts.length})</TabsTrigger>
            <TabsTrigger value="battery" className="thai-text">แบตเตอรี่ ({partsByCategory.battery.parts.length})</TabsTrigger>
            <TabsTrigger value="phone" className="thai-text">มือถือ/แท็บเล็ต ({partsByCategory.phone.parts.length})</TabsTrigger>
            <TabsTrigger value="other" className="thai-text">อื่นๆ ({partsByCategory.other.parts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 thai-text text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ไม่พบรายการตามเงื่อนไข</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="thai-text">SKU</TableHead>
                          <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                          <TableHead className="thai-text">ยี่ห้อ/รุ่น</TableHead>
                          <TableHead className="thai-text">หมวดหมู่</TableHead>
                          <TableHead className="thai-text">สต็อก</TableHead>
                          <TableHead className="thai-text">ต้นทุน</TableHead>
                          <TableHead className="thai-text">ราคาขาย</TableHead>
                          <TableHead className="thai-text">มูลค่า</TableHead>
                          <TableHead className="text-right thai-text">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((part) => {
                          const stockStatus = getStockStatus(part.stock, part.minStock);
                          return (
                            <TableRow key={part.id} className="hover:bg-accent/50">
                              <TableCell className="font-mono font-semibold">{part.sku || '-'}</TableCell>
                              <TableCell className="thai-text font-medium">{part.name}</TableCell>
                              <TableCell className="thai-text">
                                <div>{part.forBrand || '-'}</div>
                                <div className="text-xs text-muted-foreground">{part.forModel || '-'}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryLabel(part)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{part.stock}</span>
                                  <Badge variant={stockStatus.color as any} className="text-xs">
                                    {stockStatus.text}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">{formatCurrency(part.cost)}</TableCell>
                              <TableCell className="font-mono">{formatCurrency(part.price)}</TableCell>
                              <TableCell className="font-mono font-semibold">{formatCurrency(part.stock * part.cost)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                    <Link to={`/parts/${part.id}`} title="ดู">
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                    <Link to={`/parts/${part.id}/edit`} title="แก้ไข">
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                    <Link to={`/parts/${part.id}/barcode`} title="พิมพ์บาร์โค้ด">
                                      <Barcode className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive btn-outline" title="ลบ">
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

          {Object.entries(partsByCategory).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <Card className="glass-card">
                <CardContent className="p-0">
                  {category.parts.length === 0 ? (
                    <div className="text-center py-10 thai-text text-muted-foreground">
                      <category.icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>ไม่มีสินค้าในหมวดหมู่ {category.name}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="thai-text">SKU</TableHead>
                            <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                            <TableHead className="thai-text">ยี่ห้อ/รุ่น</TableHead>
                            <TableHead className="thai-text">สต็อก</TableHead>
                            <TableHead className="thai-text">ต้นทุน</TableHead>
                            <TableHead className="thai-text">ราคาขาย</TableHead>
                            <TableHead className="thai-text">มูลค่า</TableHead>
                            <TableHead className="text-right thai-text">จัดการ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.parts.map((part) => {
                            const stockStatus = getStockStatus(part.stock, part.minStock);
                            return (
                              <TableRow key={part.id} className="hover:bg-accent/50">
                                <TableCell className="font-mono font-semibold">{part.sku || '-'}</TableCell>
                                <TableCell className="thai-text font-medium">{part.name}</TableCell>
                                <TableCell className="thai-text">
                                  <div>{part.forBrand || '-'}</div>
                                  <div className="text-xs text-muted-foreground">{part.forModel || '-'}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono">{part.stock}</span>
                                    <Badge variant={stockStatus.color as any} className="text-xs">
                                      {stockStatus.text}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono">฿{formatCurrency(part.cost)}</TableCell>
                                <TableCell className="font-mono">฿{formatCurrency(part.price)}</TableCell>
                                <TableCell className="font-mono font-semibold">฿{formatCurrency(part.stock * part.cost)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                      <Link to={`/parts/${part.id}`} title="ดู">
                                        <Eye className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                      <Link to={`/parts/${part.id}/edit`} title="แก้ไข">
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
                                      <Link to={`/parts/${part.id}/barcode`} title="พิมพ์บาร์โค้ด">
                                        <Barcode className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive btn-outline" title="ลบ">
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
          ))}
        </Tabs>
      </div>
    </div>
  );
}


