import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Calendar, DollarSign, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const pricingSchema = z.object({
  estimateParts: z.coerce.number().min(0, 'ราคาอะไหล่ต้องไม่ต่ำกว่า 0').default(0),
  estimateLabor: z.coerce.number().min(0, 'ค่าแรงต้องไม่ต่ำกว่า 0').default(0),
  deposit: z.coerce.number().min(0, 'มัดจำต้องไม่ต่ำกว่า 0').default(0),
  dueAt: z.string().optional(),
  warrantyDays: z.coerce.number().min(0, 'วันรับประกันต้องไม่ต่ำกว่า 0').default(30),
  technician: z.string().optional(),
  issueDesc: z.string().min(1, 'กรุณากรอกรายละเอียดอาการเสีย'),
  accessories: z.string().optional().default(''),
  preCheck: z.string().optional().default(''),
  note: z.string().optional()
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface PricingFormProps {
  defaultValues?: Partial<PricingFormData>;
  onSubmit: (data: PricingFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const PricingForm = ({ defaultValues, onSubmit, onCancel, isSubmitting = false }: PricingFormProps) => {
  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      estimateParts: 0,
      estimateLabor: 0,
      deposit: 0,
      dueAt: '',
      warrantyDays: 30,
      technician: '',
      issueDesc: '',
      accessories: '',
      preCheck: '',
      note: '',
      ...defaultValues
    }
  });

  const watchEstimateParts = form.watch('estimateParts') || 0;
  const watchEstimateLabor = form.watch('estimateLabor') || 0;
  const watchDeposit = form.watch('deposit') || 0;

  const totalEstimate = watchEstimateParts + watchEstimateLabor;
  const remainingAmount = totalEstimate - watchDeposit;

  const handleSubmit = (data: PricingFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="thai-text flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ประเมินราคาและรายละเอียดงาน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* ข้อมูลอาการเสีย */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold thai-text flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                รายละเอียดอาการเสีย
              </h3>
              
              <FormField
                control={form.control}
                name="issueDesc"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accessories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">อุปกรณ์ที่รับมา</FormLabel>
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

                <FormField
                  control={form.control}
                  name="preCheck"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">การตรวจสอบเบื้องต้น</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ผลการตรวจสอบเบื้องต้น" 
                          {...field} 
                          className="thai-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* การประเมินราคา */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold thai-text flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                การประเมินราคา
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estimateParts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">ราคาอะไหล่ (บาท)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0" 
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
                  name="estimateLabor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">ค่าแรง (บาท)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0" 
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
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">มัดจำ (บาท)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0" 
                          {...field} 
                          className="thai-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* สรุปราคา */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-sm text-blue-600 thai-text mb-3 font-semibold">สรุปราคา</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700 thai-text">ราคาอะไหล่:</div>
                    <div className="font-semibold">฿{watchEstimateParts.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-blue-700 thai-text">ค่าแรง:</div>
                    <div className="font-semibold">฿{watchEstimateLabor.toLocaleString()}</div>
                  </div>
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
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold thai-text flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                ข้อมูลการจัดส่ง
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dueAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">กำหนดส่ง</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
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
                  name="warrantyDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">วันรับประกัน</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="30" 
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
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-text">ช่างซ่อม</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ชื่อช่างซ่อม" 
                          {...field} 
                          className="thai-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* หมายเหตุ */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="thai-text">หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับงานซ่อม" 
                      {...field} 
                      className="thai-text"
                      rows={3}
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
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการประเมินราคา'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PricingForm;
