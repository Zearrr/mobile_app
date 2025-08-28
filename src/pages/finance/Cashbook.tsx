import { PageHeader } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { PaymentMethod } from '@/types';
import { endOfDay, format, isWithinInterval, startOfDay } from 'date-fns';
import {
    Calendar,
    Clock,
    DollarSign,
    Download,
    Filter,
    Plus,
    RotateCcw,
    Search,
    TrendingDown,
    TrendingUp,
    Wallet,
    X
} from 'lucide-react';
import { useMemo, useState } from 'react';

type EntryType = 'income' | 'expense';

function toCSV(rows: Array<Record<string, any>>): string {
  const headers = Object.keys(rows[0] || {});
  const esc = (v: any) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => esc(r[h])).join(',')));
  return lines.join('\n');
}

export default function Cashbook() {
  const { toast } = useToast();
  const {
    payments,
    sales,
    expenses,
    createSale,
    createExpense,
    deleteSale,
    deleteExpense
  } = useRepairStore();

  const [dateStr, setDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<EntryType>('income');
  const [category, setCategory] = useState<string>('ทั่วไป');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterDateTo, setFilterDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // UI states
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const selectedDay = useMemo(() => new Date(dateStr), [dateStr]);
  const range = useMemo(() => ({ start: startOfDay(selectedDay), end: endOfDay(selectedDay) }), [selectedDay]);

  // Filter range for display
  const filterRange = useMemo(() => {
    const from = filterDateFrom ? startOfDay(new Date(filterDateFrom)) : startOfDay(new Date());
    const to = filterDateTo ? endOfDay(new Date(filterDateTo)) : endOfDay(new Date());
    return { start: from, end: to };
  }, [filterDateFrom, filterDateTo]);

  const dayPayments = useMemo(() => payments.filter(p => isWithinInterval(new Date(p.paidAt), range)), [payments, range]);
  const daySales = useMemo(() => sales.filter(s => isWithinInterval(new Date(s.date), range)), [sales, range]);
  const dayExpenses = useMemo(() => expenses.filter(e => isWithinInterval(new Date(e.date), range)), [expenses, range]);

  // Filtered data for display
  const filteredPayments = useMemo(() => payments.filter(p => isWithinInterval(new Date(p.paidAt), filterRange)), [payments, filterRange]);
  const filteredSales = useMemo(() => sales.filter(s => isWithinInterval(new Date(s.date), filterRange)), [sales, filterRange]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isWithinInterval(new Date(e.date), filterRange)), [expenses, filterRange]);

  const summary = useMemo(() => {
    const incomeFromPayments = dayPayments.reduce((s, p) => s + p.amount, 0);
    const incomeFromSales = daySales.reduce((s, sa) => s + sa.total, 0);
    const incomeFromExpensePositive = dayExpenses
      .filter(e => (e.category || '').startsWith('income:'))
      .reduce((s, e) => s + e.amount, 0);
    const expenseOut = dayExpenses
      .filter(e => !(e.category || '').startsWith('income:'))
      .reduce((s, e) => s + e.amount, 0);

    const totalIncome = incomeFromPayments + incomeFromSales + incomeFromExpensePositive;
    const totalExpense = expenseOut;
    const net = totalIncome - totalExpense;

    const byMethod: Record<PaymentMethod, number> = { cash: 0, transfer: 0, promptpay: 0, card: 0 };
    dayPayments.forEach(p => { byMethod[p.method] += p.amount; });
    daySales.forEach(s => {
      if (s.payments?.length) s.payments.forEach(pm => { byMethod[pm.method] += pm.amount; });
      else byMethod[s.method] += s.total;
    });
    byMethod.cash += incomeFromExpensePositive;

    return { totalIncome, totalExpense, net, byMethod };
  }, [dayPayments, daySales, dayExpenses]);

  // Filtered summary
  const filteredSummary = useMemo(() => {
    const incomeFromPayments = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const incomeFromSales = filteredSales.reduce((s, sa) => s + sa.total, 0);
    const incomeFromExpensePositive = filteredExpenses
      .filter(e => (e.category || '').startsWith('income:'))
      .reduce((s, e) => s + e.amount, 0);
    const expenseOut = filteredExpenses
      .filter(e => !(e.category || '').startsWith('income:'))
      .reduce((s, e) => s + e.amount, 0);

    const totalIncome = incomeFromPayments + incomeFromSales + incomeFromExpensePositive;
    const totalExpense = expenseOut;
    const net = totalIncome - totalExpense;

    const byMethod: Record<PaymentMethod, number> = { cash: 0, transfer: 0, promptpay: 0, card: 0 };
    filteredPayments.forEach(p => { byMethod[p.method] += p.amount; });
    filteredSales.forEach(s => {
      if (s.payments?.length) s.payments.forEach(pm => { byMethod[pm.method] += pm.amount; });
      else byMethod[s.method] += s.total;
    });
    byMethod.cash += incomeFromExpensePositive;

    return { totalIncome, totalExpense, net, byMethod };
  }, [filteredPayments, filteredSales, filteredExpenses]);

  const rows = useMemo(() => {
    const paymentRows = dayPayments.map(p => ({
      time: format(new Date(p.paidAt), 'HH:mm'),
      type: 'payment',
      method: p.method,
      amount: p.amount,
      note: p.note || `ชำระงาน ${p.jobId}`
    }));
    const saleRows = daySales.map(s => ({
      time: format(new Date(s.date), 'HH:mm'),
      type: 'sale',
      method: s.method,
      amount: s.total,
      note: `ขายสินค้า ${s.items.map(i => i.name).join(' + ')}`
    }));
    const expenseRows = dayExpenses.map(e => ({
      time: format(new Date(e.date), 'HH:mm'),
      type: (e.category || '').startsWith('income:') ? 'income' : 'expense',
      method: e.method,
      amount: e.amount,
      note: e.note || e.category
    }));
    const combined = [...paymentRows, ...saleRows, ...expenseRows];
    return combined;
  }, [dayPayments, daySales, dayExpenses]);

  // Filtered rows for display
  const filteredRows = useMemo(() => {
    const paymentRows = filteredPayments.map(p => ({
      time: format(new Date(p.paidAt), 'HH:mm'),
      type: 'payment',
      method: p.method,
      amount: p.amount,
      note: p.note || `ชำระงาน ${p.jobId}`,
      date: format(new Date(p.paidAt), 'dd/MM/yyyy')
    }));
    const saleRows = filteredSales.map(s => ({
      time: format(new Date(s.date), 'HH:mm'),
      type: 'sale',
      method: s.method,
      amount: s.total,
      note: `ขายสินค้า ${s.items.map(i => i.name).join(' + ')}`,
      date: format(new Date(s.date), 'dd/MM/yyyy')
    }));
    const expenseRows = filteredExpenses.map(e => ({
      time: format(new Date(e.date), 'HH:mm'),
      type: (e.category || '').startsWith('income:') ? 'income' : 'expense',
      method: e.method,
      amount: e.amount,
      note: e.note || e.category,
      date: format(new Date(e.date), 'dd/MM/yyyy')
    }));
    
    let combined = [...paymentRows, ...saleRows, ...expenseRows];
    
    // Apply filters
    if (filterType !== 'all') {
      combined = combined.filter(r => r.type === filterType);
    }
    
    if (filterMethod !== 'all') {
      combined = combined.filter(r => r.method === filterMethod);
    }
    
    if (filterSearch) {
      combined = combined.filter(r => 
        r.note.toLowerCase().includes(filterSearch.toLowerCase()) ||
        r.type.toLowerCase().includes(filterSearch.toLowerCase()) ||
        r.method.toLowerCase().includes(filterSearch.toLowerCase())
      );
    }
    
    return combined;
  }, [filteredPayments, filteredSales, filteredExpenses, filterType, filterMethod, filterSearch]);

  const handleAdd = async () => {
    const d = new Date(dateStr + 'T00:00:00');
    if (type === 'income') {
      await createExpense({ date: d, category: 'income:other', amount, method, createdBy: 'ผู้ใช้', note });
    } else {
      await createExpense({ date: d, category, amount, method, createdBy: 'ผู้ใช้', note });
    }
    toast({ title: 'บันทึกสำเร็จ', description: 'เพิ่มรายการเรียบร้อย' });
    setAmount(0); 
    setNote('');
    setAddDialogOpen(false);
  };

  const resetFilters = () => {
    setFilterDateFrom(format(new Date(), 'yyyy-MM-dd'));
    setFilterDateTo(format(new Date(), 'yyyy-MM-dd'));
    setFilterType('all');
    setFilterMethod('all');
    setFilterSearch('');
  };

  const exportCSV = () => {
    const csv = toCSV(filteredRows.map(r => ({
      วันที่: r.date,
      เวลา: r.time,
      ประเภท: r.type,
      ช่องทาง: r.method,
      จำนวนเงิน: r.amount,
      หมายเหตุ: r.note
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbook-${filterDateFrom}-${filterDateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToCloseDay = () => {
    const text = [
      `รายรับรวม: ${formatCurrency(filteredSummary.totalIncome)}`,
      `รายจ่ายรวม: ${formatCurrency(filteredSummary.totalExpense)}`,
      `คงเหลือสุทธิ: ${formatCurrency(filteredSummary.net)}`,
      `ตามช่องทาง: เงินสด ${formatCurrency(filteredSummary.byMethod.cash)}, โอน ${formatCurrency(filteredSummary.byMethod.transfer)}, พร้อมเพย์ ${formatCurrency(filteredSummary.byMethod.promptpay)}, บัตร ${formatCurrency(filteredSummary.byMethod.card)}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'คัดลอกแล้ว', description: 'นำยอดไปปิดวันได้เลย' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="รายรับ–รายจ่าย" 
          description="จัดการการเงินและติดตามรายรับ-รายจ่าย" 
          showActions={false} 
        />

        {/* Main Stats Dashboard - compact tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-border/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">รายรับรวม</div>
                  <div className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(summary.totalIncome)}</div>
                  <div className="text-xs text-emerald-700/70 thai-text">บาท</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">รายจ่ายรวม</div>
                  <div className="text-3xl font-bold text-amber-700 mt-1">{formatCurrency(summary.totalExpense)}</div>
                  <div className="text-xs text-amber-700/70 thai-text">บาท</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">คงเหลือสุทธิ</div>
                  <div className={`text-3xl font-bold mt-1 ${summary.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(summary.net)}</div>
                  <div className={`text-xs thai-text ${summary.net >= 0 ? 'text-emerald-700/70' : 'text-rose-700/70'}`}>บาท</div>
                </div>
                <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md ${summary.net >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">รายการทั้งหมด</div>
                  <div className="text-3xl font-bold text-indigo-700 mt-1">{rows.length}</div>
                  <div className="text-xs text-indigo-700/70 thai-text">รายการ</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient px-8 py-3 text-lg" size="lg">
                <Plus className="w-6 h-6 mr-3" />
                เพิ่มรายการ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="thai-text text-green-700">เพิ่มรายการใหม่</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label className="thai-text font-medium">ประเภท</Label>
                  <Select value={type} onValueChange={(v) => setType(v as EntryType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">รายรับ</SelectItem>
                      <SelectItem value="expense">รายจ่าย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="thai-text font-medium">หมวดหมู่</Label>
                  <Input 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    placeholder={type === 'income' ? 'income:other' : 'ค่าใช้จ่ายทั่วไป'}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="thai-text font-medium">วันที่</Label>
                  <Input 
                    type="date" 
                    value={dateStr} 
                    onChange={(e) => setDateStr(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="thai-text font-medium">ช่องทาง</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="ช่องทางชำระ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">เงินสด</SelectItem>
                      <SelectItem value="transfer">โอน</SelectItem>
                      <SelectItem value="promptpay">พร้อมเพย์</SelectItem>
                      <SelectItem value="card">บัตร</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="thai-text font-medium">จำนวนเงิน</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    step="1" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="thai-text font-medium">หมายเหตุ</Label>
                  <Input 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1"
                    placeholder="รายละเอียดเพิ่มเติม"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="px-6">
                  ยกเลิก
                </Button>
                <Button className="btn-gradient px-6" type="button" onClick={handleAdd}>
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg"
          >
            <Filter className="w-6 h-6 mr-3" />
            {showFilters ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
          </Button>
        </div>

        {/* Filter Section - Hidden by default */}
        {showFilters && (
        <Card className="glass-card border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 thai-text text-blue-700">
                <Filter className="h-5 w-5" />
                ตัวกรองรายการ
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(false)}
                className="h-8 w-8 p-0 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-48">
                <Label className="text-sm font-medium thai-text mb-1 block">วันที่เริ่ม</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full sm:w-48">
                <Label className="text-sm font-medium thai-text mb-1 block">วันที่สิ้นสุด</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full sm:w-56">
                <Label className="text-sm font-medium thai-text mb-1 block">ประเภท</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="ประเภททั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                    <SelectItem value="income">รายรับ</SelectItem>
                    <SelectItem value="expense">รายจ่าย</SelectItem>
                    <SelectItem value="payment">ชำระงาน</SelectItem>
                    <SelectItem value="sale">ขายสินค้า</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-56">
                <Label className="text-sm font-medium thai-text mb-1 block">ช่องทาง</Label>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="ช่องทางทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ช่องทางทั้งหมด</SelectItem>
                    <SelectItem value="cash">เงินสด</SelectItem>
                    <SelectItem value="transfer">โอน</SelectItem>
                    <SelectItem value="promptpay">พร้อมเพย์</SelectItem>
                    <SelectItem value="card">บัตร</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[220px] flex-1">
                <Label className="text-sm font-medium thai-text mb-1 block">ค้นหา</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหา: หมายเหตุ, ประเภท, ช่องทาง"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="ml-auto flex gap-3">
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ล้าง
                </Button>
                <Button variant="outline" onClick={exportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Filtered Summary */}
        <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="thai-text text-xl">สรุปรายการที่กรอง</CardTitle>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">฿{filteredSummary.totalIncome.toLocaleString()}</div>
                <div className="text-muted-foreground thai-text">รายรับ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">฿{filteredSummary.totalExpense.toLocaleString()}</div>
                <div className="text-muted-foreground thai-text">รายจ่าย</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${filteredSummary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{filteredSummary.net.toLocaleString()}
                </div>
                <div className="text-muted-foreground thai-text">คงเหลือ</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">฿{filteredSummary.byMethod.cash.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">เงินสด</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">฿{filteredSummary.byMethod.transfer.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">โอน</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">฿{filteredSummary.byMethod.promptpay.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">พร้อมเพย์</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">฿{filteredSummary.byMethod.card.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">บัตร</div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* List */}
        <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="thai-text text-xl">รายการที่พบ ({filteredRows.length})</CardTitle>
            <div className="text-sm text-muted-foreground thai-text">
              {filterDateFrom === filterDateTo 
                ? `วันที่ ${format(new Date(filterDateFrom), 'dd/MM/yyyy')}`
                : `วันที่ ${format(new Date(filterDateFrom), 'dd/MM/yyyy')} - ${format(new Date(filterDateTo), 'dd/MM/yyyy')}`
              }
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text font-semibold">วันที่</TableHead>
                  <TableHead className="thai-text font-semibold">เวลา</TableHead>
                  <TableHead className="thai-text font-semibold">ประเภท</TableHead>
                  <TableHead className="thai-text font-semibold">ช่องทาง</TableHead>
                  <TableHead className="thai-text font-semibold">จำนวนเงิน</TableHead>
                  <TableHead className="thai-text font-semibold">หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r, idx) => (
                  <TableRow key={idx} className="hover:bg-accent/50">
                    <TableCell className="thai-text font-medium">{r.date}</TableCell>
                    <TableCell className="font-mono">{r.time}</TableCell>
                    <TableCell>
                      <Badge variant={r.type === 'income' || r.type === 'sale' || r.type === 'payment' ? 'default' : 'secondary'}>
                        {r.type === 'income' ? 'รายรับ' : 
                         r.type === 'expense' ? 'รายจ่าย' : 
                         r.type === 'payment' ? 'ชำระงาน' : 
                         r.type === 'sale' ? 'ขายสินค้า' : r.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="thai-text font-medium">{r.method}</TableCell>
                    <TableCell className={`font-bold text-lg ${r.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {r.type === 'expense' ? '-' : '+'}฿{r.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="thai-text max-w-xs truncate" title={r.note}>
                      {r.note}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center thai-text text-muted-foreground py-12">
                      <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">ไม่มีรายการตามเงื่อนไข</p>
                      <Button variant="outline" onClick={resetFilters} className="mt-4">
                        ล้างตัวกรอง
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}


