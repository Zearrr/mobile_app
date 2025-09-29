import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { Package, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PartForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createPart, updatePart, getPartById } = useRepairStore();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    forBrand: '',
    forModel: '',
    unit: 'ชิ้น',
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 0,
    description: '',
    imageUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageTab, setImageTab] = useState<'upload' | 'camera' | 'url'>('upload');

  // If edit mode, preload values
  useEffect(() => {
    if (!id) return;
    const p = getPartById(id);
    if (p) {
      setFormData({
        sku: p.sku || '',
        name: p.name || '',
        forBrand: p.forBrand || '',
        forModel: p.forModel || '',
        unit: p.unit || 'ชิ้น',
        cost: p.cost || 0,
        price: p.price || 0,
        stock: p.stock || 0,
        minStock: p.minStock || 0,
        description: (p as any).description || '',
        imageUrl: (p as any).imageUrl || ''
      });
      setImagePreview((p as any).imageUrl || '');
    }
  }, [id, getPartById]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (id) {
        await updatePart(id, formData);
      } else {
        await createPart(formData as any);
      }
      navigate('/parts');
    } catch (error) {
      console.error('Save part failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImagePreview(url);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader 
          title={id ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่ใหม่'} 
          description={id ? 'แก้ไขข้อมูลอะไหล่' : 'เพิ่มอะไหล่หรือสินค้าใหม่เข้าสต็อก'} 
          showActions={false} 
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ข้อมูลพื้นฐาน */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="thai-text flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ข้อมูลพื้นฐาน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sku" className="thai-text">รหัสสินค้า (SKU)</Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="เช่น LCD-IPHONE12-001" className="thai-text" />
                </div>

                <div>
                  <Label htmlFor="name" className="thai-text">ชื่อสินค้า *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="เช่น จอ LCD iPhone 12" className="thai-text" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="thai-text">ยี่ห้อ</Label>
                    <Input value={formData.forBrand} onChange={(e) => handleChange('forBrand', e.target.value)} placeholder="เช่น Apple, Samsung" className="thai-text" />
                  </div>
                  <div>
                    <Label className="thai-text">รุ่น</Label>
                    <Input value={formData.forModel} onChange={(e) => handleChange('forModel', e.target.value)} placeholder="เช่น iPhone 12, Galaxy S21" className="thai-text" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="thai-text">หน่วย</Label>
                    <Select value={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหน่วย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                        <SelectItem value="กล่อง">กล่อง</SelectItem>
                        <SelectItem value="ชุด">ชุด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="thai-text">สต็อกขั้นต่ำ</Label>
                    <Input type="number" value={formData.minStock} onChange={(e) => handleChange('minStock', parseInt(e.target.value || '0', 10))} />
                  </div>
                </div>

                <div>
                  <Label className="thai-text">รายละเอียด</Label>
                  <Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="thai-text" rows={4} />
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลสต็อกและราคา + รูปภาพ */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="thai-text">ข้อมูลสต็อกและราคา</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="thai-text">ต้นทุน (บาท) *</Label>
                    <Input type="number" value={formData.cost} onChange={(e) => handleChange('cost', parseFloat(e.target.value || '0'))} required />
                  </div>
                  <div>
                    <Label className="thai-text">ราคาขาย (บาท) *</Label>
                    <Input type="number" value={formData.price} onChange={(e) => handleChange('price', parseFloat(e.target.value || '0'))} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="thai-text">จำนวนในสต็อก *</Label>
                    <Input type="number" value={formData.stock} onChange={(e) => handleChange('stock', parseInt(e.target.value || '0', 10))} required />
                  </div>
                </div>

                <div>
                  <Label className="thai-text">รูปภาพสินค้า</Label>
                  <Tabs value={imageTab} onValueChange={(v: any) => setImageTab(v)}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="upload">อัปโหลดไฟล์</TabsTrigger>
                      <TabsTrigger value="camera">ถ่ายภาพ</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-3 space-y-2">
                      <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0])} />
                      {imagePreview && <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-md border" />}
                    </TabsContent>
                    <TabsContent value="url" className="mt-3 space-y-2">
                      <Input placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} />
                      {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-40 h-40 object-cover rounded-md border" />}
                    </TabsContent>
                    <TabsContent value="camera" className="mt-3 text-sm text-muted-foreground">กล้องยังไม่ได้เชื่อมต่อ</TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/parts')} className="btn-outline">ยกเลิก</Button>
            <Button type="submit" disabled={isSubmitting} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'กำลังบันทึก...' : (id ? 'บันทึกการแก้ไข' : 'บันทึกอะไหล่')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


