import PatternLock from '@/components/PatternLock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { LockType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Common mobile brands for dropdown
const MOBILE_BRANDS = [
  'Apple','Samsung','Xiaomi','Redmi','POCO','Huawei','Honor','Oppo','Vivo','Realme','iQOO','OnePlus','Google',
  'Sony','Nokia','Motorola','Asus','Lenovo','ZTE','Infinix','Tecno','Nothing','Meizu','LG','HTC','BlackBerry',
  'Sharp','Panasonic','Wiko','CAT'
];

const newJobSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
    phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
    lineId: z.string().optional(),
    altPhone: z.string().optional()
  }),
  device: z.object({
    brand: z.string().min(1, 'กรุณากรอกยี่ห้อ'),
    model: z.string().min(1, 'กรุณากรอกรุ่น'),
    color: z.string().optional(),
    imei: z.string().optional(),
    serial: z.string().optional()
  }),
  lock: z.object({
    type: z.enum(['none', 'pin', 'pattern']),
    note: z.string().optional()
  }),
  details: z.object({
    issueDesc: z.string().min(1, 'กรุณากรอกรายละเอียดอาการเสีย'),
    accessories: z.string().optional().default(''),
    preCheck: z.string().optional().default('')
  }),
  pricing: z.object({
    estimateParts: z.coerce.number().min(0).default(0),
    estimateLabor: z.coerce.number().min(0).default(0),
    deposit: z.coerce.number().min(0).default(0)
  }),
  schedule: z.object({
    dueAt: z.string().optional(),
    warrantyDays: z.coerce.number().min(0).default(30),
    technician: z.string().optional()
  })
});

type NewJobForm = z.infer<typeof newJobSchema>;

