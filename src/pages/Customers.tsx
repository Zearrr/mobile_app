import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { Calendar, Clock, MessageCircle, Phone, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

interface OutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPageInfo: {
    title: string;
    description: string;
  };
}

const Customers = () => {
  const { sidebarOpen, setSidebarOpen, currentPageInfo } = useOutletContext<OutletContext>();
  const { customers } = useRepairStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'phone' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate stats
  const newCustomersThisMonth = customers.filter(customer => {
    const customerDate = new Date(customer.createdAt);
    const now = new Date();
    return customerDate.getMonth() === now.getMonth() && customerDate.getFullYear() === now.getFullYear();
  }).length;

  const recentCustomers = customers.filter(customer => {
    const customerDate = new Date(customer.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - customerDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-12 text-center">
      </div>

      {/* Customer Stats */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">ลูกค้าทั้งหมด</p>
                  <p className="text-3xl font-bold">{customers.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success to-success/80 text-white shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">ลูกค้าใหม่เดือนนี้</p>
                  <p className="text-3xl font-bold">{newCustomersThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info to-info/80 text-white shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">ลูกค้าที่ใช้งานล่าสุด</p>
                  <p className="text-3xl font-bold">{recentCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 thai-text">
            <Search className="h-5 w-5 text-primary" />
            ค้นหาลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input 
            placeholder="ค้นหาจากชื่อ/เบอร์โทร" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="thai-text flex-1"
          />
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
            className="btn-outline"
          >
            ล้าง
          </Button>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">รายชื่อลูกค้า ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10 thai-text text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ไม่พบลูกค้า</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="thai-text">ชื่อ</TableHead>
                    <TableHead className="thai-text">เบอร์โทร</TableHead>
                    <TableHead className="thai-text">Line ID</TableHead>
                    <TableHead className="thai-text">วันที่สร้าง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} className="hover:bg-accent/50">
                      <TableCell className="thai-text font-medium">{c.name}</TableCell>
                      <TableCell className="thai-text">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {c.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="thai-text">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          {c.lineId || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="thai-text">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(c.createdAt).toLocaleDateString('th-TH')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default Customers;


