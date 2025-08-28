import PatternLock from '@/components/PatternLock';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// removed parts dropdown imports
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// removed popover imports
import { PageHeader } from '@/components/layout/Topbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { LockType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Save } from 'lucide-react';
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
const useBrands = () => {
  const [brands, setBrands] = useState<string[]>(MOBILE_BRANDS);
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${base}/meta/brands`, { signal: abort.signal });
        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length) setBrands(json.data);
      } catch {}
    })();
    return () => abort.abort();
  }, []);
  return brands;
}

// Fallback parts when API is unreachable – ensures dropdown always appears
const COMMON_PARTS = [
  { id: 'p_screen', sku: 'SCREEN', name: 'จอ', movingAvgCost: 1500 },
  { id: 'p_battery', sku: 'BAT', name: 'แบตเตอรี่', movingAvgCost: 800 },
  { id: 'p_back', sku: 'BACK', name: 'ฝาหลัง', movingAvgCost: 600 },
  { id: 'p_charge', sku: 'CHG', name: 'แผงชาร์จ', movingAvgCost: 700 }
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
    accessories: z.string().default(''),
    preCheck: z.string().default('')
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
  const brands = useBrands();
  const [parts, setParts] = useState<any[]>([]);
  const [openMultiParts, setOpenMultiParts] = useState(false);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patternLockValue, setPatternLockValue] = useState<number[]>([]);
  const [lockType, setLockType] = useState<LockType>('none');
  const containerRef = useRef<HTMLDivElement>(null);
  // removed parts-related state

  const deviceBrand = useRef<string>('');
  const deviceModel = useRef<string>('');

  const form = useForm<any>({
    resolver: zodResolver(newJobSchema) as any,
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

  // removed parts fetching; pricing remains manual

  // Track brand/model for filtering parts list
  useEffect(() => {
    const sub = form.watch((values: any) => {
      deviceBrand.current = values?.device?.brand || '';
      deviceModel.current = values?.device?.model || '';
    });
    return () => (sub as any)?.unsubscribe?.();
  }, [form]);

  // removed parts multi-select and filters

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

  // Load parts from real API (with local fallback so dropdown always shows)
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${base}/parts`, { signal: abort.signal });
        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length) setParts(json.data);
        else setParts(COMMON_PARTS);
      } catch {
        setParts(COMMON_PARTS);
      }
    })();
    return () => abort.abort();
  }, []);

  // Auto-sum selected parts to estimateParts
  useEffect(() => {
    const sum = selectedPartIds.reduce((s, id) => {
      const p = parts.find((x: any) => String(x.id) === id);
      const price = Number(p?.movingAvgCost ?? p?.price ?? 0);
      return s + price;
    }, 0);
    form.setValue('pricing.estimateParts', sum);
  }, [selectedPartIds, parts]);

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
      const total = Number(data.pricing.estimateParts || 0) + Number(data.pricing.estimateLabor || 0);
      const job = await createJob({
        customerId: customer.id,
        brand: data.device.brand,
        model: data.device.model,
        color: data.device.color,
        imei: data.device.imei,
        serial: data.device.serial,
        lockType: data.lock.type,
        lockNote: data.lock.note,
        photos: [],
        issueDesc: data.details.issueDesc,
        accessories: data.details.accessories,
        preCheck: data.details.preCheck,
        feeParts: Number(data.pricing.estimateParts) || 0,
        feeLabor: Number(data.pricing.estimateLabor) || 0,
        costParts: 0,
        costLabor: 0,
        deposit: Number(data.pricing.deposit) || 0,
        total,
        profit: total,
        status: 'received',
        paymentStatus: 'unpaid',
        technician: data.schedule.technician || undefined,
        receivedAt: new Date(),
        dueAt: data.schedule.dueAt ? new Date(data.schedule.dueAt) : undefined,
        warrantyDays: Number(data.schedule.warrantyDays) || 30,
        pdpaConsentAt: undefined,
        customerSign: undefined,
        staffSign: undefined
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
  const watchDeposit = Number(form.watch('pricing.deposit')) || 0;
  const totalEstimate = watchEstimateParts;
  const remainingAmount = totalEstimate - watchDeposit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader 
          title="แจ้งซ่อมใหม่" 
          description="สร้างงานซ่อมใหม่สำหรับลูกค้า" 
          showActions={false} 
        />

        <Form {...form}>
          <form id="new-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="glass-card">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ข้อมูลลูกค้า */}
                  <div className="space-y-4">
                    <div className="thai-text text-base md:text-lg font-semibold text-foreground mt-2 md:mt-3">ข้อมูลลูกค้า</div>
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
                  </div>

                  {/* ข้อมูลอุปกรณ์ */}
                  <div className="space-y-4">
                    <div className="thai-text text-base md:text-lg font-semibold text-foreground mt-2 md:mt-3">ข้อมูลอุปกรณ์</div>
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
                                    {brands.map((brand) => (
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

                      {/* removed parts multi-select */}
                      </div>
                 </div>

                <div className="border-t border-border/50 my-4" />

                {/* รหัสล็อค */}
                <div className="space-y-4">
                  <div className="thai-text text-base md:text-lg font-semibold text-foreground flex items-center gap-2 mt-2 md:mt-3"><KeyRound className="w-5 h-5" /> รหัสล็อค</div>
                  <div className="flex items-center gap-4">
                    <Label className="thai-text">ประเภทรหัสล็อค:</Label>
                    <ToggleGroup type="single" value={lockType} onValueChange={(value: LockType) => setLockType(value)}>
                      <ToggleGroupItem type="button" value="none" className="thai-text">ไม่มีรหัส</ToggleGroupItem>
                      <ToggleGroupItem type="button" value="pin" className="thai-text">PIN</ToggleGroupItem>
                      <ToggleGroupItem type="button" value="pattern" className="thai-text">Pattern</ToggleGroupItem>
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
                </div>

                <div className="border-t border-border/50 my-4" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* รายละเอียดอาการเสีย */}
                  <div className="space-y-4">
                    <div className="thai-text text-base md:text-lg font-semibold text-foreground mt-2 md:mt-3">รายละเอียดอาการเสีย</div>
                    <div className="space-y-4">
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
                      </div>
                  </div>

                  {/* การประเมินราคา */}
                  <div className="space-y-4">
                    <div className="thai-text text-base md:text-lg font-semibold text-foreground mt-2 md:mt-3">การประเมินราคา</div>
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

                        {/* ลบช่องค่าแรงออกตามคำขอ */}

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
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="thai-text text-sm text-blue-700">ยอดรวม</div>
                            <div className="text-xl font-extrabold">฿{totalEstimate.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="thai-text text-sm text-blue-700">มัดจำ</div>
                            <div className="text-xl font-extrabold">฿{watchDeposit.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="thai-text text-sm text-blue-700">คงเหลือ</div>
                            <div className="text-xl font-extrabold text-green-600">฿{remainingAmount.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* ข้อมูลการจัดส่ง */}
                <div className="space-y-4">
                  <div className="thai-text text-base md:text-lg font-semibold text-foreground mt-2 md:mt-3">ข้อมูลการจัดส่ง</div>
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
                </div>

                {/* ปุ่มบันทึก */}
                <div className="flex flex-col md:flex-row md:justify-end gap-3 md:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/jobs')}
                    className="btn-outline w-full md:w-auto"
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'กำลังบันทึก...' : 'สร้างงานซ่อม'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}