export default function NewJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJob, createCustomer } = useRepairStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patternLockValue, setPatternLockValue] = useState<number[]>([]);
  const [lockType, setLockType] = useState<LockType>('none');
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<NewJobForm>({
    resolver: zodResolver(newJobSchema),
    defaultValues: {
      customer: {
        name: '',
        phone: '',
        lineId: '',
        altPhone: ''
      },
      device: {
        brand: '',
        model: '',
        color: '',
        imei: '',
        serial: ''
      },
      lock: {
        type: 'none',
        note: ''
      },
      details: {
        issueDesc: '',
        accessories: '',
        preCheck: ''
      },
      pricing: {
        estimateParts: 0,
        estimateLabor: 0,
        deposit: 0
      },
      schedule: {
        dueAt: '',
        warrantyDays: 30,
        technician: ''
      }
    }
  });

  // Responsive Pattern Lock sizing
  useEffect(() => {
    const updatePatternLockSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const size = Math.min(width, height) * 0.8;
        // Update pattern lock size if needed
      }
    };

    const resizeObserver = new ResizeObserver(updatePatternLockSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const onSubmit = async (data: NewJobForm) => {
    setIsSubmitting(true);
    try {
      // Create customer first
      const customer = await createCustomer({
        name: data.customer.name,
        phone: data.customer.phone,
        lineId: data.customer.lineId,
        altPhone: data.customer.altPhone
      });

      // Create job
      const job = await createJob({
        customerId: customer.id,
        brand: data.device.brand,
        model: data.device.model,
        color: data.device.color,
        imei: data.device.imei,
        serial: data.device.serial,
        lockType: data.lock.type,
        lockNote: data.lock.note,
        patternLock: patternLockValue.length > 0 ? patternLockValue.join(',') : undefined,
        issueDesc: data.details.issueDesc,
        accessories: data.details.accessories,
        preCheck: data.details.preCheck,
        estimateParts: data.pricing.estimateParts,
        estimateLabor: data.pricing.estimateLabor,
        deposit: data.pricing.deposit,
        dueAt: data.schedule.dueAt ? new Date(data.schedule.dueAt) : undefined,
        warrantyDays: data.schedule.warrantyDays,
        technician: data.schedule.technician
      });

      toast({
        title: "สร้างงานซ่อมสำเร็จ",
        description: `งานซ่อม #${job.id} ถูกสร้างเรียบร้อยแล้ว`,
      });

      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างงานซ่อมได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchEstimateParts = Number(form.watch('pricing.estimateParts')) || 0;
  const watchEstimateLabor = Number(form.watch('pricing.estimateLabor')) || 0;
  const watchDeposit = Number(form.watch('pricing.deposit')) || 0;
  const totalEstimate = watchEstimateParts + watchEstimateLabor;
  const remainingAmount = totalEstimate - watchDeposit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าแรก
            </Button>
            <div>
              <div className="text-lg md:text-xl font-bold thai-text">แจ้งซ่อมใหม่</div>
              <div className="text-white/90 thai-text text-sm md:text-base">สร้างงานซ่อมใหม่สำหรับลูกค้า</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" form="new-job-form" disabled={isSubmitting} className="rounded-xl bg-white text-primary hover:bg-white/90 border border-white/20 px-4 py-2">
              <Save className="w-4 h-4 mr-2" /> บันทึก
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form id="new-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ข้อมูลลูกค้า */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="thai-text">ข้อมูลลูกค้า</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customer.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">ชื่อลูกค้า *</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อ-นามสกุล" {...field} className="thai-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">เบอร์โทรศัพท์ *</FormLabel>
                        <FormControl>
                          <Input placeholder="081-234-5678" {...field} className="thai-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer.lineId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">Line ID</FormLabel>
                          <FormControl>
                            <Input placeholder="line_id" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customer.altPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">เบอร์โทรสำรอง</FormLabel>
                          <FormControl>
                            <Input placeholder="เบอร์โทรสำรอง" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ข้อมูลอุปกรณ์ */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="thai-text">ข้อมูลอุปกรณ์</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="device.brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">ยี่ห้อ *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกยี่ห้อ" />
                              </SelectTrigger>
                              <SelectContent>
                                {MOBILE_BRANDS.map((brand) => (
                                  <SelectItem key={brand} value={brand} className="thai-text">{brand}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="device.model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">รุ่น *</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น iPhone 12" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="device.color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">สี</FormLabel>
                          <FormControl>
                            <Input placeholder="สี" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="device.imei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">IMEI</FormLabel>
                          <FormControl>
                            <Input placeholder="IMEI" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="device.serial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">Serial</FormLabel>
                          <FormControl>
                            <Input placeholder="Serial" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* รหัสล็อค */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="thai-text flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  รหัสล็อค
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="thai-text">ประเภทรหัสล็อค:</Label>
                  <ToggleGroup type="single" value={lockType} onValueChange={(value: LockType) => setLockType(value)}>
                    <ToggleGroupItem value="none" className="thai-text">ไม่มีรหัส</ToggleGroupItem>
                    <ToggleGroupItem value="pin" className="thai-text">PIN</ToggleGroupItem>
                    <ToggleGroupItem value="pattern" className="thai-text">Pattern</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {lockType === 'pin' && (
                  <FormField
                    control={form.control}
                    name="lock.note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">รหัส PIN</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="กรอกรหัส PIN" 
                            {...field} 
                            className="thai-text max-w-xs" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {lockType === 'pattern' && (
                  <div className="space-y-4">
                    <Label className="thai-text">วาดรูปแบบรหัสล็อค:</Label>
                    <div ref={containerRef} className="flex justify-center">
                      <PatternLock
                        size={300}
                        onComplete={(path) => setPatternLockValue(path)}
                        showOrderText={true}
                        autoResetOnComplete={false}
                      />
                    </div>
                    {patternLockValue.length > 0 && (
                      <div className="text-sm text-muted-foreground thai-text">
                        รูปแบบที่เลือก: {patternLockValue.join(' → ')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* รายละเอียดอาการเสีย */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="thai-text">รายละเอียดอาการเสีย</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="details.issueDesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">อาการเสีย *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="อธิบายอาการเสียของอุปกรณ์" 
                            {...field} 
                            className="thai-text min-h-[100px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="details.accessories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">อุปกรณ์ที่รับมา</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น สายชาร์จ, หูฟัง, กล่อง" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="details.preCheck"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">การตรวจสอบเบื้องต้น</FormLabel>
                          <FormControl>
                            <Input placeholder="ผลการตรวจสอบเบื้องต้น" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* การประเมินราคา */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="thai-text">การประเมินราคา</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="pricing.estimateParts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">ราคาอะไหล่ (บาท)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.estimateLabor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">ค่าแรง (บาท)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.deposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="thai-text">มัดจำ (บาท)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="thai-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* สรุปราคา */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-sm text-blue-600 thai-text mb-3 font-semibold">สรุปราคา</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-700 thai-text">ยอดรวม:</div>
                        <div className="font-semibold text-lg">฿{totalEstimate.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-blue-700 thai-text">คงเหลือ:</div>
                        <div className="font-semibold text-lg text-green-600">฿{remainingAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="thai-text">ข้อมูลการจัดส่ง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="schedule.dueAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">กำหนดส่ง</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="thai-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schedule.warrantyDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">วันรับประกัน</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="30" {...field} className="thai-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schedule.technician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-text">ช่างซ่อม</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อช่างซ่อม" {...field} className="thai-text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ปุ่มบันทึก */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/jobs')}
                className="btn-outline"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'กำลังบันทึก...' : 'สร้างงานซ่อม'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


