import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { BarChart3, DollarSign, List, Package, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

type Granularity = 'daily' | 'monthly';

function toCSV(rows: Array<Record<string, any>>): string {
  const headers = Object.keys(rows[0] || {});
  const esc = (v: any) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [headers.join(',')].concat(rows.map(r => headers.map(h => esc(r[h])).join(','))).join('\n');
}

export default function Reports() {
  const { jobs, payments, sales, expenses, parts } = useRepairStore();
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [dateStr, setDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const periodKey = (d: Date) => granularity === 'monthly' ? format(d, 'yyyy-MM') : format(d, 'yyyy-MM-dd');

  // Revenue/Cost/Profit series
  const rcp = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; cost: number; profit: number }>();
    const add = (d: Date, f: (row: any) => void) => {
      const key = periodKey(d);
      if (!map.has(key)) map.set(key, { date: key, revenue: 0, cost: 0, profit: 0 });
      const row = map.get(key)!; f(row);
    };
    // revenue from payments
    payments.forEach(p => add(new Date(p.paidAt), (row) => { row.revenue += p.amount; }));
    // revenue from sales
    sales.forEach(s => add(new Date(s.date), (row) => { row.revenue += s.total; }));
    // cost from jobs on completed date (cost parts+labor)
    jobs.filter(j => j.completedAt).forEach(j => add(new Date(j.completedAt as Date), (row) => { row.cost += (j.costParts || 0) + (j.costLabor || 0); }));
    // cost from sales items cost
    sales.forEach(s => add(new Date(s.date), (row) => {
      const cost = (s.items || []).reduce((sum, it) => sum + (it.cost || 0) * it.qty, 0);
      row.cost += cost;
    }));
    // expenses (exclude income:* which are positive incomes)
    expenses.filter(e => !(e.category || '').startsWith('income:')).forEach(e => add(new Date(e.date), (row) => { row.cost += e.amount; }));
    // profit
    Array.from(map.values()).forEach(v => { v.profit = v.revenue - v.cost; });
    return Array.from(map.values()).sort((a,b)=> a.date.localeCompare(b.date));
  }, [payments, sales, jobs, expenses, granularity]);

  // Pie data (sum of series in current dataset)
  const pieData = useMemo(() => {
    const sums = rcp.reduce((acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cost: acc.cost + r.cost,
      profit: acc.profit + r.profit
    }), { revenue: 0, cost: 0, profit: 0 });
    return [
      { name: 'รายได้', value: sums.revenue, color: '#8b5cf6' },
      { name: 'ต้นทุน', value: sums.cost, color: '#f97316' },
      { name: 'กำไร', value: sums.profit, color: '#3b82f6' }
    ];
  }, [rcp]);

  // Top 5 models by count
  const topModels = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach(j => { const key = `${j.brand} ${j.model}`.trim(); m.set(key, (m.get(key) || 0) + 1); });
    return Array.from(m.entries()).map(([name, count]) => ({ name, count })).sort((a,b)=> b.count - a.count).slice(0,5);
  }, [jobs]);

  // Top revenue by model (jobs total)
  const topIncome = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach(j => { const key = `${j.brand} ${j.model}`.trim(); m.set(key, (m.get(key) || 0) + (j.total || 0)); });
    sales.forEach(s => s.items.forEach(i => m.set(i.name, (m.get(i.name) || 0) + (i.unitPrice * i.qty))));
    return Array.from(m.entries()).map(([name, total]) => ({ name, total })).sort((a,b)=> b.total - a.total).slice(0,5);
  }, [jobs, sales]);

  // Low stock list
  const lowStock = useMemo(() => parts.filter(p => (p.minStock ?? 0) > 0 && (p.stock || 0) <= (p.minStock || 0)), [parts]);

  // All sales list for table (include cost and profit for better insights)
  const allSales = useMemo(() => {
    return sales.map(sale => {
      const totalItems = sale.items.reduce((sum, item) => sum + item.qty, 0);
      const discount = sale.discount || 0;
      const net = sale.total;
      const cost = sale.items.reduce((sum, it) => sum + ((it.cost || 0) * it.qty), 0);
      const profit = net - cost;
      return {
        ...sale,
        totalItems,
        discount,
        net,
        cost,
        profit
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  // Pagination for All Sales table
  const [page, setPage] = useState(1);
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(allSales.length / perPage));
  useEffect(() => { setPage(1); }, [allSales.length]);

  const getPaymentLabel = (s: any) => {
    const toText = (m: string) => m === 'cash' ? 'เงินสด' : m === 'transfer' ? 'โอนเงิน' : m === 'card' ? 'บัตร' : m === 'promptpay' ? 'พร้อมเพย์' : m;
    if (Array.isArray(s.payments) && s.payments.length > 0) {
      return s.payments.map((p: any) => `${toText(p.method)} ${formatCurrency(p.amount)}`).join(' + ');
    }
    return toText(s.method);
  };

  const getPaymentButtonClass = (s: any) => {
    const has = (m: string) => Array.isArray(s.payments) ? s.payments.some((p: any) => p.method === m) : s.method === m;
    // Solid tones like sample: amber, cyan, emerald, rose
    if (has('card')) return 'bg-amber-400 hover:bg-amber-500 text-black rounded-md shadow w-20';
    if (has('transfer')) return 'bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow w-20';
    if (has('cash')) return 'bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow w-20';
    return 'bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow w-20';
  };



  // Export helpers (CSV)
  const exportCSV = (rows: any[], name: string) => {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple print helper per section (avoid type issues with react-to-print)
  const refRevenue = useRef<HTMLDivElement>(null);
  const refTop = useRef<HTMLDivElement>(null);
  const refStock = useRef<HTMLDivElement>(null);
  const refSales = useRef<HTMLDivElement>(null);
  const printSection = (ref: React.RefObject<HTMLDivElement>, title: string) => {
    const html = ref.current?.innerHTML || '';
    const win = window.open('', '', 'width=1024,height=700');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Inter,system-ui,Segoe UI,Arial;padding:16px}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
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
              <div className="text-xl md:text-2xl font-bold">รายงานภาพรวม</div>
              <div className="text-white/90 thai-text text-sm md:text-base">สรุปยอดและสถิติต่าง ๆ</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="thai-text text-white">โหมด</Label>
            <select className="h-10 rounded-md border px-3 bg-white text-slate-900" value={granularity} onChange={(e)=> setGranularity(e.target.value as Granularity)}>
              <option value="daily">รายวัน</option>
              <option value="monthly">รายเดือน</option>
            </select>
            <Input type="date" value={dateStr} onChange={(e)=> setDateStr(e.target.value)} className="bg-white text-slate-900 placeholder:text-slate-600" />
          </div>
        </div>

      {/* Summary tiles styled like Parts */}
      {(() => {
        const key = periodKey(new Date(dateStr));
        const row = rcp.find(r => r.date === key) || ({ revenue: 0, cost: 0, profit: 0 } as any);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-border/50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">รายได้</div>
                    <div className="text-3xl font-bold text-emerald-700 mt-1">฿{row.revenue.toLocaleString()}</div>
                    <div className="text-xs text-emerald-700/70 thai-text">{granularity === 'monthly' ? 'รายเดือน' : 'รายวัน'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">ต้นทุน</div>
                    <div className="text-3xl font-bold text-amber-700 mt-1">฿{row.cost.toLocaleString()}</div>
                    <div className="text-xs text-amber-700/70 thai-text">{granularity === 'monthly' ? 'รายเดือน' : 'รายวัน'}</div>
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
                    <div className="text-xs text-muted-foreground">กำไร</div>
                    <div className="text-3xl font-bold text-indigo-700 mt-1">฿{row.profit.toLocaleString()}</div>
                    <div className="text-xs text-indigo-700/70 thai-text">{granularity === 'monthly' ? 'รายเดือน' : 'รายวัน'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">สต็อกใกล้หมด</div>
                    <div className="text-3xl font-bold text-rose-700 mt-1">{lowStock.length}</div>
                    <div className="text-xs text-rose-700/70 thai-text">รายการ</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Revenue vs Cost vs Profit - smooth area lines like example */}
      <Card className="glass-card" ref={refRevenue}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">รายได้ vs ต้นทุน vs กำไร</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(rcp, `revenue-cost-profit-${granularity}`)}>Export CSV</Button>
            <Button variant="outline" onClick={() => printSection(refRevenue, 'revenue-cost-profit')}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent style={{ height: 320 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rcp} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="รายได้" stroke="#8b5cf6" strokeWidth={3} fill="url(#gradRevenue)" dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="cost" name="ต้นทุน" stroke="#f97316" strokeWidth={3} fill="url(#gradCost)" dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="profit" name="กำไร" stroke="#3b82f6" strokeWidth={3} fill="url(#gradProfit)" dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}
                     label={(e: any) => `${e.name} ${pieData.reduce((s,d)=>s+d.value,0) ? Math.round((e.value/(pieData.reduce((s,d)=>s+d.value,0)))*100) : 0}%`}>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: any)=> typeof v==='number'? v.toLocaleString(): v} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top charts */}
      <Card className="glass-card" ref={refTop}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">Top 5 รุ่นซ่อมบ่อย / ทำเงินสูงสุด</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(topModels, 'top-models')}>Top Models CSV</Button>
            <Button variant="outline" onClick={()=> exportCSV(topIncome, 'top-income')}>Top Income CSV</Button>
            <Button variant="outline" onClick={() => printSection(refTop, 'top-charts')}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ height: 360 }}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topModels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" name="จำนวนงาน" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topIncome}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#22c55e" name="รายได้" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low stock */}
      <Card className="glass-card" ref={refStock}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">สต็อกใกล้หมด</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(lowStock.map(p => ({ sku: p.sku, name: p.name, stock: p.stock, minStock: p.minStock || 0 })), 'low-stock')}>Export CSV</Button>
            <Button variant="outline" onClick={() => printSection(refStock, 'low-stock')}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">SKU</TableHead>
                  <TableHead className="thai-text">ชื่อ</TableHead>
                  <TableHead className="thai-text">คงเหลือ</TableHead>
                  <TableHead className="thai-text">จุดสั่งซื้อ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">{p.sku}</TableCell>
                    <TableCell className="thai-text">{p.name}</TableCell>
                    <TableCell className="thai-text">{p.stock}</TableCell>
                    <TableCell className="thai-text">{p.minStock}</TableCell>
                  </TableRow>
                ))}
                {lowStock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center thai-text text-muted-foreground py-8">สต็อกปกติ</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* All Sales List */}
      <Card className="glass-card" ref={refSales}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text flex items-center gap-2">
            <List className="w-5 h-5" />
            รายการขายทั้งหมด
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(allSales.map(s => ({ 
              receiptNumber: s.id, 
              dateTime: format(new Date(s.date), 'dd/MM/yyyy HH:mm'),
              customer: s.customer || 'ลูกค้าทั่วไป',
              items: s.totalItems,
              total: s.subtotal,
              discount: s.discount,
              net: s.net,
              paymentMethod: s.method,
              cashier: s.employee || 'admin'
            })), 'all-sales')}>Export CSV</Button>
            <Button variant="outline" onClick={() => printSection(refSales, 'all-sales')}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">เลขที่ใบเสร็จ</TableHead>
                  <TableHead className="thai-text">วันเวลา</TableHead>
                  <TableHead className="thai-text">ลูกค้า</TableHead>
                  <TableHead className="thai-text">โทรศัพท์</TableHead>
                  <TableHead className="thai-text">รายการ</TableHead>
                  <TableHead className="thai-text">ค่าใช้จ่าย</TableHead>
                  <TableHead className="thai-text">ต้นทุน</TableHead>
                  <TableHead className="thai-text">การชำระ</TableHead>
                  <TableHead className="thai-text">แคชเชียร์</TableHead>
                  <TableHead className="thai-text text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSales.slice((page-1)*perPage, (page-1)*perPage + perPage).map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono font-semibold">{sale.id}</TableCell>
                    <TableCell className="thai-text">
                      {format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="thai-text">
                      {sale.customer || 'ลูกค้าทั่วไป'}
                    </TableCell>
                    <TableCell className="thai-text">
                      {sale.customerPhone || '-'}
                    </TableCell>
                    <TableCell className="thai-text">
                      {sale.totalItems} รายการ
                    </TableCell>
                    <TableCell className="thai-text">
                      {formatCurrency(sale.subtotal)}
                    </TableCell>
                    <TableCell className="thai-text">
                      {formatCurrency(sale.cost)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (sale.payments?.some((p:any)=>p.method==='cash') || sale.method === 'cash') ? 'bg-green-100 text-green-800' :
                        (sale.payments?.some((p:any)=>p.method==='transfer') || sale.method === 'transfer') ? 'bg-blue-100 text-blue-800' :
                        (sale.payments?.some((p:any)=>p.method==='card') || sale.method === 'card') ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {getPaymentLabel(sale)}
                      </span>
                    </TableCell>
                    <TableCell className="thai-text">
                      {sale.employee || 'admin'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="secondary" size="sm" asChild className={`${getPaymentButtonClass(sale)}`}>
                        <Link to={`/print/sales/${sale.id}`}>
                          <Receipt className="w-4 h-4 mr-1" />
                          ใบเสร็จ
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center thai-text text-muted-foreground py-8">
                      ไม่มีรายการขาย
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {allSales.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                className="rounded-xl h-9 px-3"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >ก่อนหน้า</Button>
              <div className="text-sm thai-text text-muted-foreground">
                หน้า {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                className="rounded-xl h-9 px-3"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >ถัดไป</Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


