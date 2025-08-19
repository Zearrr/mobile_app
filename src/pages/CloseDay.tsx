import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { closeDayRepo } from '@/lib/repositories';
import { cn, formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { CloseDay, PaymentMethod } from '@/types';
import { endOfDay, format, isWithinInterval, startOfDay } from 'date-fns';
import {
    ArrowRight,
    Calculator,
    Printer,
    Save,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export default function CloseDayPage() {
  const { toast } = useToast();
  const settings = useRepairStore(s => s.settings);
  const payments = useRepairStore(s => s.payments);
  const sales = useRepairStore(s => s.sales || []);
  const expenses = useRepairStore(s => s.expenses || []);

  const [dateStr, setDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [actualCash, setActualCash] = useState<number>(0);
  const [signer, setSigner] = useState<string>('');

  const selectedDate = useMemo(() => new Date(dateStr), [dateStr]);
  const range = useMemo(() => ({ start: startOfDay(selectedDate), end: endOfDay(selectedDate) }), [selectedDate]);

  const dayPayments = useMemo(() => payments.filter(p => isWithinInterval(new Date(p.paidAt), range)), [payments, range]);
  const daySales = useMemo(() => sales.filter(s => isWithinInterval(new Date(s.date), range)), [sales, range]);
  const dayExpenses = useMemo(() => expenses.filter(e => isWithinInterval(new Date(s.date), range)), [expenses, range]);

  const sums = useMemo(() => {
    const methods: PaymentMethod[] = ['cash', 'transfer', 'promptpay', 'card'];
    const init: Record<PaymentMethod, number> = { cash: 0, transfer: 0, promptpay: 0, card: 0 };
    const inByMethod: Record<PaymentMethod, number> = { ...init };

    dayPayments.forEach(p => { inByMethod[p.method] += p.amount; });
    daySales.forEach(s => {
      if (s.payments?.length) s.payments.forEach(pm => { inByMethod[pm.method] += pm.amount; });
      else inByMethod[s.method] += s.total;
    });
    // รายรับอื่น (income:*) ที่บันทึกใน expenses ให้ถือเข้า method ตามที่ระบุ
    dayExpenses.filter(e => (e.category || '').startsWith('income:')).forEach(e => { inByMethod[e.method] += e.amount; });

    const cashOut = dayExpenses.filter(e => !(e.category || '').startsWith('income:') && e.method === 'cash')
      .reduce((s, e) => s + e.amount, 0);

    return { cashIn: inByMethod.cash, transferIn: inByMethod.transfer, promptpayIn: inByMethod.promptpay, cardIn: inByMethod.card, cashOut };
  }, [dayPayments, daySales, dayExpenses]);

  const expectedCash = useMemo(() => openingCash + sums.cashIn - sums.cashOut, [openingCash, sums]);
  const diff = useMemo(() => actualCash - expectedCash, [actualCash, expectedCash]);

  const handleSave = async () => {
    const payload: CloseDay = {
      id: `CD_${dateStr}`,
      date: new Date(dateStr + 'T00:00:00'),
      openingCash,
      cashIn: sums.cashIn,
      cashOut: sums.cashOut,
      transferIn: sums.transferIn,
      promptpayIn: sums.promptpayIn,
      cardIn: sums.cardIn,
      expectedCash,
      actualCash,
      diff,
      signer: signer || 'ผู้ปิดยอด'
    };
    await closeDayRepo.put ? (closeDayRepo as any).put(payload) : closeDayRepo.add(payload);
    toast({ title: 'บันทึกปิดยอดสำเร็จ', description: `วันที่ ${dateStr}` });
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `close-day-${dateStr}`,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; font-family: 'Sarabun', system-ui, sans-serif; }
      h1,h2,h3 { margin: 0; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
    `
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">ปิดยอดสิ้นวัน</h1>
          <p className="thai-text text-muted-foreground text-lg">สรุปยอดและบันทึกปิดวัน</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={dateStr} 
            onChange={(e) => setDateStr(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์รายงาน
          </Button>
          <Button className="btn-gradient" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            บันทึกปิดยอด
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="glass-card border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold thai-text text-blue-700 mb-2">ต้องการดูรายละเอียดรายรับ-รายจ่าย?</h3>
              <p className="thai-text text-blue-600">คลิกปุ่มด้านขวาเพื่อไปยังหน้ารายรับ-รายจ่าย</p>
            </div>
            <Link to="/cashbook">
              <Button className="btn-gradient px-6 py-3">
                <ArrowRight className="w-5 h-5 mr-2" />
                ไปหน้ารายรับ-รายจ่าย
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Summary Dashboard - high-contrast tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="stat-tile stat-emerald">
          <div className="stat-title">
            <TrendingUp className="w-4 h-4" /> เงินสดเข้า
          </div>
          <div className="stat-value">{formatCurrency(sums.cashIn)}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>

        <div className="stat-tile stat-rose">
          <div className="stat-title">
            <TrendingDown className="w-4 h-4" /> เงินสดออก
          </div>
          <div className="stat-value">{formatCurrency(sums.cashOut)}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>

        <div className="stat-tile stat-cyan">
          <div className="stat-title">
            <Wallet className="w-4 h-4" /> โอนเข้า
          </div>
          <div className="stat-value">{formatCurrency(sums.transferIn)}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>

        <div className="stat-tile stat-violet">
          <div className="stat-title">
            <Wallet className="w-4 h-4" /> พร้อมเพย์เข้า
          </div>
          <div className="stat-value">{formatCurrency(sums.promptpayIn)}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>

        <div className="stat-tile stat-orange">
          <div className="stat-title">
            <Wallet className="w-4 h-4" /> บัตรเข้า
          </div>
          <div className="stat-value">{formatCurrency(sums.cardIn)}</div>
          <div className="opacity-80 thai-text text-sm">บาท</div>
        </div>
      </div>

      {/* Cash Counting Form */}
      <Card className="glass-card border-2 border-yellow-200 bg-yellow-50/30">
        <CardHeader>
          <CardTitle className="thai-text text-yellow-700 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            นับเงินสด
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div>
            <Label className="thai-text font-medium mb-2 block">เงินยกมา (Opening Cash)</Label>
            <Input 
              type="number" 
              min={0} 
              step="1" 
              value={openingCash} 
              onChange={(e) => setOpeningCash(Number(e.target.value))}
              className="text-lg"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="thai-text font-medium mb-2 block">เงินสดคาดหวัง (Expected)</Label>
            <Input 
              readOnly 
              value={expectedCash}
              className="text-lg font-bold text-blue-600 bg-blue-50"
            />
          </div>
          <div>
            <Label className="thai-text font-medium mb-2 block">เงินสดที่นับจริง (Actual)</Label>
            <Input 
              type="number" 
              min={0} 
              step="1" 
              value={actualCash} 
              onChange={(e) => setActualCash(Number(e.target.value))}
              className="text-lg"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="thai-text font-medium mb-2 block">ส่วนต่าง (Diff)</Label>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={diff}
                className={cn(
                  'text-lg font-bold',
                  diff === 0 ? 'text-gray-600 bg-gray-50' : 
                  diff > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                )}
              />
              {diff !== 0 && (
                <Badge variant={diff > 0 ? 'default' : 'destructive'}>
                  {diff > 0 ? 'เกิน' : 'ขาด'}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <Label className="thai-text font-medium mb-2 block">ผู้ปิดยอด</Label>
            <Input 
              value={signer} 
              onChange={(e) => setSigner(e.target.value)} 
              placeholder="ชื่อ-สกุล"
              className="text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text text-xl">สรุปสถานะ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">฿{expectedCash.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">เงินสดคาดหวัง</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">฿{actualCash.toLocaleString()}</div>
              <div className="text-muted-foreground thai-text font-medium">เงินสดที่นับจริง</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className={`text-2xl font-bold ${diff === 0 ? 'text-green-600' : diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ฿{Math.abs(diff).toLocaleString()}
              </div>
              <div className="text-muted-foreground thai-text font-medium">
                {diff === 0 ? 'ตรงกัน' : diff > 0 ? 'เกิน' : 'ขาด'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable content */}
      <div className="hidden">
        <div ref={printRef}>
          <div style={{ fontFamily: 'Sarabun, system-ui, sans-serif' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{settings?.storeName || 'รายงานสิ้นวัน'}</h2>
            <div style={{ fontSize: 12 }}>{settings?.address || ''} | {settings?.phone || ''}</div>
            <div style={{ marginTop: 6, fontSize: 12 }}>วันที่: {format(selectedDate, 'dd/MM/yyyy')}</div>

            <h3 style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>สรุปตามช่องทาง</h3>
            <table>
              <thead><tr><th>รายการ</th><th>จำนวนเงิน</th></tr></thead>
              <tbody>
                <tr><td>เงินสดเข้า</td><td style={{ textAlign: 'right' }}>{formatCurrency(sums.cashIn)}</td></tr>
                <tr><td>เงินสดออก</td><td style={{ textAlign: 'right' }}>{formatCurrency(sums.cashOut)}</td></tr>
                <tr><td>โอนเข้า</td><td style={{ textAlign: 'right' }}>{formatCurrency(sums.transferIn)}</td></tr>
                <tr><td>พร้อมเพย์เข้า</td><td style={{ textAlign: 'right' }}>{formatCurrency(sums.promptpayIn)}</td></tr>
                <tr><td>บัตรเข้า</td><td style={{ textAlign: 'right' }}>{formatCurrency(sums.cardIn)}</td></tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>สรุปเงินสด</h3>
            <table>
              <thead><tr><th>รายการ</th><th>จำนวนเงิน</th></tr></thead>
              <tbody>
                <tr><td>เงินยกมา</td><td style={{ textAlign: 'right' }}>{formatCurrency(openingCash)}</td></tr>
                <tr><td>เงินสดคาดหวัง</td><td style={{ textAlign: 'right' }}>{formatCurrency(expectedCash)}</td></tr>
                <tr><td>เงินสดที่นับจริง</td><td style={{ textAlign: 'right' }}>{formatCurrency(actualCash)}</td></tr>
                <tr><td>ส่วนต่าง</td><td style={{ textAlign: 'right' }}>{formatCurrency(diff)}</td></tr>
              </tbody>
            </table>

            <div style={{ marginTop: 24, display: 'flex', gap: 40 }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 60, borderBottom: '1px dashed #999' }} />
                <div style={{ fontSize: 12, textAlign: 'center' }}>ลงชื่อผู้ปิดยอด: {signer || '................................'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


