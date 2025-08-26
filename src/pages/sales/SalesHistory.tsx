import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { BarChart3, Calendar, Eye, Printer, RefreshCw, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function SalesHistory() {
  const { sales, loadSales } = useRepairStore();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2025-08-14');
  const [endDate, setEndDate] = useState('2025-08-21');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [employee, setEmployee] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Filter sales based on search and date range
  const filteredSales = useMemo(() => {
    let filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Include end date

      return saleDate >= start && saleDate <= end;
    });

    // Filter by payment method
    if (paymentMethod !== 'all') {
      filtered = filtered.filter(sale => sale.method === paymentMethod);
    }

    // Filter by employee (assuming all sales are by 'admin' for demo)
    if (employee !== 'all') {
      filtered = filtered.filter(sale => sale.employee === employee);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(searchLower) ||
        sale.customer?.toLowerCase().includes(searchLower) ||
        sale.customerPhone?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [sales, search, startDate, endDate, paymentMethod, employee]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, paymentMethod, employee]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const averagePerBill = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const cashSales = filteredSales
      .filter(sale => sale.method === 'cash')
      .reduce((sum, sale) => sum + sale.total, 0);
    
    const transferSales = filteredSales
      .filter(sale => sale.method === 'transfer')
      .reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalSales,
      totalRevenue,
      averagePerBill,
      cashSales,
      transferSales
    };
  }, [filteredSales]);

  const handleRefresh = () => {
    loadSales();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Gradient Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">ประวัติการขาย</div>
              <div className="text-white/90 thai-text text-sm md:text-base">ดูและจัดการข้อมูลการขายทั้งหมด</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/pos/sale">
                <ShoppingCart className="w-4 h-4 mr-2" />
                POS
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link to="/reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                รายงาน
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground thai-text">ยอดขายทั้งหมด</div>
                  <div className="text-3xl font-bold text-blue-700 mt-1">{summary.totalSales}</div>
                  <div className="text-xs text-blue-700/70 thai-text">รายการ</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground thai-text">รายได้รวม</div>
                  <div className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(summary.totalRevenue)}</div>
                  <div className="text-xs text-emerald-700/70 thai-text">บาท</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground thai-text">ค่าเฉลี่ยต่อบิล</div>
                  <div className="text-3xl font-bold text-indigo-700 mt-1">{formatCurrency(summary.averagePerBill)}</div>
                  <div className="text-xs text-indigo-700/70 thai-text">บาท</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground thai-text">เงินสด</div>
                  <div className="text-3xl font-bold text-amber-700 mt-1">{formatCurrency(summary.cashSales)}</div>
                  <div className="text-xs text-amber-700/70 thai-text">
                    โอน: {formatCurrency(summary.transferSales)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">ค้นหาและกรอง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="thai-text text-sm font-medium mb-2 block">วันที่เริ่มต้น</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="thai-text text-sm font-medium mb-2 block">วันที่สิ้นสุด</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="thai-text text-sm font-medium mb-2 block">วิธีชำระเงิน</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="cash">เงินสด</SelectItem>
                    <SelectItem value="transfer">โอนเงิน</SelectItem>
                    <SelectItem value="card">บัตร</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="thai-text text-sm font-medium mb-2 block">พนักงานขาย</Label>
                <Select value={employee} onValueChange={setEmployee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ใบเสร็จ, ลูกค้า, เบอร์โทร"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                ค้นหา
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">
              รายการขาย ({filteredSales.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-12 thai-text text-muted-foreground">
                ไม่พบรายการขาย
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="thai-text">เลขที่ใบเสร็จ</TableHead>
                      <TableHead className="thai-text">วันที่/เวลา</TableHead>
                      <TableHead className="thai-text">ลูกค้า</TableHead>
                      <TableHead className="thai-text">รายการ</TableHead>
                      <TableHead className="thai-text">ยอดรวม</TableHead>
                      <TableHead className="thai-text">ชำระ</TableHead>
                      <TableHead className="thai-text">พนักงาน</TableHead>
                      <TableHead className="thai-text text-center">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .slice((page - 1) * perPage, (page - 1) * perPage + perPage)
                      .map((sale) => {
                      const totalItems = sale.items.reduce((sum, item) => sum + item.qty, 0);
                      const totalPieces = sale.items.reduce((sum, item) => sum + item.qty, 0);
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono font-semibold">
                            {sale.id}
                          </TableCell>
                          <TableCell className="thai-text">
                            {new Date(sale.date).toLocaleDateString('th-TH')} {new Date(sale.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="thai-text">
                            {sale.customer || 'ลูกค้าทั่วไป'}
                          </TableCell>
                          <TableCell className="thai-text">
                            {sale.items.length} รายการ, {totalPieces} ชิ้น
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            {formatCurrency(sale.total)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sale.method === 'cash' ? 'bg-green-100 text-green-800' :
                              sale.method === 'transfer' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {sale.method === 'cash' ? 'เงินสด' :
                               sale.method === 'transfer' ? 'โอนเงิน' :
                               sale.method === 'card' ? 'บัตร' : sale.method}
                            </span>
                          </TableCell>
                          <TableCell className="thai-text">
                            {sale.employee || 'admin'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/sales/${sale.id}`}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  ดู
                                </Link>
                              </Button>
                                                          <Button variant="outline" size="sm" asChild>
                              <Link to={`/print/sales/${sale.id}`}>
                                <Printer className="w-4 h-4 mr-1" />
                                พิมพ์
                              </Link>
                            </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination */}
            {filteredSales.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  className="rounded-xl h-9 px-3"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >ก่อนหน้า</Button>
                <div className="text-sm thai-text text-muted-foreground">
                  หน้า {page} / {Math.max(1, Math.ceil(filteredSales.length / perPage))}
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl h-9 px-3"
                  disabled={page >= Math.ceil(filteredSales.length / perPage)}
                  onClick={() => setPage(p => Math.min(Math.ceil(filteredSales.length / perPage), p + 1))}
                >ถัดไป</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
