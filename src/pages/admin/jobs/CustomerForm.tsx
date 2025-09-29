import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRepairStore } from '@/stores/useRepairStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
  lineId: z.string().optional(),
  altPhone: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CustomerForm = ({ defaultValues, onSubmit, onCancel, isSubmitting = false }: CustomerFormProps) => {
  const { customers, createCustomer } = useRepairStore();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      lineId: '',
      altPhone: '',
      email: '',
      address: '',
      note: '',
      ...defaultValues
    }
  });

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      // ตรวจสอบว่าลูกค้ามีอยู่แล้วหรือไม่
      const existingCustomer = customers.find(c => 
        c.phone === data.phone || 
        (data.lineId && c.lineId === data.lineId)
      );

      if (existingCustomer) {
        // ถ้ามีลูกค้าอยู่แล้ว ให้ใช้ข้อมูลเดิม
        onSubmit({
          ...data,
          name: existingCustomer.name,
          phone: existingCustomer.phone,
          lineId: existingCustomer.lineId || data.lineId,
          altPhone: existingCustomer.altPhone || data.altPhone,
          email: (existingCustomer as any).email || data.email,
          address: (existingCustomer as any).address || data.address
        });
      } else {
        // ถ้าไม่มี ให้สร้างลูกค้าใหม่
        const newCustomer = await createCustomer({
          name: data.name,
          phone: data.phone,
          lineId: data.lineId,
          altPhone: data.altPhone,
          email: data.email,
          address: data.address,
          note: data.note
        } as any);
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error handling customer:', error);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="thai-text flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลลูกค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ชื่อลูกค้า *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ชื่อ-นามสกุล" 
                        {...field} 
                        className="thai-text"
                      />
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
                    <FormLabel className="thai-text">เบอร์โทรศัพท์ *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="081-234-5678" 
                        {...field} 
                        className="thai-text"
                      />
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
                    <FormLabel className="thai-text">Line ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="line_id" 
                        {...field} 
                        className="thai-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="altPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">เบอร์โทรสำรอง</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="เบอร์โทรสำรอง" 
                        {...field} 
                        className="thai-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">อีเมล</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="customer@example.com" 
                        {...field} 
                        className="thai-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ที่อยู่</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ที่อยู่ลูกค้า" 
                        {...field} 
                        className="thai-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="thai-text">หมายเหตุ</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับลูกค้า" 
                      {...field} 
                      className="thai-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="btn-outline"
                >
                  ยกเลิก
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลลูกค้า'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
