import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useRepairStore } from '@/stores/useRepairStore';
import { Sale } from '@/types';
import { format } from 'date-fns';
import { Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function SalesReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sales, loadSales } = useRepairStore();
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    if (id && sales.length > 0) {
      const foundSale = sales.find(s => s.id === id);
      setSale(foundSale || null);
    }
  }, [id, sales]);

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground thai-text">ไม่พบรายการขาย</div>
          <Button onClick={() => navigate(-1)} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate(-1);
  };

  const currentDateTime = new Date();
  const printDateTime = format(currentDateTime, 'dd/MM/yyyy HH:mm:ss');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Receipt Content */}
      <div className="max-w-md mx-auto bg-white border border-gray-300 shadow-lg print:shadow-none print:border-0">
        {/* Header */}
        <div className="text-center py-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-black">ระบบซ่อมมือถือครบวงจร</h1>
          <p className="text-sm text-black mt-1">ซ่อมมือถือครบวงจร</p>
          <p className="text-sm text-black">โทรศัพท์: 088-888-9999</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-black">ใบเสร็จรับเงิน</h2>
        </div>

        {/* Transaction Details */}
        <div className="py-3 border-b border-dashed border-gray-300">
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="text-sm text-black">
              <span>เลขที่ใบเสร็จ:</span>
            </div>
            <div className="text-sm text-black font-mono">
              {sale.id}
            </div>
            <div className="text-sm text-black">
              <span>วันที่/เวลา:</span>
            </div>
            <div className="text-sm text-black">
              {format(new Date(sale.date), 'dd/MM/yyyy HH:mm:ss')}
            </div>
            <div className="text-sm text-black">
              <span>พนักงานขาย:</span>
            </div>
            <div className="text-sm text-black">
              {sale.employee || 'admin'}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="py-3 border-b border-gray-300">
          {sale.items.map((item, index) => (
            <div key={index} className="px-4 mb-3">
              <div className="text-sm font-medium text-black">{item.name}</div>
              <div className="text-xs text-black mb-2">รหัส: {item.sku}</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black">
                  {formatCurrency(item.unitPrice)} × {item.qty}
                </span>
                <span className="text-sm font-bold text-black">
                  {formatCurrency(item.unitPrice * item.qty)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="py-3 border-b border-gray-300">
          <div className="px-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-black">รวมเงิน:</span>
              <span className="text-sm font-bold text-black">{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount && sale.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-black">ส่วนลด:</span>
                <span className="text-sm text-black">{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-bold text-black">ยอดรวมทั้งสิ้น:</span>
              <span className="text-sm font-bold text-black">{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="py-3 border-b border-gray-300">
          <div className="px-4">
            <div className="flex justify-between">
              <span className="text-sm text-black">วิธีชำระเงิน:</span>
              <span className="text-sm text-black">
                {sale.method === 'cash' ? 'เงินสด' :
                 sale.method === 'transfer' ? 'โอนเงิน' :
                 sale.method === 'card' ? 'บัตร' : sale.method}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 text-center">
          <div className="text-sm font-bold text-black mb-3">
            *** ขอบคุณที่ใช้บริการ ***
          </div>
          <div className="text-xs text-black space-y-1 mb-4">
            <div>สินค้าที่ขายแล้วไม่สามารถคืนหรือเปลี่ยนได้</div>
            <div>กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน</div>
            <div>หากมีปัญหาโปรดติดต่อร้านภายใน 7 วัน</div>
          </div>
          <div className="text-xs text-black text-gray-600">
            พิมพ์เมื่อ: {printDateTime} | System: LTASoft POS v2.0
          </div>
        </div>
      </div>

      {/* Print Button - Only visible on screen */}
      <div className="max-w-md mx-auto mt-4 print:hidden">
        <div className="flex gap-2">
          <Button onClick={handleClose} variant="outline" className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600">
            <X className="w-4 h-4 mr-2" />
            ปิด
          </Button>
          <Button onClick={handlePrint} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
        </div>
      </div>
    </div>
  );
}
