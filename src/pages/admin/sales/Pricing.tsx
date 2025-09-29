import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';

interface OutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPageInfo: {
    title: string;
    description: string;
  };
}

type FormData = {
  parts: number;
  labor: number;
  profitPercent: number;
};

export default function Pricing() {
  const { sidebarOpen, setSidebarOpen, currentPageInfo } = useOutletContext<OutletContext>();
  const { register, watch, reset, setValue } = useForm<FormData>({
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,theme(colors.secondary/25),transparent_40%),radial-gradient(ellipse_at_bottom_right,theme(colors.primary/10),transparent_35%)] animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <PageHeader title={currentPageInfo.title} description={currentPageInfo.description} />
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text text-xl">กรอกข้อมูลต้นทุน</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="thai-text text-sm font-medium mb-2 block">ต้นทุนสินค้า</Label>
              <Input type="number" min={0} step="1" {...register('parts', { valueAsNumber: true })} className="h-12 text-lg" />
            </div>
            <div>
              <Label className="thai-text text-sm font-medium mb-2 block">ค่าแรง</Label>
              <Input type="number" min={0} step="1" {...register('labor', { valueAsNumber: true })} className="h-12 text-lg" />
            </div>
            <div>
              <Label className="thai-text text-sm font-medium mb-2 block">กำไรที่ต้องการ (%)</Label>
              <div className="space-y-3">
                <Input
                  type="number"
                  min={0}
                  step="1"
                  {...register('profitPercent', { valueAsNumber: true })}
                  className="h-12 text-lg"
                />
                {/* เหลือเฉพาะช่องกรอกตัวเลขตามที่ร้องขอ */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text text-xl">สรุปผล</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 thai-text">
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <div className="text-muted-foreground text-sm mb-2">ต้นทุนรวม</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(summary.cost)}</div>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-success/5 to-success/10 shadow-sm">
              <div className="text-muted-foreground text-sm mb-2">กำไร (ที่ {Number(values.profitPercent || 0)}%)</div>
              <div className="text-2xl font-bold text-success">{formatCurrency(summary.profit)}</div>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-info/5 to-info/10 shadow-sm">
              <div className="text-muted-foreground text-sm mb-2">ราคารวมที่เสนอ</div>
              <div className="text-3xl font-extrabold text-info">{formatCurrency(summary.total)}</div>
            </div>
            <div className="md:col-span-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="text-muted-foreground text-sm">แนะนำ: ตั้งกำไรระหว่าง 20% - 40% สำหรับงานทั่วไป</div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => reset()} className="btn-outline">ล้างค่า</Button>
                <Button className="btn-gradient">บันทึกใบเสนอราคา</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


