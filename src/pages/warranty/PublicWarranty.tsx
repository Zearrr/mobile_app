import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/database';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function maskImei(imei?: string): string {
  if (!imei) return '-';
  if (imei.length <= 6) return imei.replace(/.(?=.{2})/g, '*');
  const start = imei.slice(0, 4);
  const end = imei.slice(-4);
  return `${start}${'*'.repeat(imei.length - 8)}${end}`;
}

export default function PublicWarranty() {
  const { jobId } = useParams();
  const [job, setJob] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const j = await db.jobs.get(jobId!);
      const s = await db.settings.get('default');
      setJob(j);
      setSettings(s);
    })();
  }, [jobId]);

  if (!job) return <div className="p-6 thai-text">กำลังโหลดข้อมูลการรับประกัน…</div>;

  const receivedAt = job.receivedAt ? new Date(job.receivedAt) : new Date();
  const expire = new Date(receivedAt);
  expire.setDate(expire.getDate() + (job.warrantyDays || 0));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">สถานะการรับประกัน</CardTitle>
        </CardHeader>
        <CardContent className="thai-text">
          <div className="text-xl font-bold">{settings?.storeName || 'ร้านซ่อมมือถือ'}</div>
          <div className="text-sm text-muted-foreground">{settings?.address || ''} • {settings?.phone || ''}</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">ใบงาน {job.id}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 thai-text">
          <div>
            <div>ยี่ห้อ/รุ่น: <b>{job.brand} {job.model}</b></div>
            <div>IMEI: <b>{maskImei(job.imei)}</b></div>
            <div>เลขที่ซ่อม: <b>{job.id}</b></div>
          </div>
          <div>
            <div>วันที่รับ: {format(receivedAt, 'dd/MM/yyyy')}</div>
            <div>สถานะปัจจุบัน: <b>{job.status}</b></div>
            <div>หมดประกัน: <b>{format(expire, 'dd/MM/yyyy')}</b> ({job.warrantyDays} วัน)</div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="thai-text">เงื่อนไขรับประกัน (ย่อ)</CardTitle>
        </CardHeader>
        <CardContent className="thai-text text-sm text-muted-foreground space-y-1">
                          <div>1) รับประกันเฉพาะอาการเดิมและสินค้าที่เปลี่ยน</div>
          <div>2) ไม่ครอบคลุมความเสียหายจากการตกน้ำ/ตกกระแทก/ดัดแปลง</div>
          <div>3) ต้องมีใบงานหรือหลักฐานยืนยันการซ่อม</div>
          <div>4) โปรดสำรองข้อมูลก่อนส่งซ่อม ร้านไม่รับผิดชอบข้อมูลสูญหาย</div>
        </CardContent>
      </Card>
    </div>
  );
}


