import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import QRCode from 'qrcode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

function QRImage({ text, size = 100 }: { text: string; size?: number }) {
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(text, { width: size, margin: 1 }).then((url) => {
      if (mounted) setSrc(url);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [text, size]);
  if (!text) return null;
  return <img src={src} width={size} height={size} />;
}

export default function JobPrint() {
  const { id } = useParams();
  const {
    jobs, customers, settings, payments,
    getJobById, getCustomerById, loadAllData
  } = useRepairStore();

  useEffect(() => {
    if (jobs.length === 0) loadAllData();
  }, []);

  const job = getJobById(id!);
  const customer = job ? getCustomerById(job.customerId) : undefined;
  const totalPaid = useMemo(() => payments.filter(p => p.jobId === id).reduce((s, p) => s + p.amount, 0), [payments, id]);
  const balance = (job?.total || 0) - totalPaid;

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current, documentTitle: `job-${id}` });

  const warrantyUrl = `${location.origin}/warranty/${id}`;

  if (!job) return <div className="p-6">ไม่พบงาน</div>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} className="btn-gradient">พิมพ์</Button>
        <Button variant="outline" onClick={() => window.history.back()}>กลับ</Button>
      </div>

      <div ref={printRef} className="print-page">
        <style>{`
          @page { size: auto; margin: 12mm; }
          @media print {
            .print-hidden { display: none !important; }
            .print-page { font-family: 'Sarabun', system-ui, sans-serif; font-size: 12px; }
            .break { page-break-after: always; }
          }
          .heading { font-weight: 700; font-size: 16px; }
          .section { margin-top: 8px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
          .muted { color: #6b7280; }
        `}</style>

        {/* Header */}
        <div className="grid">
          <div>
            <div className="heading">{settings?.storeName || 'ชื่อร้าน'}</div>
            <div className="muted">{settings?.address || ''}</div>
            <div className="muted">โทร: {settings?.phone || '-'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <img src="/KODPHONELOGO.png" alt="logo" style={{ height: 48, objectFit: 'cover' }} />
          </div>
        </div>

        <div className="section grid">
          <div className="box">
            <div className="heading">ใบรับซ่อม</div>
            <div>เลขที่งาน: <b>{job.id}</b></div>
            <div>วันที่รับ: {format(new Date(job.receivedAt), 'dd/MM/yyyy')}</div>
            <div>กำหนดส่ง: {job.dueAt ? format(new Date(job.dueAt), 'dd/MM/yyyy') : '-'}</div>
          </div>
          <div className="box" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {settings?.promptPayId && (
              <div style={{ textAlign: 'center' }}>
                <div className="muted">QR PromptPay</div>
                <QRImage text={settings.promptPayId} size={100} />
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div className="muted">เช็คประกัน</div>
              <QRImage text={warrantyUrl} size={100} />
            </div>
          </div>
        </div>

        {/* Customer / Device */}
        <div className="section grid">
          <div className="box">
            <div className="heading">ข้อมูลลูกค้า</div>
            <div>ชื่อลูกค้า: {customer?.name}</div>
            <div>เบอร์: {customer?.phone}</div>
            <div>โทรสำรอง: {customer?.altPhone || '-'}</div>
          </div>
          <div className="box">
            <div className="heading">ข้อมูลเครื่อง</div>
            <div>ยี่ห้อ/รุ่น: {job.brand} {job.model} {job.color || ''}</div>
            <div>IMEI: {job.imei || '-'}</div>
            <div>Serial: {job.serial || '-'}</div>
            <div>ล็อกหน้าจอ: {job.lockType !== 'none' ? (job.lockType + (job.lockNote ? ` (${job.lockNote})` : '')) : 'ไม่มี'}</div>
          </div>
        </div>

        {/* Issue / Pricing */}
        <div className="section grid">
          <div className="box">
            <div className="heading">อาการเสีย/รายละเอียด</div>
            <div>{job.issueDesc}</div>
            <div className="muted">อุปกรณ์ที่ฝาก: {job.accessories || '-'}</div>
            <div className="muted">ตรวจเช็คเบื้องต้น: {job.preCheck || '-'}</div>
          </div>
          <div className="box">
            <div className="heading">สรุปค่าใช้จ่าย</div>
                            <div>สินค้า: {formatCurrency(job.feeParts || 0)} (ต้นทุน {formatCurrency(job.costParts || 0)})</div>
            <div>ค่าแรง: {formatCurrency(job.feeLabor || 0)} (ต้นทุน {formatCurrency(job.costLabor || 0)})</div>
            <div>รวมสุทธิ: <b>{formatCurrency(job.total)}</b></div>
            <div>มัดจำ: {formatCurrency(totalPaid)}</div>
            <div>ค้างชำระ: <b>{formatCurrency(balance)}</b></div>
          </div>
        </div>

        {/* Terms & PDPA */}
        <div className="section box">
          <div className="heading">เงื่อนไขบริการ</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{settings?.termsText || '1) การรับประกัน 2) การชำระเงิน 3) การเก็บสินค้า 4) ความรับผิดชอบ'}</div>
        </div>

        <div className="section box">
          <div className="heading">PDPA</div>
          <ul style={{ marginLeft: 16 }}>
            <li>อนุญาตให้ใช้ข้อมูลเพื่อการติดต่อและแจ้งผลการซ่อม</li>
            <li>อนุญาตให้จัดเก็บข้อมูลอุปกรณ์เพื่อการรับประกัน</li>
            <li>อนุญาตให้ส่งข้อความแจ้งเตือนสถานะงาน</li>
            <li>รับทราบการเก็บรักษาข้อมูลตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="section grid">
          <div className="box" style={{ height: 120 }}>
            <div className="muted">ลายเซ็นลูกค้า</div>
          </div>
          <div className="box" style={{ height: 120 }}>
            <div className="muted">ลายเซ็นพนักงาน</div>
          </div>
        </div>
      </div>
    </div>
  );
}


