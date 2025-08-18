import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRepairStore } from '@/stores/useRepairStore';
import { formatDate, formatDateOnly } from '@/lib/utils';

export function PrintJobPage() {
  const { id } = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);
  const { getJobById, getCustomerById, settings } = useRepairStore();
  
  const job = id ? getJobById(id) : null;
  const customer = job ? getCustomerById(job.customerId) : null;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ใบแจ้งซ่อม-${job?.id}`,
  });

  // Auto print when component mounts
  useEffect(() => {
    if (job && customer) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [job, customer, handlePrint]);

  if (!job || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">ไม่พบงานซ่อม</h1>
          <p className="text-muted-foreground">งานซ่อมที่ระบุอาจถูกลบหรือไม่มีอยู่</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    return job.total || (job.estimateParts + job.estimateLabor);
  };

  const calculateBalance = () => {
    return calculateTotal() - job.deposit;
  };

  const warrantyEndDate = new Date(job.receivedAt);
  warrantyEndDate.setDate(warrantyEndDate.getDate() + job.warrantyDays);

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button */}
      <div className="fixed top-4 right-4 z-10 print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          พิมพ์
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="max-w-4xl mx-auto p-8" style={{ fontFamily: 'Sarabun, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{settings?.storeName || 'Mobile Repair Pro'}</h1>
          {settings?.address && <p className="text-sm">{settings.address}</p>}
          {settings?.phone && <p className="text-sm">โทร: {settings.phone}</p>}
          {settings?.line && <p className="text-sm">Line: {settings.line}</p>}
          <div className="mt-4 border-b-2 border-black pb-2">
            <h2 className="text-xl font-bold">ใบแจ้งซ่อม / REPAIR ORDER</h2>
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p><strong>เลขที่งาน:</strong> {job.id}</p>
            <p><strong>วันที่รับ:</strong> {formatDate(job.receivedAt)}</p>
            {job.dueAt && <p><strong>วันนัดรับ:</strong> {formatDate(job.dueAt)}</p>}
            {job.technician && <p><strong>ช่างผู้รับผิดชอบ:</strong> {job.technician}</p>}
          </div>
          <div>
            <p><strong>รับประกัน:</strong> {job.warrantyDays} วัน</p>
            <p><strong>หมดประกัน:</strong> {formatDateOnly(warrantyEndDate)}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">ข้อมูลลูกค้า</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>ชื่อลูกค้า:</strong> {customer.name}</p>
              <p><strong>โทรศัพท์:</strong> {customer.phone}</p>
              {customer.lineId && <p><strong>Line ID:</strong> {customer.lineId}</p>}
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">ข้อมูลอุปกรณ์</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>ยี่ห้อ/รุ่น:</strong> {job.brand} {job.model}</p>
              {job.color && <p><strong>สี:</strong> {job.color}</p>}
              {job.imei && <p><strong>IMEI:</strong> {job.imei}</p>}
              {job.serial && <p><strong>Serial:</strong> {job.serial}</p>}
            </div>
            <div>
              <p><strong>รหัสล็อกหน้าจอ:</strong> {
                job.lockType === 'none' ? 'ไม่มี' :
                job.lockType === 'pin' ? 'PIN' : 'Pattern'
              }</p>
              {job.lockNote && <p><strong>รหัส/หมายเหตุ:</strong> {job.lockNote}</p>}
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">รายละเอียดงาน</h3>
          <p><strong>อาการเสีย/ปัญหา:</strong></p>
          <div className="border border-gray-300 p-3 min-h-[60px] mt-1">
            {job.issueDesc}
          </div>
          
          {job.accessories && (
            <>
              <p className="mt-3"><strong>อุปกรณ์ที่ฝากมาด้วย:</strong></p>
              <div className="border border-gray-300 p-3 min-h-[40px] mt-1">
                {job.accessories}
              </div>
            </>
          )}
          
          {job.preCheck && (
            <>
              <p className="mt-3"><strong>การตรวจเช็คเบื้องต้น:</strong></p>
              <div className="border border-gray-300 p-3 min-h-[40px] mt-1">
                {job.preCheck}
              </div>
            </>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">ค่าใช้จ่าย</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">รายการ</th>
                <th className="border border-gray-300 p-2 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">ค่าอะไหล่</td>
                <td className="border border-gray-300 p-2 text-right">฿{job.estimateParts.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">ค่าแรง</td>
                <td className="border border-gray-300 p-2 text-right">฿{job.estimateLabor.toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 p-2">รวมทั้งสิ้น</td>
                <td className="border border-gray-300 p-2 text-right">฿{calculateTotal().toLocaleString()}</td>
              </tr>
              {job.deposit > 0 && (
                <>
                  <tr>
                    <td className="border border-gray-300 p-2">มัดจำ</td>
                    <td className="border border-gray-300 p-2 text-right">฿{job.deposit.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-yellow-100 font-bold">
                    <td className="border border-gray-300 p-2">คงเหลือ</td>
                    <td className="border border-gray-300 p-2 text-right">฿{calculateBalance().toLocaleString()}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment QR */}
        {settings?.promptPayId && (
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold mb-2">ชำระเงินผ่าน PromptPay</h3>
            <div className="flex justify-center">
              <div className="border border-gray-300 p-4">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  QR Code
                </div>
                <p className="text-sm mt-2">{settings.promptPayId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">เงื่อนไขการให้บริการ</h3>
          <div className="text-sm space-y-1">
            <p>• รับประกันการซ่อม {job.warrantyDays} วัน นับจากวันที่รับเครื่องคืน</p>
            <p>• การรับประกันครอบคลุมเฉพาะงานที่ซ่อมเท่านั้น</p>
            <p>• กรุณานำใบแจ้งซ่อมมาด้วยทุกครั้งที่มารับเครื่อง</p>
            <p>• ไม่รับผิดชอบข้อมูลที่สูญหายในเครื่อง</p>
            <p>• หากไม่มารับเครื่องภายใน 30 วัน ทางร้านจะไม่รับผิดชอบ</p>
          </div>
        </div>

        {/* PDPA Notice */}
        {job.pdpaConsentAt && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">การให้ความยินยอม PDPA</h3>
            <div className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <span>☑</span>
                <p>ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการให้บริการซ่อมแซม</p>
              </div>
              <div className="flex items-start gap-2">
                <span>☑</span>
                <p>ข้าพเจ้ายินยอมให้ติดต่อสื่อสารผ่านช่องทางที่ระบุไว้เพื่อแจ้งสถานะงานซ่อม</p>
              </div>
              <div className="flex items-start gap-2">
                <span>☑</span>
                <p>ข้าพเจ้าทราบและเข้าใจสิทธิของตนในฐานะเจ้าของข้อมูลส่วนบุคคล</p>
              </div>
              <div className="flex items-start gap-2">
                <span>☑</span>
                <p>ข้าพเจ้ายืนยันว่าข้อมูลข้างต้นถูกต้อง และยินยอมให้ดำเนินการตามที่ระบุไว้</p>
              </div>
              <p className="mt-2 text-xs">ลงความยินยอมเมื่อ: {formatDate(job.pdpaConsentAt)}</p>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b border-gray-400 pb-16 mb-2"></div>
            <p>ลายเซ็นลูกค้า</p>
            <p className="text-sm">({customer.name})</p>
            <p className="text-sm">วันที่: {formatDateOnly(job.receivedAt)}</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 pb-16 mb-2"></div>
            <p>ลายเซ็นพนักงาน</p>
            <p className="text-sm">({job.technician || 'พนักงาน'})</p>
            <p className="text-sm">วันที่: {formatDateOnly(job.receivedAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>ใบแจ้งซ่อมนี้พิมพ์จากระบบ {settings?.storeName || 'Mobile Repair Pro'}</p>
          <p>ตรวจสอบสถานะงานได้ที่: {window.location.origin}/warranty/{job.id}</p>
        </div>
      </div>
    </div>
  );
}