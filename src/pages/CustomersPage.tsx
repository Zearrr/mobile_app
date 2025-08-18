import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, MessageCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRepairStore } from '@/stores/useRepairStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const customerSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
  phone: z.string().min(10, 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง'),
  lineId: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  const { customers, jobs, createCustomer, updateCustomer, deleteCustomer, getJobsByCustomer } = useRepairStore();
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      lineId: '',
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
        toast({
          title: 'อัปเดตข้อมูลสำเร็จ',
          description: 'ข้อมูลลูกค้าถูกอัปเดตเรียบร้อยแล้ว',
        });
      } else {
        await createCustomer(data);
        toast({
          title: 'เพิ่มลูกค้าสำเร็จ',
          description: 'ลูกค้าใหม่ถูกเพิ่มเรียบร้อยแล้ว',
        });
      }
      
      setIsDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      phone: customer.phone,
      lineId: customer.lineId || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const customerJobs = getJobsByCustomer(id);
    if (customerJobs.length > 0) {
      toast({
        title: 'ไม่สามารถลบได้',
        description: 'ลูกค้านี้มีประวัติการซ่อมอยู่ ไม่สามารถลบได้',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('ต้องการลบลูกค้านี้หรือไม่?')) {
      try {
        await deleteCustomer(id);
        toast({
          title: 'ลบลูกค้าสำเร็จ',
          description: 'ลูกค้าถูกลบเรียบร้อยแล้ว',
        });
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถลบลูกค้าได้ กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
      }
    }
  };

  const handleNewCustomer = () => {
    setEditingCustomer(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ลูกค้า</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลลูกค้าและประวัติการซ่อม</p>
        </div>
        <Button onClick={handleNewCustomer} className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>สรุป</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{customers.length}</div>
              <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => getJobsByCustomer(c.id).length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">ลูกค้าที่เคยใช้บริการ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customers.filter(c => getJobsByCustomer(c.id).some(j => j.status !== 'done')).length}
              </div>
              <div className="text-sm text-muted-foreground">ลูกค้าที่มีงานค้าง</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            ค้นหาลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาชื่อลูกค้าหรือหมายเลขโทรศัพท์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อลูกค้า ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">ไม่พบลูกค้า</h3>
              <p className="text-muted-foreground mb-4">ลองค้นหาด้วยคำอื่นหรือเพิ่มลูกค้าใหม่</p>
              <Button onClick={handleNewCustomer}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลูกค้าใหม่
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อลูกค้า</TableHead>
                    <TableHead>โทรศัพท์</TableHead>
                    <TableHead>Line ID</TableHead>
                    <TableHead>จำนวนงาน</TableHead>
                    <TableHead>งานล่าสุด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่เพิ่ม</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const customerJobs = getJobsByCustomer(customer.id);
                    const lastJob = customerJobs[0]; // Jobs are sorted by date desc
                    const hasActiveJob = customerJobs.some(job => job.status !== 'done' && job.status !== 'cancelled');
                    
                    return (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.lineId ? (
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              {customer.lineId}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {customerJobs.length} งาน
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lastJob ? (
                            <div className="text-sm">
                              <div className="font-medium">{lastJob.brand} {lastJob.model}</div>
                              <div className="text-muted-foreground">{formatDate(lastJob.receivedAt)}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasActiveJob ? 'default' : 'secondary'}>
                            {hasActiveJob ? 'มีงานค้าง' : 'ปกติ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(customer.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อลูกค้า *</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกชื่อลูกค้า" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเลขโทรศัพท์ *</FormLabel>
                    <FormControl>
                      <Input placeholder="081-234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line ID (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input placeholder="@lineId" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'อัปเดต' : 'เพิ่ม'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}