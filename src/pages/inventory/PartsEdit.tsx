import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PartsEdit = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { parts, updatePart, getPartById } = useRepairStore();
	
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
	const [part, setPart] = useState(getPartById(id || ''));

	useEffect(() => {
		if (id) {
			const foundPart = getPartById(id);
			setPart(foundPart);
			if (foundPart) {
				setFormData({
					sku: foundPart.sku || '',
					name: foundPart.name || '',
					forBrand: foundPart.forBrand || '',
					forModel: foundPart.forModel || '',
					unit: foundPart.unit || 'ชิ้น',
					cost: foundPart.cost || 0,
					price: foundPart.price || 0,
					stock: foundPart.stock || 0,
					minStock: foundPart.minStock || 0,
					description: foundPart.description || '',
					imageUrl: foundPart.imageUrl || ''
				});
			}
		}
	}, [id, parts, getPartById]);

	if (!part) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
				<div className="p-6 md:p-8 max-w-4xl mx-auto">
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
			await updatePart(id!, formData);
			navigate('/parts');
		} catch (error) {
			console.error('Error updating part:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-4xl mx-auto">
				{/* Header */}
				<div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button variant="outline" onClick={() => navigate('/parts')} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
							<ArrowLeft className="w-4 h-4 mr-2" /> กลับไปรายการ
						</Button>
						<div>
							<div className="text-lg md:text-xl font-bold thai-text">แก้ไขอะไหล่</div>
							<div className="text-white/90 thai-text text-sm md:text-base">แก้ไขข้อมูลอะไหล่: {part.name}</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button type="submit" form="edit-part-form" disabled={isSubmitting} className="rounded-xl bg-white text-primary hover:bg-white/90 border border-white/20 px-4 py-2">
							<Save className="w-4 h-4 mr-2" /> บันทึก
						</Button>
					</div>
				</div>

				<form id="edit-part-form" onSubmit={handleSubmit} className="space-y-6">
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

								{/* สถานะสต็อก */}
								<div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
									<div className="text-sm text-orange-600 thai-text mb-2">สถานะสต็อก</div>
									<div className="text-sm">
										{formData.stock === 0 ? (
											<div className="text-red-600 font-semibold">⚠️ หมดสต็อก</div>
										) : formData.stock <= formData.minStock ? (
											<div className="text-orange-600 font-semibold">⚠️ สต็อกต่ำ (เหลือ {formData.stock} {formData.unit})</div>
										) : (
											<div className="text-green-600 font-semibold">✅ สต็อกปกติ (เหลือ {formData.stock} {formData.unit})</div>
										)}
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
							{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PartsEdit;
