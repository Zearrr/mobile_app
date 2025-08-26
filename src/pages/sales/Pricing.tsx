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
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-2 h-12 bg-gradient-to-b from-primary via-primary-dark to-primary rounded-full"></div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
            {currentPageInfo.title}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed thai-text">
          {currentPageInfo.description}
        </p>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Card className="bg-white/80 backdrop-blur-sm border border-border/50 shadow-xl">
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
              <Input type="number" min={0} step="1" {...register('profitPercent', { valueAsNumber: true })} className="h-12 text-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="thai-text text-xl">สรุปผล</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 thai-text">
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-muted-foreground text-sm mb-2">ต้นทุนรวม</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(summary.cost)}</div>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-success/5 to-success/10">
              <div className="text-muted-foreground text-sm mb-2">กำไร</div>
              <div className="text-2xl font-bold text-success">{formatCurrency(summary.profit)}</div>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-gradient-to-br from-info/5 to-info/10">
              <div className="text-muted-foreground text-sm mb-2">ราคารวมที่เสนอ</div>
              <div className="text-3xl font-bold text-info">{formatCurrency(summary.total)}</div>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button variant="outline" onClick={() => reset()} className="px-8 py-3 rounded-xl">ล้างค่า</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


