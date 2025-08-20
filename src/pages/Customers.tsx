import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { Calendar, MessageCircle, Phone, Search, Users } from 'lucide-react';
import { useState } from 'react';

export default function Customers() {
  const { customers } = useRepairStore();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ลูกค้า</h1>
          <p className="thai-text text-muted-foreground">ลูกค้าทั้งหมด {customers.length} ราย</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-tile stat-primary">
          <div className="stat-title"><Users className="w-4 h-4" /> ลูกค้าทั้งหมด</div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-description">ราย</div>
        </div>

        <div className="stat-tile stat-info">
          <div className="stat-title"><Phone className="w-4 h-4" /> มีเบอร์โทร</div>
          <div className="stat-value">{customers.filter(c => c.phone).length}</div>
          <div className="stat-description">ราย</div>
        </div>

        <div className="stat-tile stat-success">
          <div className="stat-title"><MessageCircle className="w-4 h-4" /> มี Line ID</div>
          <div className="stat-value">{customers.filter(c => c.lineId).length}</div>
          <div className="stat-description">ราย</div>
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
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="thai-text flex-1"
          />
          <Button 
            variant="outline" 
            onClick={() => setSearch('')}
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
  );
}


