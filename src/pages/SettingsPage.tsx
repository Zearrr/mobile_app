import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Store, Percent, Calendar, Shield, CreditCard, FileText, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';

const settingsSchema = z.object({
  storeName: z.string().min(1, 'กรุณากรอกชื่อร้าน'),
  address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  phone: z.string().min(10, 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง'),
  line: z.string().optional(),
  profitPercentDefault: z.number().min(0).max(100, 'เปอร์เซ็นต์กำไรต้องอยู่ระหว่าง 0-100'),
  warrantyDefaultDays: z.number().min(0, 'จำนวนวันต้องเป็นจำนวนบวก'),
  pdpaText: z.string().min(1, 'กรุณากรอกข้อความ PDPA'),
  promptPayId: z.string().optional(),
  bankAccount: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { toast } = useToast();
  const { settings, updateSettings, jobs, customers, parts, payments } = useRepairStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: settings?.storeName || 'Mobile Repair Pro',
      address: settings?.address || '',
      phone: settings?.phone || '',
      line: settings?.line || '',
      profitPercentDefault: settings?.profitPercentDefault || 30,
      warrantyDefaultDays: settings?.warrantyDefaultDays || 30,
      pdpaText: settings?.pdpaText || `ร้านของเรารับประกันความปลอดภัยของข้อมูลส่วนบุคคลของคุณ เราจะเก็บรักษาข้อมูลของคุณเป็นความลับและใช้เพื่อการให้บริการซ่อมแซมเท่านั้น\n\nข้อมูลที่เราเก็บรวบรวม ได้แก่ ชื่อ หมายเลขโทรศัพท์ Line ID และข้อมูลอุปกรณ์ที่นำมาซ่อม\n\nคุณมีสิทธิในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา`,
      promptPayId: settings?.promptPayId || '',
      bankAccount: settings?.bankAccount || '',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await updateSettings(data);
      toast({
        title: 'บันทึกการตั้งค่าสำเร็จ',
        description: 'การตั้งค่าถูกอัปเดตเรียบร้อยแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = () => {
    const data = {
      settings,
      jobs,
      customers,
      parts,
      payments,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'ส่งออกข้อมูลสำเร็จ',
      description: 'ไฟล์สำรองข้อมูลถูกดาวน์โหลดแล้ว',
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.settings || !data.jobs || !data.customers) {
          throw new Error('Invalid backup file format');
        }

        // Here you would implement the import logic
        // For now, just show a success message
        toast({
          title: 'นำเข้าข้อมูลสำเร็จ',
          description: 'ข้อมูลถูกนำเข้าเรียบร้อยแล้ว (ฟีเจอร์นี้อยู่ระหว่างการพัฒนา)',
        });
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไฟล์สำรองข้อมูลไม่ถูกต้องหรือเสียหาย',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-1">จัดการการตั้งค่าร้านและระบบ</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store">ข้อมูลร้าน</TabsTrigger>
          <TabsTrigger value="defaults">ค่าเริ่มต้น</TabsTrigger>
          <TabsTrigger value="payment">การชำระเงิน</TabsTrigger>
          <TabsTrigger value="pdpa">PDPA</TabsTrigger>
          <TabsTrigger value="backup">สำรองข้อมูล</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="store" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    ข้อมูลร้าน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อร้าน *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mobile Repair Pro" {...field} />
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
                        <FormLabel>ที่อยู่ *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123/45 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หมายเลขโทรศัพท์ *</FormLabel>
                          <FormControl>
                            <Input placeholder="02-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="line"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line ID</FormLabel>
                          <FormControl>
                            <Input placeholder="@repairshop" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="defaults" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    ค่าเริ่มต้น
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profitPercentDefault"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เปอร์เซ็นต์กำไรเริ่มต้น (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            ใช้สำหรับคำนวณราคาขายจากต้นทุน
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="warrantyDefaultDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รับประกันเริ่มต้น (วัน)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            จำนวนวันรับประกันที่จะตั้งค่าอัตโนมัติ
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    การชำระเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="promptPayId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PromptPay ID</FormLabel>
                        <FormControl>
                          <Input placeholder="0812345678 หรือ 1234567890123" {...field} />
                        </FormControl>
                        <FormDescription>
                          หมายเลขโทรศัพท์หรือบัตรประชาชนสำหรับ PromptPay
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลขที่บัญชีธนาคาร</FormLabel>
                        <FormControl>
                          <Input placeholder="123-4-56789-0 (ธนาคารกสิกรไทย)" {...field} />
                        </FormControl>
                        <FormDescription>
                          เลขที่บัญชีและชื่อธนาคารสำหรับการโอนเงิน
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('promptPayId') && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">ตัวอย่าง QR Code</h4>
                      <div className="w-32 h-32 bg-white border border-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">QR Preview</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        QR Code จะแสดงในใบแจ้งซ่อม
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pdpa" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    ข้อความ PDPA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="pdpaText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ข้อความแจ้งเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="ใส่ข้อความ PDPA ที่จะแสดงในใบแจ้งซ่อม..."
                            className="min-h-[300px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          ข้อความนี้จะแสดงในใบแจ้งซ่อมและหน้าสาธารณะ
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    สำรองข้อมูล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExportData}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ส่งออกข้อมูล
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                        id="import-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('import-file')?.click()}
                        className="gap-2 w-full"
                      >
                        <Upload className="w-4 h-4" />
                        นำเข้าข้อมูล
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>ข้อมูลที่จะสำรอง:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>ข้อมูลลูกค้า ({customers.length} รายการ)</li>
                      <li>งานซ่อม ({jobs.length} รายการ)</li>
                      <li>อะไหล่ ({parts.length} รายการ)</li>
                      <li>ประวัติการชำระเงิน ({payments.length} รายการ)</li>
                      <li>การตั้งค่าทั้งหมด</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>กำลังบันทึก...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    บันทึกการตั้งค่า
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}