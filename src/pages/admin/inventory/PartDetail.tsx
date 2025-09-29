import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepairStore } from '@/stores/useRepairStore';
import { Package } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const PartDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parts = useRepairStore(state => state.parts);

  const part = useMemo(() => parts.find(p => p.id === (id || '')), [id, parts]);

  if (!part) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="text-center py-10">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่พบอะไหล่</p>
            <Button onClick={() => navigate('/parts')} className="mt-4">
              กลับไปรายการอะไหล่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader title={`รายละเอียดสินค้า`} description={part.name} showActions={false} />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">ข้อมูลสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <img src={part.imageUrl || '/placeholder.svg'} alt={part.name} className="w-full max-w-xs rounded-lg border object-cover" />
            </div>
            <div className="md:col-span-2 space-y-2 thai-text">
              <div><span className="text-muted-foreground">SKU:</span> <span className="font-mono font-semibold">{part.sku || '-'}</span></div>
              <div><span className="text-muted-foreground">ชื่อสินค้า:</span> {part.name}</div>
              <div><span className="text-muted-foreground">ยี่ห้อ/รุ่น:</span> {part.forBrand || '-'} / {part.forModel || '-'}</div>
              <div><span className="text-muted-foreground">หน่วย:</span> {part.unit || '-'}</div>
              <div><span className="text-muted-foreground">ต้นทุน:</span> ฿{(part.cost || 0).toLocaleString()}</div>
              <div><span className="text-muted-foreground">ราคาขาย:</span> ฿{(part.price || 0).toLocaleString()}</div>
              <div><span className="text-muted-foreground">สต็อก:</span> {part.stock || 0}</div>
              <div><span className="text-muted-foreground">รายละเอียด:</span> {(part as any).description || '-'}</div>
              <div className="pt-4 flex gap-2">
                <Button asChild className="btn-primary"><Link to={`/parts/${part.id}/edit`}>แก้ไข</Link></Button>
                <Button variant="outline" asChild className="btn-outline"><Link to="/parts">กลับ</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartDetail;


