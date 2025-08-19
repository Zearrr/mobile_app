import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
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

  // Technician performance
  const techPerf = useMemo(() => {
    const g = new Map<string, { technician: string; jobs: number; avgHours: number; claims: number; done: number }>();
    const get = (name: string) => { if (!g.has(name)) g.set(name, { technician: name, jobs: 0, avgHours: 0, claims: 0, done: 0 }); return g.get(name)!; };
    jobs.forEach(j => {
      const name = j.technician || 'ไม่ระบุ';
      const row = get(name);
      row.jobs += 1;
      if (j.completedAt) {
        row.done += 1;
        const hours = (new Date(j.completedAt).getTime() - new Date(j.receivedAt).getTime()) / 36e5;
        row.avgHours += hours;
      }
      if (j.status === 'returned') row.claims += 1;
    });
    return Array.from(g.values()).map(r => ({ ...r, avgHours: r.done ? Math.round((r.avgHours / r.done) * 10) / 10 : 0, claimRate: r.done ? Math.round((r.claims / r.done) * 1000) / 10 : 0 })).sort((a,b)=> b.jobs - a.jobs);
  }, [jobs]);

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

  // Export PDF via print-per-section
  const refRevenue = useRef<HTMLDivElement>(null);
  const refTop = useRef<HTMLDivElement>(null);
  const refStock = useRef<HTMLDivElement>(null);
  const refTech = useRef<HTMLDivElement>(null);
  const printRevenue = useReactToPrint({ content: () => refRevenue.current });
  const printTop = useReactToPrint({ content: () => refTop.current });
  const printStock = useReactToPrint({ content: () => refStock.current });
  const printTech = useReactToPrint({ content: () => refTech.current });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">รายงานภาพรวม</h1>
          <p className="thai-text text-muted-foreground">สรุปยอดและสถิติต่าง ๆ</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="thai-text">โหมด</Label>
          <select className="h-10 rounded-md border px-3" value={granularity} onChange={(e)=> setGranularity(e.target.value as Granularity)}>
            <option value="daily">รายวัน</option>
            <option value="monthly">รายเดือน</option>
          </select>
          <Input type="date" value={dateStr} onChange={(e)=> setDateStr(e.target.value)} />
        </div>
      </div>

      {/* Revenue vs Cost vs Profit */}
      <Card className="glass-card" ref={refRevenue}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">รายได้ vs ต้นทุน vs กำไร</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(rcp, `revenue-cost-profit-${granularity}`)}>Export CSV</Button>
            <Button variant="outline" onClick={printRevenue}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rcp}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" name="รายได้" />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" name="ต้นทุน" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="กำไร" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top charts */}
      <Card className="glass-card" ref={refTop}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">Top 5 รุ่นซ่อมบ่อย / ทำเงินสูงสุด</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(topModels, 'top-models')}>Top Models CSV</Button>
            <Button variant="outline" onClick={()=> exportCSV(topIncome, 'top-income')}>Top Income CSV</Button>
            <Button variant="outline" onClick={printTop}>Export PDF</Button>
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
            <Button variant="outline" onClick={printStock}>Export PDF</Button>
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

      {/* Technician performance */}
      <Card className="glass-card" ref={refTech}>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="thai-text">ผลงานช่าง</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> exportCSV(techPerf.map(t => ({ technician: t.technician, jobs: t.jobs, avgHours: t.avgHours, claimRate: `${t.claims}/${t.done} (${t.done? Math.round((t.claims/t.done)*1000)/10:0}%)` })), 'technician-performance')}>Export CSV</Button>
            <Button variant="outline" onClick={printTech}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">ช่าง</TableHead>
                  <TableHead className="thai-text">จำนวนงาน</TableHead>
                  <TableHead className="thai-text">เวลาเฉลี่ย (ชม.)</TableHead>
                  <TableHead className="thai-text">อัตราเคลม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techPerf.map(t => (
                  <TableRow key={t.technician}>
                    <TableCell className="thai-text">{t.technician}</TableCell>
                    <TableCell className="thai-text">{t.jobs}</TableCell>
                    <TableCell className="thai-text">{t.avgHours}</TableCell>
                    <TableCell className="thai-text">{t.done ? `${Math.round((t.claims/t.done)*1000)/10}%` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


