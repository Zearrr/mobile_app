import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRepairStore } from '@/stores/useRepairStore';
import type { JobStatus, PaymentStatus } from '@/types';
import {
    ArrowLeft,
    Calendar,
    Save,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const JobEdit = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { getJobById, updateJob } = useRepairStore();
	
	const [job, setJob] = useState(getJobById(id || ''));
	const [formData, setFormData] = useState({
		status: job?.status || 'received' as JobStatus,
		paymentStatus: job?.paymentStatus || 'unpaid' as PaymentStatus,
		total: job?.total || 0,
		deposit: job?.deposit || 0,
		issueDesc: job?.issueDesc || '',
		dueAt: job?.dueAt ? new Date(job.dueAt).toISOString().slice(0, 10) : '',
		notes: job?.notes || ''
	});

	useEffect(() => {
		if (id) {
			const foundJob = getJobById(id);
			setJob(foundJob);
			if (foundJob) {
				setFormData({
					status: foundJob.status,
					paymentStatus: foundJob.paymentStatus,
					total: foundJob.total,
					deposit: foundJob.deposit || 0,
					issueDesc: foundJob.issueDesc,
					dueAt: foundJob.dueAt ? new Date(foundJob.dueAt).toISOString().slice(0, 10) : '',
					notes: foundJob.notes || ''
				});
			}
		}
	}, [id, getJobById]);

	if (!job) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
				<div className="p-6 md:p-8 max-w-7xl mx-auto">
					<div className="text-center py-10">
						<Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p className="text-muted-foreground">ไม่พบงานซ่อม</p>
						<Button onClick={() => navigate('/jobs')} className="mt-4">
							กลับไปรายการงานซ่อม
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		const updatedJob = {
			...job,
			...formData,
			dueAt: formData.dueAt ? new Date(formData.dueAt) : undefined
		};

		updateJob(updatedJob);
		navigate(`/jobs/${job.id}`);
	};

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-7xl mx-auto">
				{/* Header */}
				<div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
							<ArrowLeft className="w-4 h-4 mr-2" /> กลับไปรายละเอียด
						</Button>
						<div>
							<div className="text-lg md:text-xl font-bold thai-text">แก้ไขงานซ่อม #{job.id}</div>
							<div className="text-white/90 thai-text text-sm md:text-base">อัปเดตข้อมูลงานซ่อม</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button type="submit" form="edit-job-form" className="rounded-xl bg-white text-primary hover:bg-white/90 border border-white/20 px-4 py-2">
							<Save className="w-4 h-4 mr-2" /> บันทึก
						</Button>
					</div>
				</div>

				<form id="edit-job-form" onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* ข้อมูลงานซ่อม */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text flex items-center gap-2">
									<Wrench className="w-5 h-5" />
									ข้อมูลงานซ่อม
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="status" className="thai-text">สถานะงาน</Label>
									<Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
										<SelectTrigger>
											<SelectValue placeholder="เลือกสถานะ" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="received">รับงานแล้ว</SelectItem>
											<SelectItem value="checking">กำลังตรวจเช็ค</SelectItem>
											<SelectItem value="waiting_parts">รอสินค้า</SelectItem>
											<SelectItem value="in_progress">กำลังซ่อม</SelectItem>
											<SelectItem value="testing">ทดสอบ</SelectItem>
											<SelectItem value="done">ซ่อมเสร็จ</SelectItem>
											<SelectItem value="delivered">ส่งมอบแล้ว</SelectItem>
											<SelectItem value="returned">รับคืนแล้ว</SelectItem>
											<SelectItem value="cancelled">ยกเลิก</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="issueDesc" className="thai-text">อาการเสีย</Label>
									<Textarea
										id="issueDesc"
										value={formData.issueDesc}
										onChange={(e) => handleChange('issueDesc', e.target.value)}
										placeholder="รายละเอียดอาการเสีย"
										className="thai-text"
									/>
								</div>

								<div>
									<Label htmlFor="dueAt" className="thai-text">กำหนดส่ง</Label>
									<div className="relative">
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="date"
											id="dueAt"
											value={formData.dueAt}
											onChange={(e) => handleChange('dueAt', e.target.value)}
											className="pl-10 thai-text"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="notes" className="thai-text">หมายเหตุ</Label>
									<Textarea
										id="notes"
										value={formData.notes}
										onChange={(e) => handleChange('notes', e.target.value)}
										placeholder="หมายเหตุเพิ่มเติม"
										className="thai-text"
									/>
								</div>
							</CardContent>
						</Card>

						{/* ข้อมูลการเงิน */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">ข้อมูลการเงิน</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="paymentStatus" className="thai-text">สถานะชำระ</Label>
									<Select value={formData.paymentStatus} onValueChange={(value) => handleChange('paymentStatus', value)}>
										<SelectTrigger>
											<SelectValue placeholder="เลือกสถานะชำระ" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="unpaid">ยังไม่ชำระ</SelectItem>
											<SelectItem value="deposit">มัดจำ</SelectItem>
											<SelectItem value="paid">ชำระแล้ว</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="total" className="thai-text">ยอดรวม (บาท)</Label>
									<Input
										type="number"
										id="total"
										value={formData.total}
										onChange={(e) => handleChange('total', parseFloat(e.target.value) || 0)}
										placeholder="0"
										className="thai-text"
									/>
								</div>

								<div>
									<Label htmlFor="deposit" className="thai-text">มัดจำ (บาท)</Label>
									<Input
										type="number"
										id="deposit"
										value={formData.deposit}
										onChange={(e) => handleChange('deposit', parseFloat(e.target.value) || 0)}
										placeholder="0"
										className="thai-text"
									/>
								</div>

								<div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
									<div className="text-sm text-blue-600 thai-text mb-2">สรุปการชำระ</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-blue-700 thai-text">ยอดรวม:</div>
											<div className="font-semibold">฿{formData.total.toLocaleString()}</div>
										</div>
										<div>
											<div className="text-blue-700 thai-text">มัดจำ:</div>
											<div className="font-semibold">฿{formData.deposit.toLocaleString()}</div>
										</div>
										<div className="col-span-2">
											<div className="text-blue-700 thai-text">คงเหลือ:</div>
											<div className="font-semibold text-lg">฿{(formData.total - formData.deposit).toLocaleString()}</div>
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
							onClick={() => navigate(`/jobs/${job.id}`)}
							className="btn-outline"
						>
							ยกเลิก
						</Button>
						<Button type="submit" className="btn-primary">
							<Save className="w-4 h-4 mr-2" />
							บันทึกการเปลี่ยนแปลง
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default JobEdit;
