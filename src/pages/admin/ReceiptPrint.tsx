import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export default function ReceiptPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, sales, payments, settings, getJobById, loadAllData } = useRepairStore();

  useEffect(() => { if (jobs.length === 0 || sales.length === 0) loadAllData(); }, [jobs.length, sales.length, loadAllData]);

  const job = getJobById(id!);
  const sale = sales.find(s => s.id === id);
  const totalPaid = useMemo(() => payments.filter(p => p.jobId === id).reduce((s, p) => s + p.amount, 0), [payments, id]);

  const printRef = useRef<HTMLDivElement>(null);
  const doPrint = useReactToPrint({ content: () => printRef.current, documentTitle: `receipt-${id}` });

  const title = settings?.vatEnabled ? 'ใบกำกับภาษี' : 'ใบเสร็จรับเงิน';
  const today = new Date();
  const lines = sale
      ? sale.items.map(i => ({ name: i.name, qty: i.qty, price: i.unitPrice * i.qty }))
      : job
        ? [{ name: `ซ่อม ${job.brand} ${job.model}`, qty: 1, price: job.total }]
        : [];
  const computedTotal = lines.reduce((s, l) => s + l.price, 0);
  const subtotal = sale ? sale.subtotal : computedTotal;
  const tax = sale ? sale.tax : (settings?.vatEnabled ? Math.round(subtotal * 0.07) : 0);
  const total = sale ? sale.total : (subtotal + tax);
  const payLabel = sale ? (sale.method === 'cash' ? 'เงินสด' : sale.method === 'transfer' ? 'โอนเงิน' : 'บัตร') : job ? 'เงินสด' : '-';
  const printedAt = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

  return (
    <div className="p-4 space-y-3">
      <div ref={printRef} className="print-page">
        <style>{`
          /* Thermal receipt (80mm) friendly */
          @page { size: 80mm auto; margin: 5mm; }
          .print-page { font-family: 'Sarabun', system-ui, sans-serif; font-size: 12px; }
          @media print { .print-page { font-size: 10.5px; } .no-print { display: none; } }
          .receipt { max-width: 80mm; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
          .header { padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; }
          .store h1 { margin: 0; font-size: 14px; font-weight: 800; }
          .meta { text-align: right; }
          .title-bar { padding: 8px 12px; text-align: center; font-weight: 800; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; padding: 10px 12px; }
          .info-row { display: contents; }
          .info-label { color: #4b5563; white-space: nowrap; }
          .section { padding: 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px dashed #e5e7eb; padding: 5px; font-size: 11px; }
          th { text-align: left; color: #111827; background: #f9fafb; font-size: 11.5px; }
          .amount { text-align: right; }
          .summary { width: 100%; padding-top: 6px; }
          .summary-row { display: flex; justify-content: space-between; padding: 3px 0; }
          .note { text-align: center; padding: 10px; color: #111827; border-top: 1px dashed #e5e7eb; border-bottom: 1px dashed #e5e7eb; font-size: 11px; }
          .footer { padding: 6px 10px; color: #6b7280; font-size: 10.5px; text-align: center; }
        `}</style>
        <div className="receipt">
          <div className="header">
            <div className="store">
              <h1>{settings?.storeName || 'ระบบซ่อมมือถือ'}</h1>
              <div>{settings?.address || '123 ถนนเทคโนโลยี แขวงดิจิทัล เขตอินโนเวชั่น กรุงเทพฯ 10240'}</div>
              <div>โทรศัพท์: {settings?.phone || '02-123-4567'}</div>
            </div>
          </div>
          <div className="title-bar">{title}</div>
          <div className="info-grid thai-text">
            <div className="info-row"><div className="info-label">เลขที่ใบเสร็จ:</div><div className="amount">{id}</div></div>
            <div className="info-row"><div className="info-label">วันที่/เวลา:</div><div className="amount">{format(sale ? new Date(sale.date) : today, 'dd/MM/yyyy HH:mm:ss')}</div></div>
            <div className="info-row"><div className="info-label">พนักงานขาย:</div><div className="amount">{settings?.cashierName || 'admin'}</div></div>
          </div>
          <div className="section">
            <table>
              <thead>
                <tr><th>รายการ</th><th style={{ width: 120, textAlign: 'center' }}>จำนวน</th><th className="amount">รวม</th></tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}><td>{l.name}</td><td style={{ textAlign: 'center' }}>{l.qty}</td><td className="amount">{formatCurrency(l.price)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="summary thai-text">
              <div className="summary-row"><span>รวมเงิน:</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>ยอดรวมทั้งสิ้น:</span><span>{formatCurrency(total)}</span></div>
              <div className="summary-row"><span>วิธีชำระเงิน:</span><span>{payLabel}</span></div>
            </div>
          </div>
          <div className="note thai-text">
            <div>*** ขอบคุณที่ใช้บริการ ***</div>
            <div style={{ marginTop: 6 }}>สินค้าที่ขายแล้วไม่สามารถคืนหรือเปลี่ยนได้ กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน</div>
            <div>หากมีปัญหาโปรดติดต่อร้านภายใน 7 วัน</div>
          </div>
          <div className="footer thai-text">พิมพ์เมื่อ: {printedAt} | System: POS</div>
        </div>
      </div>
      <div className="no-print" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button variant="outline" onClick={() => navigate(-1)}>ปิด</Button>
        <Button className="btn-gradient" onClick={doPrint}>พิมพ์ใบเสร็จ</Button>
      </div>
    </div>
  );
}


