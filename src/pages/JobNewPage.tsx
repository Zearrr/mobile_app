import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Printer, User, Smartphone, Lock, FileText, Calculator, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { NewJobFormData } from '@/types';

const jobSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
    phone: z.string().min(10, 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง'),
    lineId: z.string().optional(),
  }),
  device: z.object({
    brand: z.string().min(1, 'กรุณากรอกยี่ห้อ'),
    model: z.string().min(1, 'กรุณากรอกรุ่น'),
    color: z.string().optional(),
    imei: z.string().optional(),
    serial: z.string().optional(),
  }),
  lock: z.object({
    type: z.enum(['none', 'pin', 'pattern']),
    note: z.string().optional(),
  }),
  details: z.object({
    issueDesc: z.string().min(1, 'กรุณาอธิบายอาการเสีย'),
    accessories: z.string().optional(),
    preCheck: z.string().optional(),
  }),
  pricing: z.object({
    estimateParts: z.number().min(0, 'ค่าอะไหล่ต้องเป็นจำนวนบวก'),
    estimateLabor: z.number().min(0, 'ค่าแรงต้องเป็นจำนวนบวก'),
    deposit: z.number().min(0, 'มัดจำต้องเป็นจำนวนบวก'),
  }),
  schedule: z.object({
    dueAt: z.date().optional(),
    warrantyDays: z.number().min(0, 'รับประกันต้องเป็นจำนวนบวก'),
    technician: z.string().optional(),
  }),
  pdpaConsent: z.boolean().refine(val => val === true, 'กรุณายินยอมเงื่อนไข PDPA'),
});

export function JobNewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJob, createCustomer, settings } = useRepairStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewJobFormData & { pdpaConsent: boolean }>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customer: { name: '', phone: '', lineId: '' },
      device: { brand: '', model: '', color: '', imei: '', serial: '' },
      lock: { type: 'none', note: '' },
      details: { issueDesc: '', accessories: '', preCheck: '' },
      pricing: { estimateParts: 0, estimateLabor: 0, deposit: 0 },
      schedule: { 
        warrantyDays: settings?.warrantyDefaultDays || 30,
        technician: ''
      },
      pdpaConsent: false,
    },
  });

  const onSubmit = async (data: NewJobFormData & { pdpaConsent: boolean }) => {
    setIsSubmitting(true);
    try {
      // Create customer first
      const customer = await createCustomer({
        name: data.customer.name,
        phone: data.customer.phone,
        lineId: data.customer.lineId,
      });

      // Calculate totals
      const total = data.pricing.estimateParts + data.pricing.estimateLabor;
      const profit = total - (data.pricing.estimateParts * 0.7 + data.pricing.estimateLabor * 0.3); // Rough cost estimate

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
        photos: [],
        issueDesc: data.details.issueDesc,
        accessories: data.details.accessories || '',
        preCheck: data.details.preCheck || '',
        estimateParts: data.pricing.estimateParts,
        estimateLabor: data.pricing.estimateLabor,
        costParts: data.pricing.estimateParts * 0.7,
        costLabor: data.pricing.estimateLabor * 0.3,
        deposit: data.pricing.deposit,
        total,
        profit,
        status: 'received',
        paymentStatus: data.pricing.deposit > 0 ? 'deposit' : 'unpaid',
        technician: data.schedule.technician,
        receivedAt: new Date(),
        dueAt: data.schedule.dueAt,
        warrantyDays: data.schedule.warrantyDays,
        pdpaConsentAt: data.pdpaConsent ? new Date() : undefined,
      });

      toast({
        title: 'สร้างงานสำเร็จ',
        description: `เลขที่งาน ${job.id} ถูกสร้างเรียบร้อยแล้ว`,
      });

      // Ask if user wants to print
      if (confirm('ต้องการพิมพ์ใบแจ้งซ่อมหรือไม่?')) {
        window.open(`/print/jobs/${job.id}`, '_blank');
      }

      navigate('/jobs');
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างงานได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">แจ้งซ่อมใหม่</h1>
          <p className="text-muted-foreground mt-1">สร้างใบแจ้งซ่อมสำหรับลูกค้า</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลลูกค้า
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer.name"
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
                name="customer.phone"
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
                name="customer.lineId"
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
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                ข้อมูลอุปกรณ์
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="device.brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยี่ห้อ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple, Samsung, Huawei..." {...field} />
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
                    <FormLabel>รุ่น *</FormLabel>
                    <FormControl>
                      <Input placeholder="iPhone 13, Galaxy S21..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="device.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สี</FormLabel>
                    <FormControl>
                      <Input placeholder="สีของเครื่อง" {...field} />
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
                    <FormLabel>IMEI</FormLabel>
                    <FormControl>
                      <Input placeholder="หมายเลข IMEI" {...field} />
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
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="หมายเลขเครื่อง" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Lock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                รหัสล็อกหน้าจอ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="lock.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทรหัส</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทรหัส" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">ไม่มีรหัส</SelectItem>
                        <SelectItem value="pin">PIN (ตัวเลข)</SelectItem>
                        <SelectItem value="pattern">Pattern (รูปแบบ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('lock.type') !== 'none' && (
                <FormField
                  control={form.control}
                  name="lock.note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รหัส/หมายเหตุ</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            form.watch('lock.type') === 'pin' 
                              ? "กรอกรหัส PIN" 
                              : "อธิบายรูปแบบ Pattern"
                          } 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                รายละเอียดงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="details.issueDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อาการเสีย/ปัญหา *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="อธิบายอาการเสียของเครื่อง..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="details.accessories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อุปกรณ์ที่ฝากมาด้วย</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น ที่ชาร์จ, หูฟัง, เคส..." {...field} />
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
                    <FormLabel>การตรวจเช็คเบื้องต้น</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ผลการตรวจสอบเบื้องต้น..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                ราคาและค่าใช้จ่าย
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pricing.estimateParts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าอะไหล่ (บาท)</FormLabel>
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
                name="pricing.estimateLabor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าแรง (บาท)</FormLabel>
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
                name="pricing.deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>มัดจำ (บาท)</FormLabel>
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
              
              <div className="md:col-span-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>รวมทั้งสิ้น:</span>
                  <span className="text-primary">
                    ฿{((form.watch('pricing.estimateParts') || 0) + (form.watch('pricing.estimateLabor') || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                การนัดหมายและการตั้งค่า
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schedule.dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันนัดรับ</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
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
                    <FormLabel>รับประกัน (วัน)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30"
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
                name="schedule.technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ช่างผู้รับผิดชอบ</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อช่าง" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* PDPA Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                การให้ความยินยอม PDPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="pdpaConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        ยินยอมให้เก็บข้อมูลส่วนบุคคล
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        ลูกค้ายินยอมให้ร้านเก็บข้อมูลส่วนบุคคลเพื่อใช้ในการให้บริการซ่อมแซม
                        และติดต่อสื่อสารเกี่ยวกับงานซ่อม
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormMessage />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/jobs')}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>กำลังบันทึก...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  บันทึกงาน
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}