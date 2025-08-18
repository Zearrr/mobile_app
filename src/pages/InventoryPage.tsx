import { useState } from 'react';
import { Plus, Search, Package, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRepairStore } from '@/stores/useRepairStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const partSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่ออะไหล่'),
  brand: z.string().optional(),
  model: z.string().optional(),
  cost: z.number().min(0, 'ต้นทุนต้องเป็นจำนวนบวก'),
  price: z.number().min(0, 'ราคาขายต้องเป็นจำนวนบวก'),
  stock: z.number().min(0, 'จำนวนสต็อกต้องเป็นจำนวนบวก'),
  category: z.string().optional(),
});

type PartFormData = z.infer<typeof partSchema>;

const categories = [
  'หน้าจอ',
  'แบตเตอรี่',
  'กล้อง', 
  'ลำโพง',
  'ไมโครโฟน',
  'แจ็คหูฟัง',
  'ปุ่มกด',
  'บอร์ด',
  'เคส',
  'อื่นๆ'
];

const brands = [
  'Apple',
  'Samsung',
  'Huawei',
  'Xiaomi',
  'Oppo',
  'Vivo',
  'OnePlus',
  'Generic'
];

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  
  const { parts, createPart, updatePart, deletePart } = useRepairStore();
  const { toast } = useToast();

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      cost: 0,
      price: 0,
      stock: 0,
      category: '',
    },
  });

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesBrand = brandFilter === 'all' || part.brand === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleSubmit = async (data: PartFormData) => {
    try {
      if (editingPart) {
        await updatePart(editingPart.id, data);
        toast({
          title: 'อัปเดตอะไหล่สำเร็จ',
          description: 'ข้อมูลอะไหล่ถูกอัปเดตเรียบร้อยแล้ว',
        });
      } else {
        await createPart(data);
        toast({
          title: 'เพิ่มอะไหล่สำเร็จ',
          description: 'อะไหล่ใหม่ถูกเพิ่มเรียบร้อยแล้ว',
        });
      }
      
      setIsDialogOpen(false);
      setEditingPart(null);
      form.reset();
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (part: any) => {
    setEditingPart(part);
    form.reset({
      name: part.name,
      brand: part.brand || '',
      model: part.model || '',
      cost: part.cost,
      price: part.price,
      stock: part.stock,
      category: part.category || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('ต้องการลบอะไหล่นี้หรือไม่?')) {
      try {
        await deletePart(id);
        toast({
          title: 'ลบอะไหล่สำเร็จ',
          description: 'อะไหล่ถูกลบเรียบร้อยแล้ว',
        });
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถลบอะไหล่ได้ กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
      }
    }
  };

  const handleNewPart = () => {
    setEditingPart(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const lowStockParts = parts.filter(part => part.stock <= 5);
  const totalValue = parts.reduce((sum, part) => sum + (part.cost * part.stock), 0);
  const potentialRevenue = parts.reduce((sum, part) => sum + (part.price * part.stock), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">คลังอะไหล่</h1>
          <p className="text-muted-foreground mt-1">จัดการสต็อกอะไหล่และราคา</p>
        </div>
        <Button onClick={handleNewPart} className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มอะไหล่ใหม่
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายการทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              สต็อกต่ำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockParts.length}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">มูลค่าสต็อก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">มูลค่าขาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{potentialRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              แจ้งเตือนสต็อกต่ำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">อะไหล่ที่มีสต็อกต่ำกว่า 5 ชิ้น:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockParts.map(part => (
                <Badge key={part.id} variant="outline" className="border-orange-300 text-orange-700">
                  {part.name} ({part.stock} ชิ้น)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ค้นหาชื่ออะไหล่, ยี่ห้อ, รุ่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ยี่ห้อ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกยี่ห้อ</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการอะไหล่ ({filteredParts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบอะไหล่</h3>
              <p className="text-muted-foreground mb-4">ลองปรับเปลี่ยนตัวกรองหรือเพิ่มอะไหล่ใหม่</p>
              <Button onClick={handleNewPart}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มอะไหล่ใหม่
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่ออะไหล่</TableHead>
                    <TableHead>ยี่ห้อ/รุ่น</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ต้นทุน</TableHead>
                    <TableHead>ราคาขาย</TableHead>
                    <TableHead>กำไร</TableHead>
                    <TableHead>สต็อก</TableHead>
                    <TableHead>มูลค่า</TableHead>
                    <TableHead>วันที่เพิ่ม</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => {
                    const profit = part.price - part.cost;
                    const profitPercent = part.cost > 0 ? ((profit / part.cost) * 100) : 0;
                    const stockValue = part.cost * part.stock;
                    
                    return (
                      <TableRow key={part.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{part.brand || '-'}</div>
                            <div className="text-sm text-muted-foreground">{part.model || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {part.category ? (
                            <Badge variant="secondary">{part.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ฿{part.cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ฿{part.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className={profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              ฿{profit.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {profitPercent.toFixed(1)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={part.stock <= 5 ? 'destructive' : part.stock <= 10 ? 'secondary' : 'default'}
                          >
                            {part.stock} ชิ้น
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ฿{stockValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(part.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(part)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(part.id)}
                              className="text-destructive hover:text-destructive"
                            >
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

      {/* Add/Edit Part Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPart ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่ใหม่'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่ออะไหล่ *</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น หน้าจอ iPhone 13" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมวดหมู่</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ยี่ห้อ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกยี่ห้อ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รุ่น</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น iPhone 13, Galaxy S21" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ต้นทุน (บาท) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ราคาขาย (บาท) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>จำนวนสต็อก *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Profit Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">กำไรต่อหน่วย:</span>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      ฿{((form.watch('price') || 0) - (form.watch('cost') || 0)).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch('cost') > 0 
                        ? (((form.watch('price') || 0) - (form.watch('cost') || 0)) / (form.watch('cost') || 1) * 100).toFixed(1)
                        : 0
                      }%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingPart ? 'อัปเดต' : 'เพิ่ม'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}