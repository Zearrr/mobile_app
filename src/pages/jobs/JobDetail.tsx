import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentBadge, StatusBadge } from '@/components/ui/status-badge';
import { useRepairStore } from '@/stores/useRepairStore';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit,
    MapPin,
    Phone,
    Printer,
    User,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const JobDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { jobs, getCustomerById, getJobById } = useRepairStore();
	
	const [job, setJob] = useState(getJobById(id || ''));
	const [customer, setCustomer] = useState(getCustomerById(job?.customerId || ''));

	useEffect(() => {
		if (id) {
			const foundJob = getJobById(id);
			setJob(foundJob);
			if (foundJob) {
				setCustomer(getCustomerById(foundJob.customerId));
			}
		}
	}, [id, jobs, getJobById, getCustomerById]);

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

	const totalCost = job.costParts + job.costLabor;
	const profit = job.profit || (job.total - totalCost);

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-7xl mx-auto">
				{/* Header */}
				<div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button variant="outline" onClick={() => navigate('/jobs')} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
							<ArrowLeft className="w-4 h-4 mr-2" /> กลับไปรายการ
						</Button>
						<div>
							<div className="text-lg md:text-xl font-bold thai-text">รายละเอียดงานซ่อม #{job.id}</div>
							<div className="text-white/90 thai-text text-sm md:text-base">ข้อมูลงานซ่อมและลูกค้า</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" asChild className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
							<Link to={`/jobs/${job.id}/edit`}>
								<Edit className="w-4 h-4 mr-2" /> แก้ไข
							</Link>
						</Button>
						<Button variant="outline" asChild className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
							<Link to={`/print/jobs/${job.id}`}>
								<Printer className="w-4 h-4 mr-2" /> พิมพ์
							</Link>
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* ข้อมูลงานซ่อม */}
					<div className="lg:col-span-2 space-y-6">
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text flex items-center gap-2">
									<Wrench className="w-5 h-5" />
									ข้อมูลงานซ่อม
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">เลขที่ซ่อม</label>
										<div className="font-mono font-semibold text-lg">{job.id}</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">วันที่รับงาน</label>
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-muted-foreground" />
											<span>{new Date(job.createdAt).toLocaleDateString('th-TH')}</span>
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">ยี่ห้อ/รุ่น</label>
										<div className="font-semibold">{job.brand} {job.model}</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">อาการเสีย</label>
										<div className="text-sm">{job.issueDesc}</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">สถานะงาน</label>
										<div className="mt-1">
											<StatusBadge status={job.status} />
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">สถานะชำระ</label>
										<div className="mt-1">
											<PaymentBadge status={job.paymentStatus} />
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground thai-text">กำหนดส่ง</label>
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-muted-foreground" />
											<span>{job.dueAt ? new Date(job.dueAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* ข้อมูลการเงิน */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">ข้อมูลการเงิน</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
										<div className="text-2xl font-bold text-blue-700">฿{job.total.toLocaleString()}</div>
										<div className="text-sm text-blue-600 thai-text">ยอดรวม</div>
									</div>
									<div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-200">
										<div className="text-2xl font-bold text-orange-700">฿{totalCost.toLocaleString()}</div>
										<div className="text-sm text-orange-600 thai-text">ต้นทุน</div>
									</div>
									<div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
										<div className="text-2xl font-bold text-emerald-700">฿{Math.abs(profit).toLocaleString()}</div>
										<div className="text-sm text-emerald-600 thai-text">{profit >= 0 ? 'กำไร' : 'ขาดทุน'}</div>
									</div>
									<div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-200">
										<div className="text-2xl font-bold text-purple-700">฿{(job.deposit || 0).toLocaleString()}</div>
										<div className="text-sm text-purple-600 thai-text">มัดจำ</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* ข้อมูลลูกค้า */}
					<div className="space-y-6">
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text flex items-center gap-2">
									<User className="w-5 h-5" />
									ข้อมูลลูกค้า
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground thai-text">ชื่อลูกค้า</label>
									<div className="font-semibold">{customer?.name || 'ไม่ระบุ'}</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground thai-text">เบอร์โทร</label>
									<div className="flex items-center gap-2">
										<Phone className="w-4 h-4 text-muted-foreground" />
										<span>{customer?.phone || 'ไม่ระบุ'}</span>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground thai-text">ที่อยู่</label>
									<div className="flex items-start gap-2">
										<MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
										<span className="text-sm">{customer?.address || 'ไม่ระบุ'}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* ประวัติงานซ่อมของลูกค้า */}
						<Card className="glass-card">
							<CardHeader>
								<CardTitle className="thai-text">ประวัติงานซ่อม</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-4 text-muted-foreground">
									<Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm thai-text">กำลังพัฒนา...</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default JobDetail;
