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
import { LogOut } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">ตั้งค่า</h1>
        <p className="thai-text text-muted-foreground">ข้อมูลร้านและค่าตั้งต้นต่าง ๆ</p>
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
      <Card className="glass-card border-red-200">
        <CardHeader>
          <CardTitle className="thai-text text-red-600">จัดการบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="thai-text text-sm text-gray-600">ผู้ใช้ปัจจุบัน: <span className="font-semibold">{currentUser?.name || 'ไม่ระบุ'}</span></p>
              <p className="thai-text text-xs text-gray-500">ออกจากระบบเพื่อเปลี่ยนบัญชีผู้ใช้</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400">
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
                  <AlertDialogCancel className="thai-text bg-gray-100 hover:bg-gray-200 rounded-xl">
                    ยกเลิก
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="btn-gradient thai-text rounded-xl" 
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


