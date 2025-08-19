import { Button } from '@/components/ui/button';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export default function WarrantyPrint() {
  const { id } = useParams();
  const { jobs, getJobById, settings, loadAllData } = useRepairStore();
  useEffect(() => { if (jobs.length === 0) loadAllData(); }, []);
  const job = getJobById(id!);
  const printRef = useRef<HTMLDivElement>(null);
  const doPrint = useReactToPrint({ content: () => printRef.current, documentTitle: `warranty-${id}` });
  if (!job) return <div className="p-6">ไม่พบงาน</div>;

  const expire = job.receivedAt ? new Date(job.receivedAt) : new Date();
  expire.setDate(expire.getDate() + (job.warrantyDays || 0));

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
          .card { border: 1px dashed #999; border-radius: 8px; padding: 12px; }
        `}</style>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700 }}>{settings?.storeName || 'บัตรรับประกัน'}</div>
            <div>รหัสงาน: {job.id}</div>
          </div>
          <div>ลูกค้า: {job.customerId}</div>
          <div>อุปกรณ์: {job.brand} {job.model}</div>
          <div>วันที่รับประกัน: {format(job.receivedAt, 'dd/MM/yyyy')} - {format(expire, 'dd/MM/yyyy')} ({job.warrantyDays} วัน)</div>
          <div>เงื่อนไข: งานรับประกันครอบคลุมเฉพาะอะไหล่และอาการเดิม ไม่รวมความเสียหายจากการใช้งานผิดปกติ</div>
          <div style={{ marginTop: 24, display: 'flex', gap: 40 }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 60, borderBottom: '1px dashed #999' }} />
              <div style={{ textAlign: 'center' }}>ลูกค้า</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 60, borderBottom: '1px dashed #999' }} />
              <div style={{ textAlign: 'center' }}>พนักงาน</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


