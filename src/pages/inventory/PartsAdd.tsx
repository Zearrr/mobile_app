import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { Package, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartsAdd = () => {
	const navigate = useNavigate();
	const { createPart } = useRepairStore();
	
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

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await createPart(formData);
			navigate('/parts');
		} catch (error) {
			console.error('Error adding part:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-7xl mx-auto">
				<PageHeader 
					title="เพิ่มอะไหล่ใหม่" 
					description="เพิ่มอะไหล่หรือสินค้าใหม่เข้าสต็อก" 
					showActions={false} 
				/>

				<form id="add-part-form" onSubmit={handleSubmit} className="space-y-6">
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
									<Input
										id="sku"
										value={formData.sku}
										onChange={(e) => handleChange('sku', e.target.value)}
										placeholder="เช่น LCD-IPHONE12-001"
										className="thai-text"
									/>
								</div>

								<div>
									<Label htmlFor="name" className="thai-text">ชื่อสินค้า *</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => handleChange('name', e.target.value)}
										placeholder="เช่น จอ LCD iPhone 12"
										className="thai-text"
										required
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="forBrand" className="thai-text">ยี่ห้อ</Label>
										<Input
											id="forBrand"
											value={formData.forBrand}
											onChange={(e) => handleChange('forBrand', e.target.value)}
											placeholder="เช่น Apple, Samsung"
											className="thai-text"
										/>
									</div>
									<div>
										<Label htmlFor="forModel" className="thai-text">รุ่น</Label>
										<Input
											id="forModel"
											value={formData.forModel}
											onChange={(e) => handleChange('forModel', e.target.value)}
											placeholder="เช่น iPhone 12, Galaxy S21"
											className="thai-text"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="unit" className="thai-text">หน่วย</Label>
									<Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
										<SelectTrigger>
											<SelectValue placeholder="เลือกหน่วย" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ชิ้น">ชิ้น</SelectItem>
											<SelectItem value="ชุด">ชุด</SelectItem>
											<SelectItem value="กล่อง">กล่อง</SelectItem>
											<SelectItem value="เมตร">เมตร</SelectItem>
											<SelectItem value="กิโลกรัม">กิโลกรัม</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="description" className="thai-text">รายละเอียด</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) => handleChange('description', e.target.value)}
										placeholder="รายละเอียดเพิ่มเติมของสินค้า"
										className="thai-text"
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>

						{/* ข้อมูลสต็อกและราคา */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">ข้อมูลสต็อกและราคา</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="cost" className="thai-text">ต้นทุน (บาท) *</Label>
										<Input
											type="number"
											id="cost"
											value={formData.cost}
											onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
											placeholder="0"
											className="thai-text"
											required
										/>
									</div>
									<div>
										<Label htmlFor="price" className="thai-text">ราคาขาย (บาท) *</Label>
										<Input
											type="number"
											id="price"
											value={formData.price}
											onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
											placeholder="0"
											className="thai-text"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="stock" className="thai-text">จำนวนในสต็อก *</Label>
										<Input
											type="number"
											id="stock"
											value={formData.stock}
											onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
											placeholder="0"
											className="thai-text"
											required
										/>
									</div>
									<div>
										<Label htmlFor="minStock" className="thai-text">สต็อกขั้นต่ำ</Label>
										<Input
											type="number"
											id="minStock"
											value={formData.minStock}
											onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
											placeholder="5"
											className="thai-text"
										/>
									</div>
								</div>

								{/* สรุปข้อมูล */}
								<div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
									<div className="text-sm text-blue-600 thai-text mb-2">สรุปข้อมูล</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-blue-700 thai-text">ต้นทุนรวม:</div>
											<div className="font-semibold">฿{(formData.cost * formData.stock).toLocaleString()}</div>
										</div>
										<div>
											<div className="text-blue-700 thai-text">มูลค่าสต็อก:</div>
											<div className="font-semibold">฿{(formData.price * formData.stock).toLocaleString()}</div>
										</div>
										<div>
											<div className="text-blue-700 thai-text">กำไรต่อชิ้น:</div>
											<div className="font-semibold text-green-600">฿{(formData.price - formData.cost).toLocaleString()}</div>
										</div>
										<div>
											<div className="text-blue-700 thai-text">กำไรรวม:</div>
											<div className="font-semibold text-green-600">฿{((formData.price - formData.cost) * formData.stock).toLocaleString()}</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* ปุ่มบันทึก */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate('/parts')}
							className="btn-outline"
						>
							ยกเลิก
						</Button>
						<Button type="submit" disabled={isSubmitting} className="btn-primary">
							<Save className="w-4 h-4 mr-2" />
							{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกอะไหล่'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PartsAdd;
