import { Button } from '@/components/ui/button';
import { useRepairStore } from '@/stores/useRepairStore';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export default function WarrantyPrint() {
  const { id } = useParams();
  const { jobs, getJobById, settings, loadAllData, getCustomerById } = useRepairStore();
  useEffect(() => { if (jobs.length === 0) loadAllData(); }, []);
  const job = getJobById(id!);
  const printRef = useRef<HTMLDivElement>(null);
  const doPrint = useReactToPrint({ 
    contentRef: printRef, 
    documentTitle: `claim-${id}` 
  });
  
  if (!job) return <div className="p-6">ไม่พบงาน</div>;

  const customer = getCustomerById(job.customerId);

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 print:hidden">
        <Button onClick={doPrint} className="btn-gradient">พิมพ์</Button>
      </div>
      <div ref={printRef} className="print-page">
        <style>{`
          @page { 
            size: A4; 
            margin: 15mm; 
          }
          @media print { 
            .print-page { 
              font-family: 'Sarabun', system-ui, sans-serif; 
              font-size: 12px; 
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
            } 
          }
          .card { 
            border: 1px solid #333; 
            border-radius: 8px; 
            padding: 18px; 
            width: 180mm;
            min-height: 267mm;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .header-section { 
            text-align: center; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 12px;
          }
          .logo-icon { 
            font-size: 22px; 
            margin-bottom: 8px;
          }
          .system-title { 
            font-size: 17px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .service-title { 
            font-size: 15px; 
            margin-bottom: 5px;
          }
          .phone-number { 
            font-size: 13px; 
            color: #666;
          }
          .claim-title { 
            color: #dc2626; 
            font-size: 26px; 
            font-weight: bold; 
            text-align: center; 
            margin: 15px 0;
          }
          .claim-info { 
            margin-bottom: 15px;
          }
          .claim-row { 
            margin: 5px 0; 
            font-size: 13px;
          }
          .section-title { 
            font-weight: bold; 
            font-size: 15px; 
            margin: 12px 0 6px 0; 
            color: #1f2937;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-row { 
            display: flex; 
            margin: 5px 0; 
            font-size: 13px;
          }
          .info-label { 
            font-weight: 500; 
            min-width: 130px; 
            color: #374151;
          }
          .info-value { 
            margin-left: 8px; 
            color: #111827;
          }
          .highlight-yellow { 
            background-color: #fef3c7; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0; 
            border-left: 3px solid #f59e0b;
          }
          .highlight-green { 
            background-color: #d1fae5; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0; 
            border-left: 3px solid #10b981;
          }
          .signature-section { 
            display: flex; 
            gap: 60px; 
            margin-top: 20px; 
            margin-bottom: 15px;
          }
          .signature-line { 
            flex: 1; 
            text-align: center;
          }
          .signature-dotted { 
            height: 50px; 
            border-bottom: 2px dotted #999; 
            margin-bottom: 8px; 
          }
          .signature-text { 
            text-align: center; 
            font-size: 13px; 
            color: #666;
          }
          .conditions { 
            background-color: #f9fafb; 
            padding: 12px; 
            border-radius: 6px; 
            margin: 15px 0; 
            border: 1px solid #e5e7eb;
          }
          .action-button { 
            background-color: #dc2626; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 6px; 
            border: none; 
            font-weight: bold; 
            margin-top: 15px; 
            cursor: pointer; 
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
        `}</style>
        
        <div className="card">
          {/* Header Section */}
          <div className="header-section">
            <div className="logo-icon">🔧📱</div>
            <div className="system-title">ระบบซ่อมมือถือครบวงจร</div>
            <div className="service-title">ซ่อมมือถือครบวงจร</div>
            <div className="phone-number">โทร: 088-888-9999</div>
          </div>

          {/* Claim Title */}
          <div className="claim-title">ใบแจ้งเครม</div>

          {/* Claim Identification */}
          <div className="claim-info">
            <div className="claim-row">เลขที่เครม: {String(job.id).replace(/^R?/, '')}</div>
            <div className="claim-row">วันที่แจ้งเครม: {format(job.completedAt || job.receivedAt || new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>

          {/* Customer Information */}
          <div className="section-title">ข้อมูลลูกค้า</div>
          <div className="info-row">
            <span className="info-label">ชื่อ-นามสกุล:</span>
            <span className="info-value">{customer?.name || 'Test'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">เบอร์โทร:</span>
            <span className="info-value">{customer?.phone || '085-285-4665'}</span>
          </div>

          {/* Phone Information */}
          <div className="section-title">ข้อมูลเครื่องโทรศัพท์</div>
          <div className="info-row">
            <span className="info-label">ยี่ห้อ:</span>
            <span className="info-value">{job.brand || 'Apple'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">รุ่น:</span>
            <span className="info-value">{job.model || 'iPhone 15 Pro Max'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">สี:</span>
            <span className="info-value">ดำ</span>
          </div>
          <div className="info-row">
            <span className="info-label">IMEI/Serial:</span>
            <span className="info-value">35 998454 264445 7</span>
          </div>

          {/* Original Repair Details */}
          <div className="section-title">ข้อมูลการซ่อมเดิม</div>
          <div className="info-row">
            <span className="info-label">เลขที่ซ่อม:</span>
            <span className="info-value">{job.id || 'R00025'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">วันที่ซ่อม:</span>
            <span className="info-value">{format(job.receivedAt || new Date(), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ปัญหาเดิม:</span>
            <span className="info-value">{job.preCheck || 'เปลี่ยนแบตเตอรี่'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ราคาซ่อม:</span>
            <span className="info-value">฿ {(job.total || 2400).toLocaleString()} บาท</span>
          </div>

          {/* Claim Specifics */}
          <div className="section-title">รายละเอียดเครม</div>
          <div className="info-row">
            <span className="info-label">สาเหตุเครม:</span>
            <span className="info-value">{job.issueDesc || 'แบตบวม'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ปัญหาจากการซ่อมเดิม:</span>
            <span className="info-value">{job.preCheck || 'เปลี่ยนแบตเตอรี่'}</span>
          </div>

          {/* Technician's Note */}
          <div className="section-title">หมายเหตุจากช่าง:</div>
          <div className="highlight-yellow">เริ่มดำเนินการเครม</div>

          {/* Resolution/Action */}
          <div className="section-title">การแก้ไข/ดำเนินการ</div>
          <div className="highlight-green">เปลี่ยนแบตใหม่</div>

          {/* Claim Conditions */}
          <div className="section-title">เงื่อนไขการเครม</div>
          <div className="conditions">
            <div className="info-row">
              <span className="info-label">ระยะเวลา:</span>
              <span className="info-value">การเครมต้องแจ้งภายใน 7 วันหลังรับเครื่องคืน</span>
            </div>
            <div className="info-row">
              <span className="info-label">เอกสาร:</span>
              <span className="info-value">ต้องแสดงใบเสร็จการซ่อมและใบรับประกัน</span>
            </div>
            <div className="info-row">
              <span className="info-label">ข้อจำกัด:</span>
              <span className="info-value">ไม่รับเครมกรณีความเสียหายจากการใช้งานผิดปกติ</span>
            </div>
            <div className="info-row">
              <span className="info-label">การตรวจสอบ:</span>
              <span className="info-value">ร้านขอสงวนสิทธิ์ตรวจสอบเครื่องก่อนดำเนินการ</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="signature-section">
            <div className="signature-line">
              <div className="signature-dotted"></div>
              <div className="signature-text">ลงชื่อ................................ (ลูกค้า)</div>
            </div>
            <div className="signature-line">
              <div className="signature-dotted"></div>
              <div className="signature-text">ลงชื่อ................................ (พนักงาน)</div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}


