import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ChevronRight, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data for pricing
const brands = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'Vivo', 'OnePlus'];

const models: Record<string, string[]> = {
  'Apple': ['iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12'],
  'Samsung': ['Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22', 'Galaxy Note 20 Ultra'],
  'Huawei': ['P50 Pro', 'P50', 'Mate 40 Pro', 'Mate 40', 'Nova 9', 'Nova 8'],
  'Xiaomi': ['Mi 13 Pro', 'Mi 13', 'Mi 12 Pro', 'Mi 12', 'Redmi Note 12 Pro', 'Redmi Note 12'],
  'Oppo': ['Find X5 Pro', 'Find X5', 'Reno 8 Pro', 'Reno 8', 'A96', 'A76'],
  'Vivo': ['X80 Pro', 'X80', 'V25 Pro', 'V25', 'Y35', 'Y22'],
  'OnePlus': ['10 Pro', '10T', '9 Pro', '9', 'Nord 2T', 'Nord CE 2']
};

const repairTypes = [
  { id: 'screen', name: 'เปลี่ยนหน้าจอ', partsCost: 2500, laborCost: 500 },
  { id: 'battery', name: 'เปลี่ยนแบตเตอรี่', partsCost: 800, laborCost: 300 },
  { id: 'camera_back', name: 'ซ่อมกล้องหลัง', partsCost: 1200, laborCost: 400 },
  { id: 'camera_front', name: 'ซ่อมกล้องหน้า', partsCost: 800, laborCost: 300 },
  { id: 'speaker', name: 'ซ่อมลำโพง', partsCost: 400, laborCost: 200 },
  { id: 'microphone', name: 'ซ่อมไมโครโฟน', partsCost: 300, laborCost: 200 },
  { id: 'charging_port', name: 'ซ่อมช่องชาร์จ', partsCost: 600, laborCost: 300 },
  { id: 'home_button', name: 'ซ่อมปุ่ม Home', partsCost: 500, laborCost: 250 },
  { id: 'volume_button', name: 'ซ่อมปุ่มเสียง', partsCost: 300, laborCost: 200 },
  { id: 'power_button', name: 'ซ่อมปุ่มเพาเวอร์', partsCost: 350, laborCost: 200 },
  { id: 'face_id', name: 'ซ่อม Face ID', partsCost: 1500, laborCost: 600 },
  { id: 'touch_id', name: 'ซ่อม Touch ID', partsCost: 800, laborCost: 400 },
  { id: 'water_damage', name: 'ซ่อมน้ำเข้า', partsCost: 0, laborCost: 800 },
  { id: 'board_repair', name: 'ซ่อมบอร์ด', partsCost: 1000, laborCost: 1200 },
];

