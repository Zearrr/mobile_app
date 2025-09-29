import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const { users, loadUsers, createUser, updateUser, deleteUser } = useRepairStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<'owner'|'cashier'|'tech'|'staff'>('staff');
  const [active, setActive] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const add = async () => {
    if (!name || !username || !password || password !== confirmPassword) return;
    await createUser({ name, username, password, role, active } as any);
    setName(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPassword(''); setRole('staff'); setActive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="ผู้ใช้" 
          description="จัดการผู้ใช้และสิทธิ์" 
          showActions={false} 
        />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> เพิ่มผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="thai-text">บทบาท</Label>
              <select className="w-full h-11 rounded-xl border px-3 bg-background" value={role} onChange={(e)=> setRole(e.target.value as any)}>
                <option value="">แอดมิน</option>
                <option value="">พนักงาน</option>
              </select>
            </div>
            <div>
              <Label className="thai-text">ชื่อ-นามสกุล</Label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9 h-11 rounded-xl" placeholder="เช่น สมชาย ใจดี" value={name} onChange={(e)=> setName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="thai-text">ชื่อผู้ใช้</Label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9 h-11 rounded-xl" placeholder="staff01" value={username} onChange={(e)=> setUsername(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="thai-text">อีเมล</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9 h-11 rounded-xl" placeholder="อีเมล" value={email} onChange={(e)=> setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="thai-text">รหัสผ่าน</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9 pr-10 h-11 rounded-xl" type={showPw ? 'text' : 'password'} placeholder="อย่างน้อย 6 ตัวอักษร" value={password} onChange={(e)=> setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={()=> setShowPw(v=>!v)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="thai-text">ยืนยันรหัสผ่าน</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9 h-11 rounded-xl" type={showPw ? 'text' : 'password'} placeholder="พิมพ์รหัสผ่านอีกครั้ง" value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <div className="text-xs text-rose-600 mt-1">รหัสผ่านไม่ตรงกัน</div>
              )}
            </div>
            <div>
              <Label className="thai-text">สถานะ</Label>
              <select className="w-full h-11 rounded-xl border px-3 bg-background" value={String(active)} onChange={(e)=> setActive(e.target.value==='true')}>
                <option value="true">ใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={()=>{ setName(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPassword(''); setRole('staff'); setActive(true); }}
              className="rounded-xl"
            >ล้าง</Button>
            <Button
              className={`rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 ${(!name||!username||!password||password!==confirmPassword)?'opacity-60 cursor-not-allowed':''}`}
              disabled={!name || !username || !password || password !== confirmPassword}
              onClick={add}
            >ลงทะเบียน</Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">บันทึกสำเร็จแล้วสามารถใช้ชื่อผู้ใช้และรหัสผ่านนี้เข้าสู่ระบบได้ทันที</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายชื่อผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">ชื่อ</TableHead>
                  <TableHead className="thai-text">สิทธิ์</TableHead>
                  <TableHead className="thai-text">สถานะ</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="thai-text">{u.name}</TableCell>
                    <TableCell className="thai-text">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">{u.role}</span>
                    </TableCell>
                    <TableCell className="thai-text">
                      {u.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 border border-rose-200">inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={()=> updateUser(u.id, { active: !u.active })} className="rounded-xl">
                        {u.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2 rounded-xl text-rose-600 hover:bg-rose-50" onClick={()=> deleteUser(u.id)}>ลบ</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}



