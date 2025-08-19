import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export default function ReceiptPrint() {
  const { id } = useParams();
  const { jobs, sales, payments, settings, getJobById, loadAllData } = useRepairStore();

  useEffect(() => { if (jobs.length === 0) loadAllData(); }, []);

  const job = getJobById(id!);
  const sale = sales.find(s => s.id === id);
  const totalPaid = useMemo(() => payments.filter(p => p.jobId === id).reduce((s, p) => s + p.amount, 0), [payments, id]);

  const printRef = useRef<HTMLDivElement>(null);
  const doPrint = useReactToPrint({ content: () => printRef.current, documentTitle: `receipt-${id}` });

  const title = settings?.vatEnabled ? 'ใบกำกับภาษี' : 'ใบเสร็จรับเงิน';
  const today = new Date();
  const lines = job
    ? [
        { name: `ซ่อม ${job.brand} ${job.model}`, qty: 1, price: job.total }
      ]
    : sale
      ? sale.items.map(i => ({ name: i.name, qty: i.qty, price: i.unitPrice * i.qty }))
      : [];
  const total = lines.reduce((s, l) => s + l.price, 0);

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 print:hidden">
        <Button onClick={doPrint} className="btn-gradient">พิมพ์</Button>
        <Button variant="outline" onClick={() => window.history.back()}>กลับ</Button>
      </div>
      <div ref={printRef} className="print-page">
        <style>{`
          @page { size: auto; margin: 12mm; }
          @media print { .print-page { font-family: 'Sarabun', system-ui, sans-serif; font-size: 12px; } }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{settings?.storeName || 'ชื่อร้าน'}</div>
            <div>{settings?.address || ''}</div>
            <div>โทร: {settings?.phone || '-'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>{title}</div>
            <div>เลขที่: {id}</div>
            <div>วันที่: {format(today, 'dd/MM/yyyy')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>รายการ</th><th>จำนวน</th><th style={{ textAlign: 'right' }}>จำนวนเงิน</th></tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}><td>{l.name}</td><td style={{ width: 80, textAlign: 'center' }}>{l.qty}</td><td style={{ textAlign: 'right' }}>{formatCurrency(l.price)}</td></tr>
            ))}
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700 }}>รวม</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 12 }}>หมายเหตุ: {settings?.vatEnabled ? 'เอกสารออกตามมาตรฐานภาษี' : '-'}</div>
      </div>
    </div>
  );
}


