import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportAll, importAll } from '@/lib/database';
import { useRepairStore } from '@/stores/useRepairStore';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
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
  const logout = useRepairStore(state => state.logout);
  const currentUser = useRepairStore(state => state.currentUser);
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

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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

      {/* Account Management Section */}
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle className="thai-text text-red-600">จัดการบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-xl border border-red-200/60 dark:border-red-900/30 bg-gradient-to-r from-rose-500/5 via-red-500/5 to-orange-500/5 p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <div className="thai-text text-sm text-gray-600 dark:text-gray-300">ผู้ใช้ปัจจุบัน</div>
                  <div className="text-lg font-semibold">{currentUser?.name || 'ไม่ระบุ'}</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 px-2.5 py-0.5 text-xs thai-text">
                      {currentUser?.role === 'owner' ? 'เจ้าของร้าน' : currentUser?.role === 'cashier' ? 'แคชเชียร์' : currentUser?.role === 'tech' ? 'ช่างซ่อม' : 'พนักงาน'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm text-muted-foreground thai-text">ออกจากระบบเพื่อเปลี่ยนบัญชีผู้ใช้</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl">
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white rounded-2xl shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="thai-text text-xl">ออกจากระบบ?</AlertDialogTitle>
                      <AlertDialogDescription className="thai-text text-gray-600">
                        คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ ข้อมูลที่ยังไม่ได้บันทึกอาจหายไป
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="thai-text bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 thai-text rounded-xl" onClick={handleLogout}>
                        ออกจากระบบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


