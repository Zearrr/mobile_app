import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportAll, importAll } from '@/lib/database';
import { useRepairStore } from '@/stores/useRepairStore';
import { Settings as SettingsIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

type FormData = {
  storeName: string;
  address: string;
  phone: string;
  profitPercentDefault: number;
  warrantyDefaultDays: number;
  promptPayId?: string;
};

export default function Settings() {
  const settings = useRepairStore(s => s.settings);
  const updateSettings = useRepairStore(s => s.updateSettings);
  const { register, handleSubmit, reset } = useForm<FormData>({
    values: {
      storeName: settings?.storeName || 'Mobile Repair Pro',
      address: settings?.address || '',
      phone: settings?.phone || '',
      profitPercentDefault: settings?.profitPercentDefault ?? 30,
      warrantyDefaultDays: settings?.warrantyDefaultDays ?? 30,
      promptPayId: settings?.promptPayId || ''
    }
  });

  const onSubmit = async (data: FormData) => {
    await updateSettings({
      storeName: data.storeName,
      address: data.address,
      phone: data.phone,
      profitPercentDefault: Number(data.profitPercentDefault),
      warrantyDefaultDays: Number(data.warrantyDefaultDays),
      promptPayId: data.promptPayId
    });
  };

  const handleExport = async () => {
    const dump = await exportAll();
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-repair-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    await importAll(data);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Gradient Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">ตั้งค่า</div>
              <div className="text-white/90 thai-text text-sm md:text-base">ข้อมูลร้านและค่าตั้งต้นต่าง ๆ</div>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">ข้อมูลร้าน</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="thai-text">ชื่อร้าน</Label>
              <Input {...register('storeName')} />
            </div>
            <div>
              <Label className="thai-text">เบอร์โทร</Label>
              <Input {...register('phone')} />
            </div>
            <div className="md:col-span-3">
              <Label className="thai-text">ที่อยู่</Label>
              <Input {...register('address')} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">ค่าตั้งต้น</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="thai-text">กำไรเริ่มต้น (%)</Label>
              <Input type="number" min={0} step="1" {...register('profitPercentDefault', { valueAsNumber: true })} />
            </div>
            <div>
              <Label className="thai-text">ประกันงาน (วัน)</Label>
              <Input type="number" min={0} step="1" {...register('warrantyDefaultDays', { valueAsNumber: true })} />
            </div>
            <div>
              <Label className="thai-text">PromptPay ID</Label>
              <Input {...register('promptPayId')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleExport}>นำออก (Export JSON)</Button>
            <label className="thai-text inline-flex items-center gap-2">
              <Input type="file" accept="application/json" onChange={(e) => handleImport(e.target.files?.[0] || null)} />
            </label>
          </div>
          <Button type="button" variant="outline" onClick={() => reset()}>ย้อนกลับค่าเดิม</Button>
          <Button type="submit" className="btn-gradient">บันทึกการตั้งค่า</Button>
        </div>
      </form>
      </div>
    </div>
  );
}


