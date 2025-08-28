import { PageHeader } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import { ArrowUpDown, Package, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StockMovement = () => {
	const navigate = useNavigate();
	const { parts, updatePart } = useRepairStore();
	
	const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
	const [selectedPart, setSelectedPart] = useState<any>(null);
	const [adjustType, setAdjustType] = useState<'increase' | 'decrease' | 'set'>('increase');
	const [adjustQty, setAdjustQty] = useState<number>(0);
	const [adjustNote, setAdjustNote] = useState('');

	// Mock stock movement history (ในระบบจริงจะดึงจากฐานข้อมูล)
	const [stockMovements] = useState([
		{
			id: 1,
			partId: '1',
			partName: 'จอ LCD iPhone 12',
			type: 'increase',
			quantity: 10,
			beforeStock: 5,
			afterStock: 15,
			note: 'รับของจากซัพพลายเออร์',
			date: new Date('2024-01-15'),
			user: 'admin'
		},
		{
			id: 2,
			partId: '1',
			partName: 'จอ LCD iPhone 12',
			type: 'decrease',
			quantity: 2,
			beforeStock: 15,
			afterStock: 13,
			note: 'ใช้ในงานซ่อม #001',
			date: new Date('2024-01-16'),
			user: 'tech1'
		},
		{
			id: 3,
			partId: '2',
			partName: 'แบตเตอรี่ iPhone 12',
			type: 'set',
			quantity: 20,
			beforeStock: 8,
			afterStock: 20,
			note: 'ปรับสต็อกตามการนับจริง',
			date: new Date('2024-01-17'),
			user: 'admin'
		}
	]);

	const handleAdjustStock = (part: any) => {
		setSelectedPart(part);
		setAdjustQty(0);
		setAdjustNote('');
		setAdjustType('increase');
		setIsAdjustDialogOpen(true);
	};

	const handleSaveAdjustment = async () => {
		if (!selectedPart || adjustQty <= 0) return;

		try {
			let newStock = selectedPart.stock;
			
			switch (adjustType) {
				case 'increase':
					newStock += adjustQty;
					break;
				case 'decrease':
					newStock = Math.max(0, newStock - adjustQty);
					break;
				case 'set':
					newStock = adjustQty;
					break;
			}

			await updatePart(selectedPart.id, { stock: newStock });
			
			// ในระบบจริงจะบันทึกประวัติการเคลื่อนไหวสต็อก
			console.log('Stock adjusted:', {
				partId: selectedPart.id,
				type: adjustType,
				quantity: adjustQty,
				beforeStock: selectedPart.stock,
				afterStock: newStock,
				note: adjustNote,
				date: new Date(),
				user: 'current_user'
			});

			setIsAdjustDialogOpen(false);
		} catch (error) {
			console.error('Error adjusting stock:', error);
		}
	};

	const getMovementIcon = (type: string) => {
		switch (type) {
			case 'increase':
				return <TrendingUp className="w-4 h-4 text-green-600" />;
			case 'decrease':
				return <TrendingDown className="w-4 h-4 text-red-600" />;
			case 'set':
				return <ArrowUpDown className="w-4 h-4 text-blue-600" />;
			default:
				return <ArrowUpDown className="w-4 h-4" />;
		}
	};

	const getMovementBadge = (type: string) => {
		switch (type) {
			case 'increase':
				return <Badge className="bg-green-100 text-green-800">เพิ่ม</Badge>;
			case 'decrease':
				return <Badge className="bg-red-100 text-red-800">ลด</Badge>;
			case 'set':
				return <Badge className="bg-blue-100 text-blue-800">ตั้งค่า</Badge>;
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-7xl mx-auto">
				<PageHeader 
					title="การเคลื่อนไหวสต็อก" 
					description="ติดตามการเปลี่ยนแปลงสต็อกสินค้า" 
					showActions={false} 
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* สรุปการเคลื่อนไหว */}
					<div className="lg:col-span-1 space-y-6">
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text flex items-center gap-2">
									<Package className="w-5 h-5" />
									สรุปการเคลื่อนไหว
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
										<div className="text-2xl font-bold text-green-700">{stockMovements.filter(m => m.type === 'increase').length}</div>
										<div className="text-sm text-green-600 thai-text">เพิ่มสต็อก</div>
									</div>
									<div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
										<div className="text-2xl font-bold text-red-700">{stockMovements.filter(m => m.type === 'decrease').length}</div>
										<div className="text-sm text-red-600 thai-text">ลดสต็อก</div>
									</div>
								</div>
								<div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
									<div className="text-2xl font-bold text-blue-700">{stockMovements.filter(m => m.type === 'set').length}</div>
									<div className="text-sm text-blue-600 thai-text">ปรับสต็อก</div>
								</div>
							</CardContent>
						</Card>

						{/* สินค้าที่สต็อกต่ำ */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">สินค้าที่สต็อกต่ำ</CardTitle>
							</CardHeader>
							<CardContent>
								{parts.filter(p => p.stock <= (p.minStock || 5)).length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										<p className="text-sm thai-text">ไม่มีสินค้าที่สต็อกต่ำ</p>
									</div>
								) : (
									<div className="space-y-2">
										{parts.filter(p => p.stock <= (p.minStock || 5)).slice(0, 5).map(part => (
											<div key={part.id} className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200">
												<div className="flex-1">
													<div className="font-medium text-sm thai-text">{part.name}</div>
													<div className="text-xs text-orange-600">เหลือ {part.stock} {part.unit}</div>
												</div>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleAdjustStock(part)}
													className="text-xs"
												>
													<Plus className="w-3 h-3 mr-1" />
													เพิ่ม
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* ประวัติการเคลื่อนไหว */}
					<div className="lg:col-span-2">
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">ประวัติการเคลื่อนไหวสต็อก</CardTitle>
							</CardHeader>
							<CardContent>
								{stockMovements.length === 0 ? (
									<div className="text-center py-10 text-muted-foreground">
										<Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p className="thai-text">ไม่มีประวัติการเคลื่อนไหวสต็อก</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="thai-text">วันที่</TableHead>
													<TableHead className="thai-text">สินค้า</TableHead>
													<TableHead className="thai-text">ประเภท</TableHead>
													<TableHead className="thai-text">จำนวน</TableHead>
													<TableHead className="thai-text">สต็อกก่อน</TableHead>
													<TableHead className="thai-text">สต็อกหลัง</TableHead>
													<TableHead className="thai-text">หมายเหตุ</TableHead>
													<TableHead className="thai-text">ผู้ดำเนินการ</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{stockMovements.map((movement) => (
													<TableRow key={movement.id}>
														<TableCell className="text-sm">
															{movement.date.toLocaleDateString('th-TH')}
														</TableCell>
														<TableCell className="thai-text font-medium">
															{movement.partName}
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																{getMovementIcon(movement.type)}
																{getMovementBadge(movement.type)}
															</div>
														</TableCell>
														<TableCell className="font-mono">
															{movement.quantity}
														</TableCell>
														<TableCell className="font-mono text-muted-foreground">
															{movement.beforeStock}
														</TableCell>
														<TableCell className="font-mono font-semibold">
															{movement.afterStock}
														</TableCell>
														<TableCell className="thai-text text-sm max-w-xs truncate" title={movement.note}>
															{movement.note}
														</TableCell>
														<TableCell className="text-sm text-muted-foreground">
															{movement.user}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Dialog ปรับสต็อก */}
				<Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle className="thai-text">ปรับสต็อกสินค้า</DialogTitle>
						</DialogHeader>
						{selectedPart && (
							<div className="space-y-4">
								<div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
									<div className="font-medium thai-text">{selectedPart.name}</div>
									<div className="text-sm text-blue-600">สต็อกปัจจุบัน: {selectedPart.stock} {selectedPart.unit}</div>
								</div>

								<div>
									<Label className="thai-text">ประเภทการปรับ</Label>
									<Select value={adjustType} onValueChange={(value: any) => setAdjustType(value)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="increase">เพิ่มสต็อก</SelectItem>
											<SelectItem value="decrease">ลดสต็อก</SelectItem>
											<SelectItem value="set">ตั้งค่าสต็อก</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label className="thai-text">จำนวน</Label>
									<Input
										type="number"
										value={adjustQty}
										onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
										placeholder="0"
										className="thai-text"
									/>
								</div>

								<div>
									<Label className="thai-text">หมายเหตุ</Label>
									<Textarea
										value={adjustNote}
										onChange={(e) => setAdjustNote(e.target.value)}
										placeholder="เหตุผลในการปรับสต็อก"
										className="thai-text"
										rows={3}
									/>
								</div>

								{/* แสดงผลลัพธ์ */}
								{adjustQty > 0 && (
									<div className="p-4 rounded-lg bg-green-50 border border-green-200">
										<div className="text-sm text-green-600 thai-text mb-2">ผลลัพธ์:</div>
										<div className="font-mono">
											{adjustType === 'increase' && (
												<div>สต็อกใหม่: {selectedPart.stock + adjustQty} {selectedPart.unit}</div>
											)}
											{adjustType === 'decrease' && (
												<div>สต็อกใหม่: {Math.max(0, selectedPart.stock - adjustQty)} {selectedPart.unit}</div>
											)}
											{adjustType === 'set' && (
												<div>สต็อกใหม่: {adjustQty} {selectedPart.unit}</div>
											)}
										</div>
									</div>
								)}

								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
										ยกเลิก
									</Button>
									<Button onClick={handleSaveAdjustment} disabled={adjustQty <= 0}>
										บันทึก
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default StockMovement;
