import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const { users, loadUsers, createUser, updateUser, deleteUser } = useRepairStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'owner'|'cashier'|'tech'|'staff'>('staff');
  const [active, setActive] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const add = async () => {
    if (!name) return;
    await createUser({ name, role, active } as any);
    setName(''); setRole('staff'); setActive(true);
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
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="thai-text">ชื่อ</Label>
            <Input value={name} onChange={(e)=> setName(e.target.value)} />
          </div>
          <div>
            <Label className="thai-text">สิทธิ์</Label>
            <select className="w-full h-10 rounded-md border px-3" value={role} onChange={(e)=> setRole(e.target.value as any)}>
              <option value="owner">owner</option>
              <option value="cashier">cashier</option>
              <option value="tech">tech</option>
              <option value="staff">staff</option>
            </select>
          </div>
          <div>
            <Label className="thai-text">สถานะ</Label>
            <select className="w-full h-10 rounded-md border px-3" value={String(active)} onChange={(e)=> setActive(e.target.value==='true')}>
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
            <Button className="btn-gradient" onClick={add}>บันทึก</Button>
          </div>
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
                    <TableCell className="thai-text">{u.role}</TableCell>
                    <TableCell className="thai-text">{u.active ? 'active' : 'inactive'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={()=> updateUser(u.id, { active: !u.active })}>{u.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}</Button>
                      <Button variant="outline" size="sm" className="ml-2" onClick={()=> deleteUser(u.id)}>ลบ</Button>
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


