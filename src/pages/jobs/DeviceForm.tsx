import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const deviceSchema = z.object({
  brand: z.string().min(1, 'กรุณากรอกยี่ห้อ'),
  model: z.string().min(1, 'กรุณากรอกรุ่น'),
  color: z.string().optional(),
  imei: z.string().optional(),
  serial: z.string().optional(),
  deviceType: z.enum(['phone', 'tablet', 'laptop', 'desktop', 'other']).default('phone'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).default('good'),
  accessories: z.string().optional(),
  password: z.string().optional(),
  note: z.string().optional()
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface DeviceFormProps {
  defaultValues?: Partial<DeviceFormData>;
  onSubmit: (data: DeviceFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const DeviceForm = ({ defaultValues, onSubmit, onCancel, isSubmitting = false }: DeviceFormProps) => {
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      brand: '',
      model: '',
      color: '',
      imei: '',
      serial: '',
      deviceType: 'phone',
      condition: 'good',
      accessories: '',
      password: '',
      note: '',
      ...defaultValues
    }
  });

  const handleSubmit = (data: DeviceFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="thai-text flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          ข้อมูลอุปกรณ์
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ประเภทอุปกรณ์</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone">มือถือ</SelectItem>
                        <SelectItem value="tablet">แท็บเล็ต</SelectItem>
                        <SelectItem value="laptop">แล็ปท็อป</SelectItem>
                        <SelectItem value="desktop">เดสก์ท็อป</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">สภาพอุปกรณ์</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสภาพอุปกรณ์" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">ดีเยี่ยม</SelectItem>
                        <SelectItem value="good">ดี</SelectItem>
                        <SelectItem value="fair">ปานกลาง</SelectItem>
                        <SelectItem value="poor">แย่</SelectItem>
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
                    <FormLabel className="thai-text">ยี่ห้อ *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="เช่น Apple, Samsung, Huawei" 
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
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">รุ่น *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="เช่น iPhone 12, Galaxy S21" 
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">สี</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="เช่น สีดำ, สีขาว, สีทอง" 
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
                name="imei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">IMEI</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="หมายเลข IMEI" 
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
                name="serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">Serial Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="หมายเลข Serial" 
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="รหัสผ่านอุปกรณ์ (ถ้ามี)" 
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
                name="accessories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">อุปกรณ์เสริม</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="เช่น สายชาร์จ, หูฟัง, กล่อง" 
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
                      placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับอุปกรณ์" 
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
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลอุปกรณ์'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeviceForm;
