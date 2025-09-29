import { PageHeader } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { AlertTriangle, Barcode, Battery, Database, Edit, Eye, Filter, Monitor, Package, RotateCcw, Smartphone, Trash2, Wallet } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
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
  const [printOpen, setPrintOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [labelQty, setLabelQty] = useState<number>(1);
  const [labelSize, setLabelSize] = useState<'50x25' | '70x30' | '80x50'>('50x25');
  const labelTemplateRef = useRef<HTMLDivElement>(null);

  const getLabelPx = () => {
    switch (labelSize) {
      case '70x30':
        return { width: 280, height: 120 };
      case '80x50':
        return { width: 320, height: 200 };
      case '50x25':
      default:
        return { width: 240, height: 100 };
    }
  };

  const doWindowPrint = (html: string) => {
    const w = window.open('', '', 'height=700,width=900');
    if (!w) return;
    w.document.write('<html><head><title>Barcode</title>');
    w.document.write('<style>body{font-family:sans-serif;padding:12px} .label{display:inline-block;margin:6px;padding:8px;border:1px solid #e5e7eb;border-radius:8px} .name{font-weight:700;text-align:center;margin-bottom:6px} .meta{font-size:12px;color:#6b7280;text-align:center;margin-top:4px}</style>');
    w.document.write('</head><body>');
    w.document.write(html);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const openPrint = (part: any) => {
    setSelectedPart(part);
    setLabelQty(1);
    setLabelSize('50x25');
    setPrintOpen(true);
  };

  const onConfirmPrint = () => {
    if (!selectedPart) return;
    const { width, height } = getLabelPx();
    const tpl = labelTemplateRef.current?.innerHTML || '';
    const labels: string[] = [];
    for (let i = 0; i < Math.max(1, labelQty); i++) {
      labels.push(`<div class=\"label\" style=\"width:${width}px;height:${height}px\">${tpl}</div>`);
    }
    doWindowPrint(labels.join(''));
    setPrintOpen(false);
  };

  const FauxBarcode = ({ value, height = 60 }: { value: string; height?: number }) => (
    <div className="flex flex-col items-center">
      <div style={{ width: 220, height, background: 'repeating-linear-gradient(90deg,#111 0,#111 2px,#fff 2px,#fff 4px)' }} />
    </div>
  );

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
                          <TableHead className="thai-text">รูป</TableHead>
                          <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                          <TableHead className="thai-text">รายละเอียด</TableHead>
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
                              <TableCell>
                                <img src={part.imageUrl || '/placeholder.svg'} alt={part.name} className="w-12 h-12 rounded-md object-cover border" />
                              </TableCell>
                              <TableCell className="thai-text font-medium">{part.name}</TableCell>
                              <TableCell className="thai-text text-muted-foreground max-w-[220px] truncate">{((part as any).description || '-')}</TableCell>
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
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 btn-outline" title="พิมพ์บาร์โค้ด" onClick={() => openPrint(part)}>
                                    <Barcode className="w-4 h-4" />
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
                            <TableHead className="thai-text">รูป</TableHead>
                            <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                            <TableHead className="thai-text">รายละเอียด</TableHead>
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
                                <TableCell>
                                  <img src={part.imageUrl || '/placeholder.svg'} alt={part.name} className="w-12 h-12 rounded-md object-cover border" />
                                </TableCell>
                                <TableCell className="thai-text font-medium">{part.name}</TableCell>
                                <TableCell className="thai-text text-muted-foreground max-w-[220px] truncate">{((part as any).description || '-')}</TableCell>
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
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 btn-outline" title="พิมพ์บาร์โค้ด" onClick={() => openPrint(part)}>
                                      <Barcode className="w-4 h-4" />
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

      {/* Print Barcode Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>พิมพ์บาร์โค้ดสินค้า</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm mb-2">จำนวนป้าย:</div>
              <Input type="number" min={1} value={labelQty} onChange={(e) => setLabelQty(parseInt(e.target.value || '1', 10))} />
            </div>
            <div>
              <div className="text-sm mb-2">ขนาดป้าย:</div>
              <Select value={labelSize} onValueChange={(v) => setLabelSize(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกขนาดป้าย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50x25">กลาง (50x25 มม.)</SelectItem>
                  <SelectItem value="70x30">ใหญ่ (70x30 มม.)</SelectItem>
                  <SelectItem value="80x50">ใหญ่มาก (80x50 มม.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center">
            {selectedPart && (() => {
              const { width, height } = getLabelPx();
              return (
                <div ref={labelTemplateRef} style={{ width, height }} className="border rounded-lg mx-auto flex flex-col items-center justify-center gap-2 bg-white p-4">
                  <div className="name font-semibold text-center">{selectedPart.name}</div>
                  <div className="font-mono">{selectedPart.sku || '-'}</div>
                  <FauxBarcode value={selectedPart.sku || selectedPart.id} height={60} />
                  <div className="meta text-xs text-muted-foreground">ราคา: {formatCurrency(selectedPart.price)}</div>
                </div>
              );
            })()}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPrintOpen(false)}>ยกเลิก</Button>
            <Button onClick={onConfirmPrint}>พิมพ์บาร์โค้ด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