export function PricingPage() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);

  const handleRepairToggle = (repairId: string) => {
    setSelectedRepairs(prev => 
      prev.includes(repairId) 
        ? prev.filter(id => id !== repairId)
        : [...prev, repairId]
    );
  };

  const calculateTotals = () => {
    const selectedRepairData = repairTypes.filter(repair => selectedRepairs.includes(repair.id));
    
    const totalPartsCost = selectedRepairData.reduce((sum, repair) => sum + repair.partsCost, 0);
    const totalLaborCost = selectedRepairData.reduce((sum, repair) => sum + repair.laborCost, 0);
    const totalCost = totalPartsCost + totalLaborCost;
    
    // Assume 30% markup for profit
    const estimatedCost = totalCost * 0.7; // Reverse calculation for display
    const profit = totalCost - estimatedCost;
    const profitPercent = estimatedCost > 0 ? (profit / estimatedCost) * 100 : 0;
    
    return {
      partsCost: totalPartsCost,
      laborCost: totalLaborCost,
      totalCost,
      estimatedCost,
      profit,
      profitPercent
    };
  };

  const totals = calculateTotals();

  const handleUseInRepair = () => {
    if (selectedRepairs.length === 0) {
      alert('กรุณาเลือกงานซ่อมอย่างน้อย 1 รายการ');
      return;
    }

    const params = new URLSearchParams({
      brand: selectedBrand,
      model: selectedModel,
      partsCost: totals.partsCost.toString(),
      laborCost: totals.laborCost.toString()
    });

    navigate(`/jobs/new?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">ตั้งราคาซ่อม</h1>
        <p className="text-muted-foreground mt-1">เลือกยี่ห้อ รุ่น และงานซ่อม เพื่อคำนวณราคาอัตโนมัติ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand & Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                เลือกอุปกรณ์
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ยี่ห้อ</label>
                <Select value={selectedBrand} onValueChange={(value) => {
                  setSelectedBrand(value);
                  setSelectedModel(''); // Reset model when brand changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกยี่ห้อ" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">รุ่น</label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={!selectedBrand}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกรุ่น" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBrand && models[selectedBrand]?.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Repair Types Selection */}
          <Card>
            <CardHeader>
              <CardTitle>เลือกงานซ่อม</CardTitle>
              <p className="text-sm text-muted-foreground">
                เลือกงานซ่อมที่ต้องการทำ (สามารถเลือกได้หลายรายการ)
              </p>
            </CardHeader>
            <CardContent>
              {!selectedBrand || !selectedModel ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>กรุณาเลือกยี่ห้อและรุ่นก่อน</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {repairTypes.map(repair => (
                    <div
                      key={repair.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRepairs.includes(repair.id)
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleRepairToggle(repair.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedRepairs.includes(repair.id)}
                          onChange={() => handleRepairToggle(repair.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{repair.name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            <div>อะไหล่: ฿{repair.partsCost.toLocaleString()}</div>
                            <div>ค่าแรง: ฿{repair.laborCost.toLocaleString()}</div>
                          </div>
                          <div className="text-sm font-medium mt-1">
                            รวม: ฿{(repair.partsCost + repair.laborCost).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Selected Device */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">อุปกรณ์ที่เลือก</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBrand && selectedModel ? (
                <div>
                  <div className="font-medium">{selectedBrand} {selectedModel}</div>
                  <Badge variant="secondary" className="mt-2">
                    {selectedRepairs.length} งานซ่อม
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">ยังไม่ได้เลือกอุปกรณ์</p>
              )}
            </CardContent>
          </Card>

          {/* Selected Repairs */}
          {selectedRepairs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">งานซ่อมที่เลือก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {repairTypes
                    .filter(repair => selectedRepairs.includes(repair.id))
                    .map(repair => (
                      <div key={repair.id} className="flex justify-between items-center text-sm">
                        <span>{repair.name}</span>
                        <span className="font-medium">
                          ฿{(repair.partsCost + repair.laborCost).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Summary */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg text-primary">สรุปราคา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>ค่าอะไหล่รวม</span>
                <span className="font-medium">฿{totals.partsCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span>ค่าแรงรวม</span>
                <span className="font-medium">฿{totals.laborCost.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span>ต้นทุนประมาณ</span>
                <span className="font-medium text-orange-600">
                  ฿{totals.estimatedCost.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>กำไรประมาณ</span>
                <span className="font-medium text-green-600">
                  ฿{totals.profit.toLocaleString()} ({totals.profitPercent.toFixed(1)}%)
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>ราคารวมสุทธิ</span>
                <span className="text-primary">฿{totals.totalCost.toLocaleString()}</span>
              </div>
              
              <Button 
                className="w-full mt-4 gap-2" 
                onClick={handleUseInRepair}
                disabled={selectedRepairs.length === 0}
              >
                <ArrowRight className="w-4 h-4" />
                ใช้ราคานี้ไปแจ้งซ่อม
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การกระทำด่วน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มงานซ่อมกำหนดเอง
              </Button>
              
              <Button variant="outline" className="w-full">
                บันทึกเป็นเทมเพลต
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}