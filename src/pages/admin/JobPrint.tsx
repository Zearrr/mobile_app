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
  // Use new API with contentRef to avoid "There is nothing to print" warnings
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `job-${id}` } as any);

  const warrantyUrl = `${location.origin}/warranty/${id}`;

  // Auto-open system print dialog once the content and job are ready
  const [didAutoPrint, setDidAutoPrint] = useState(false);
  useEffect(() => {
    if (!didAutoPrint && job && printRef.current) {
      const timer = setTimeout(() => {
        try { (handlePrint as any)?.(); } catch {}
        setDidAutoPrint(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [didAutoPrint, job, handlePrint]);

  if (!job) return <div className="p-6">ไม่พบงาน</div>;

  const formatDateSafe = (value: any) => {
    if (!value) return '-';
    try {
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd/MM/yyyy HH:mm');
    } catch {
      return '-';
    }
  };

  const Copy = () => (
    <div className="copy-root box outer-box">
      {/* Header */}
      <div className="box" style={{ textAlign: 'center', position: 'relative' }}>
        <img src="/KODPHONELOGO.png" alt="logo" style={{ height: 46, objectFit: 'contain', display: 'inline-block' }} />
        <div className="heading" style={{ marginTop: 4 }}>{settings?.storeName || 'KODPHONE กฎโฟน'}</div>
        <div className="muted" style={{ fontSize: 10 }}>{settings?.address || 'ระบบซ่อมมือถือ'}</div>
        <div className="muted" style={{ fontSize: 10 }}>โทร: {settings?.phone || '061-4261817'} | -</div>
        <div style={{ position: 'absolute', right: -6, top: 6, textAlign: 'center' }}>
            <QRImage text={warrantyUrl} size={80} />
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8', lineHeight: 1.05, marginTop: 2 }}>สแกน QR Code</div>
            <div className="muted" style={{ fontSize: 9, lineHeight: 1.05 }}>เพื่อติดตามสถานะ<br/>การซ่อม</div>
        </div>
      </div>

      <div className="section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
        <div style={{ textAlign: 'center', gridColumn: '1 / -1', margin: '0 auto', width: '80%' }}>
          <div style={{ height: 1, background: '#E5E7EB', margin: '4px 0 8px' }} />
          <div className="heading" style={{ fontSize: 18 }}>ใบแจ้งซ่อม</div>
          <div style={{ marginTop: 4 }}>เลขที่ใบแจ้งซ่อม: <b>R{String(job.id).padStart(5, '0')}</b></div>
          <div style={{ marginTop: 2 }}>วันที่รับงาน: {formatDateSafe(job.receivedAt)}</div>
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
      <div className="section">
        <div className="box">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div>
              <div className="heading">อาการเสีย/รายละเอียด</div>
              <div>{job.issueDesc}</div>
              <div className="muted">อุปกรณ์ที่ฝาก: {job.accessories || '-'}</div>
              <div className="muted">ตรวจเช็คเบื้องต้น: {job.preCheck || '-'}</div>
            </div>
            <div>
              <div className="heading">สรุปค่าใช้จ่าย</div>
              <div>สินค้า: {formatCurrency(job.feeParts || 0)}</div>
              <div>รวมสุทธิ: <b>{formatCurrency(job.total)}</b></div>
              <div>มัดจำ: {formatCurrency(totalPaid)}</div>
              <div>ค้างชำระ: <b>{formatCurrency(balance)}</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Box */}
      <div className="section paybox">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <QRImage text={settings?.promptPayId || job.id} size={96} />
          <div>
            <div style={{ fontWeight: 700, color: '#1D4ED8' }}>QR Code ชำระเงิน</div>
            <div className="muted">ยอดที่ต้องชำระ: <b>{formatCurrency(balance <= 0 ? job.total : balance)}</b></div>
            <div className="muted">สแกน QR Code เพื่อชำระเงินผ่านแอปธนาคารหรือ Mobile Banking ที่รองรับการชำระเงิน</div>
          </div>
        </div>
      </div>

      {/* Terms & PDPA side-by-side */}
      <div className="section grid">
        <div className="box">
          <div className="heading" style={{ color: '#111827' }}>เงื่อนไขการซ่อม</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{settings?.termsText || `สำคัญ: ทางร้านไม่รับผิดชอบต่อการอื่น นอกเหนือจากการที่แจ้งซ่อม\nอะไหล่: หากเปลี่ยนอะไหล่ จะได้รับอะไหล่เก่าคืน ยกเว้นชิ้นส่วนที่บดทับ\nประกัน: รับประกันตามที่ตกลงภายหลังซ่อมเสร็จ (ยกเว้นตกน้ำ ตกหล่น หรือใช้งานผิดปกติ)\nรับเครื่อง: ไม่มารับเครื่องภายใน 30 วันหลังซ่อมเสร็จ ร้านขอสงวนสิทธิ์จัดการตามเหมาะสม`}</div>
        </div>
        <div className="box" style={{ background: '#FEF3C7', borderColor: '#F59E0B' }}>
          <div className="heading" style={{ color: '#DC2626' }}>การคุ้มครองข้อมูลส่วนบุคคล (PDPA)</div>
          <div style={{ fontSize: 12 }}>
            <div><b>การเก็บข้อมูล:</b> ทางร้านเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน ได้แก่ ชื่อ-นามสกุล เบอร์โทรศัพท์ ข้อมูลอุปกรณ์ (IMEI, ยี่ห้อ, รุ่น, รหัสหน้าจอ) เพื่อวัตถุประสงค์ในการให้บริการซ่อมและติดต่องาน</div>
            <div><b>ระยะเวลา:</b> ข้อมูลจะถูกเก็บไว้ไม่เกินระยะเวลา 3 ปี หรือจนกว่าท่านจะขอให้ลบข้อมูล</div>
            <div><b>สิทธิของท่าน:</b> ท่านมีสิทธิในการเข้าถึง แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคล โดยติดต่อทางร้าน</div>
            <div><b>การยินยอม:</b> การลงชื่อในใบแจ้งซ่อมนี้ ถือเป็นการให้ความยินยอมในการเก็บและใช้ข้อมูลตาม PDPA</div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div className="box" style={{ height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div className="muted">ลงชื่อ................................. (ลูกค้า)</div>
          <div style={{ marginTop: 6, color: '#DC2626', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, border: '1px solid #DC2626', display: 'inline-block' }} />
            ยืนยันการยินยอมตาม PDPA
          </div>
        </div>
        <div className="box" style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="muted">ลงชื่อ................................. (พนักงาน)</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-3">

      <div ref={printRef} className="print-page">
        <style>{`
          @page { size: A4 landscape; margin: 6mm; }
          @media print {
            .print-hidden { display: none !important; }
            .print-page { font-family: 'Sarabun', system-ui, sans-serif; font-size: 10px; }
            .break { page-break-after: always; }
          }
          .heading { font-weight: 700; font-size: 14px; }
          .section { margin-top: 6px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
          .box { border: none; border-radius: 6px; padding: 6px; }
          .muted { color: #6b7280; }
          .sheet { display: grid; grid-template-columns: 1fr 1px 1fr; column-gap: 10px; }
          .divider { background: repeating-linear-gradient( to bottom, #ccc 0, #ccc 4px, transparent 4px, transparent 8px ); }
          .copy-root { display: block; }
          .qrbox { border: 2px dashed #3B82F6; border-radius: 8px; padding: 8px; }
          .paybox { border: 2px dashed #3B82F6; border-radius: 8px; padding: 10px; }
          .outer-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
        `}</style>

        {/* Two-up copies on A4 landscape */}
        <div className="sheet">
          <Copy />
          <div className="divider"></div>
          <Copy />
        </div>
      </div>

      {/* Bottom actions (not fixed) */}
      <div className="print:hidden w-full py-6 flex items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>กลับไปยังรายการซ่อม</Button>
        <Button onClick={handlePrint} className="btn-gradient">พิมพ์ใบแจ้งซ่อม</Button>
      </div>
    </div>
  );
}


