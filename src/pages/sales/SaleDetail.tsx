import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function SaleDetail() {
  const { id } = useParams();
  const { sales, loadSales } = useRepairStore();
  const [sale, setSale] = useState<any>(null);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    if (id && sales.length > 0) {
      const foundSale = sales.find(s => s.id === id);
      setSale(foundSale);
    }
  }, [id, sales]);

  if (!sale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          <div className="text-center py-12">
            <div className="text-muted-foreground thai-text">ไม่พบรายการขาย</div>
            <Button asChild className="mt-4">
              <Link to="/sales/history">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปประวัติการขาย
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/sales/history">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold thai-text">รายละเอียดการขาย</h1>
              <div className="text-sm text-muted-foreground thai-text">
                เลขที่: {sale.id}
              </div>
            </div>
          </div>
          <Button asChild>
            <Link to={`/print/receipt/${sale.id}`}>
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์ใบเสร็จ
            </Link>
          </Button>
        </div>

        {/* Sale Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">ข้อมูลการขาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground thai-text">วันที่ขาย</div>
                <div className="thai-text">{new Date(sale.date).toLocaleDateString('th-TH')} {new Date(sale.date).toLocaleTimeString('th-TH')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground thai-text">ลูกค้า</div>
                <div className="thai-text">{sale.customer || 'ลูกค้าทั่วไป'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground thai-text">วิธีชำระเงิน</div>
                <div className="thai-text">
                  {sale.method === 'cash' ? 'เงินสด' :
                   sale.method === 'transfer' ? 'โอนเงิน' :
                   sale.method === 'card' ? 'บัตร' : sale.method}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground thai-text">พนักงานขาย</div>
                <div className="thai-text">{sale.employee || 'admin'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">รายการสินค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="thai-text">SKU</TableHead>
                  <TableHead className="thai-text">ชื่อสินค้า</TableHead>
                  <TableHead className="thai-text text-right">ราคา</TableHead>
                  <TableHead className="thai-text text-right">จำนวน</TableHead>
                  <TableHead className="thai-text text-right">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{item.sku}</TableCell>
                    <TableCell className="thai-text">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.qty * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="thai-text">สรุปยอด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="thai-text">ยอดรวม</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount && sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="thai-text">ส่วนลด</span>
                  <span className="text-red-600">-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              {sale.tax && sale.tax > 0 && (
                <div className="flex justify-between">
                  <span className="thai-text">ภาษี (VAT)</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="thai-text">รวมทั้งสิ้น</span>
                <span className="text-success">{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
