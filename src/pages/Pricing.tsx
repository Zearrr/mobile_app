import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  parts: number;
  labor: number;
  profitPercent: number;
};

export default function Pricing() {
  const { register, watch, reset } = useForm<FormData>({
    defaultValues: { parts: 0, labor: 0, profitPercent: 25 }
  });

  const values = watch();
  const summary = useMemo(() => {
    const cost = Number(values.parts || 0) + Number(values.labor || 0);
    const profit = Math.round(cost * (Number(values.profitPercent || 0) / 100));
    const total = cost + profit;
    return { cost, profit, total };
  }, [values]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">ตั้งราคา</h1>
        <p className="thai-text text-muted-foreground">คำนวณราคาค่าซ่อมอย่างรวดเร็วเพื่อใช้ประกอบใบงาน</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">กรอกข้อมูลต้นทุน</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="thai-text">ต้นทุนอะไหล่</Label>
            <Input type="number" min={0} step="1" {...register('parts', { valueAsNumber: true })} />
          </div>
          <div>
            <Label className="thai-text">ค่าแรง</Label>
            <Input type="number" min={0} step="1" {...register('labor', { valueAsNumber: true })} />
          </div>
          <div>
            <Label className="thai-text">กำไรที่ต้องการ (%)</Label>
            <Input type="number" min={0} step="1" {...register('profitPercent', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">สรุปผล</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 thai-text">
          <div className="p-4 rounded-lg border">
            <div className="text-muted-foreground">ต้นทุนรวม</div>
            <div className="text-xl font-semibold">{formatCurrency(summary.cost)}</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-muted-foreground">กำไร</div>
            <div className="text-xl font-semibold">{formatCurrency(summary.profit)}</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-muted-foreground">ราคารวมที่เสนอ</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button variant="outline" onClick={() => reset()}>ล้างค่า</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


