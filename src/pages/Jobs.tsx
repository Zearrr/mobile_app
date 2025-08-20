import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentBadge, StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import type { JobStatus, PaymentStatus } from '@/types';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  Eye,
  Filter,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

interface OutletContext {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	currentPageInfo: {
		title: string;
		description: string;
	};
}

const Jobs = () => {
	const { sidebarOpen, setSidebarOpen, currentPageInfo } = useOutletContext<OutletContext>();
	const {
		getFilteredJobs,
		setFilters,
		clearFilters,
		filters,
		getCustomerById,
		jobs
	} = useRepairStore();

	const [search, setSearch] = useState(filters.search || '');
	const [status, setStatus] = useState<JobStatus | 'all'>('all');
	const [payment, setPayment] = useState<PaymentStatus | 'all'>('all');
	const [dateFrom, setDateFrom] = useState<string>('');
	const [dateTo, setDateTo] = useState<string>('');

	useEffect(() => {
		// sync UI with store filters on first mount
		if (filters.status && filters.status.length === 1) setStatus(filters.status[0]);
		if (filters.paymentStatus && filters.paymentStatus.length === 1) setPayment(filters.paymentStatus[0]);
		if (filters.dateFrom) setDateFrom(filters.dateFrom.toISOString().slice(0, 10));
		if (filters.dateTo) setDateTo(filters.dateTo.toISOString().slice(0, 10));
	}, [filters]);

	const applyFilters = () => {
		setFilters({
			search: search || undefined,
			status: status === 'all' ? undefined : [status],
			paymentStatus: payment === 'all' ? undefined : [payment],
			dateFrom: dateFrom ? new Date(dateFrom) : undefined,
			dateTo: dateTo ? new Date(dateTo) : undefined
		});
	};

	const resetFilters = () => {
		setSearch('');
		setStatus('all');
		setPayment('all');
		setDateFrom('');
		setDateTo('');
		clearFilters();
	};

	const items = getFilteredJobs();

	// คำนวณสถิติสำหรับ dashboard
	const stats = useMemo(() => {
		const totalJobs = jobs.length;
		const completedJobs = jobs.filter(j => j.status === 'done' || j.status === 'delivered').length;
		const paidJobs = jobs.filter(j => j.paymentStatus === 'paid').length;
		const totalProfit = jobs.reduce((sum, j) => sum + (j.profit || 0), 0);
		const pendingJobs = jobs.filter(j => j.status === 'received' || j.status === 'checking' || j.status === 'waiting_parts').length;
		const inProgressJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'testing').length;
		const overdueJobs = jobs.filter(j => {
			if (j.dueAt && j.status !== 'done' && j.status !== 'delivered') {
				return new Date(j.dueAt) < new Date();
			}
			return false;
		}).length;

		return {
			totalJobs,
			completedJobs,
			paidJobs,
			totalProfit,
			pendingJobs,
			inProgressJobs,
			overdueJobs
		};
	}, [jobs]);

	// คำนวณสถิติสำหรับรายการที่กรองแล้ว
	const filteredStats = useMemo(() => {
		const count = items.length;
		const revenue = items.reduce((s, j) => s + (j.total || 0), 0);
		const profit = items.reduce((s, j) => s + (j.profit || 0), 0);
		const cost = items.reduce((s, j) => s + (j.costParts + j.costLabor), 0);
		
		return { count, revenue, profit, cost };
	}, [items]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			{/* Container ให้เว้นระยะจาก sidebar และจัดกึ่งกลางเหมือนหน้าแรก */}
			<div className="p-6 md:p-8 max-w-7xl mx-auto">

				{/* Quick Repair Card */}
				<div className="mb-8">
					<Card className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-2xl border-0 overflow-hidden rounded-2xl">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
										<Wrench className="w-6 h-6" />
									</div>
									<div>
										<h2 className="text-xl font-bold mb-1">แจ้งซ่อมด่วน</h2>
										<p className="text-white/80 thai-text">สร้างงานซ่อมใหม่สำหรับลูกค้าได้ทันที</p>
									</div>
								</div>
								<Link to="/jobs/new">
									<Button className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-6 py-3 text-base rounded-xl">
										<Plus className="w-6 h-6 mr-2" />
										แจ้งซ่อมใหม่
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Dashboard Stats (colored tiles) */}
				<div className="mb-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full" />
						<h3 className="text-xl font-semibold text-foreground">ภาพรวมงานซ่อม</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">รายการซ่อมทั้งหมด</div>
										<div className="text-3xl font-bold text-blue-700 mt-1">{stats.totalJobs}</div>
										<div className="text-xs text-blue-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
										<Wrench className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">ซ่อมเสร็จแล้ว</div>
										<div className="text-3xl font-bold text-emerald-700 mt-1">{stats.completedJobs}</div>
										<div className="text-xs text-emerald-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
										<CheckCircle className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">ชำระเงินแล้ว</div>
										<div className="text-3xl font-bold text-cyan-700 mt-1">{stats.paidJobs}</div>
										<div className="text-xs text-cyan-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
										<CreditCard className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">กำไรรวม</div>
										<div className="text-3xl font-bold text-emerald-700 mt-1">฿{stats.totalProfit.toLocaleString()}</div>
										<div className="text-xs text-emerald-700/70">บาท</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
										<TrendingUp className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Additional Stats (colored tiles) */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-1 h-8 bg-gradient-to-b from-warning to-primary-dark rounded-full" />
						<h3 className="text-xl font-semibold text-foreground">สถานะโดยละเอียด</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">รอดำเนินการ</div>
										<div className="text-3xl font-bold text-amber-700 mt-1">{stats.pendingJobs}</div>
										<div className="text-xs text-amber-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
										<Clock className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">กำลังดำเนินการ</div>
										<div className="text-3xl font-bold text-indigo-700 mt-1">{stats.inProgressJobs}</div>
										<div className="text-xs text-indigo-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
										<Wrench className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="rounded-2xl border border-border/50 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="text-xs text-muted-foreground">งานค้างส่ง</div>
										<div className="text-3xl font-bold text-rose-700 mt-1">{stats.overdueJobs}</div>
										<div className="text-xs text-rose-700/70">รายการ</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
										<AlertTriangle className="w-4 h-4" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Filter Section */}
				<Card className="glass-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 thai-text">
							<Filter className="h-5 w-5 text-primary" />
							ตัวกรองและค้นหา
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Search Row */}
						<div className="filter-row">
							<div className="lg:col-span-2">
								<Input 
									placeholder="ค้นหา: รหัสงาน, ลูกค้า, เบอร์, รุ่น, อาการเสีย" 
									value={search} 
									onChange={(e) => setSearch(e.target.value)} 
									className="thai-text"
								/>
							</div>
							<div>
								<Select value={status} onValueChange={(v) => setStatus(v as any)}>
									<SelectTrigger>
										<SelectValue placeholder="สถานะงาน" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">สถานะทั้งหมด</SelectItem>
										<SelectItem value="received">รับงานแล้ว</SelectItem>
										<SelectItem value="checking">กำลังตรวจเช็ค</SelectItem>
										<SelectItem value="waiting_parts">รออะไหล่</SelectItem>
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
								<Select value={payment} onValueChange={(v) => setPayment(v as any)}>
									<SelectTrigger>
										<SelectValue placeholder="สถานะชำระ" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">ชำระทั้งหมด</SelectItem>
										<SelectItem value="unpaid">ยังไม่ชำระ</SelectItem>
										<SelectItem value="deposit">มัดจำ</SelectItem>
										<SelectItem value="paid">ชำระแล้ว</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Date Range Row */}
						<div className="filter-row">
							<div>
								<label className="text-sm font-medium thai-text mb-2 block">วันที่เริ่ม</label>
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input 
										type="date" 
										value={dateFrom} 
										onChange={(e) => setDateFrom(e.target.value)}
										className="pl-10 thai-text"
									/>
								</div>
							</div>
							<div>
								<label className="text-sm font-medium thai-text mb-2 block">วันที่สิ้นสุด</label>
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input 
										type="date" 
										value={dateTo} 
										onChange={(e) => setDateTo(e.target.value)}
										className="pl-10 thai-text"
									/>
								</div>
							</div>
							<div className="lg:col-span-2 flex gap-2 items-end">
								<Button variant="outline" onClick={resetFilters} className="flex-1 btn-outline">
									<RotateCcw className="w-4 h-4 mr-2" />
									ล้าง
								</Button>
								<Button onClick={applyFilters} className="flex-1 btn-primary">
									<Search className="w-4 h-4 mr-2" />
									ค้นหา
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Results Summary */}
				<Card className="glass-card">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="thai-text">รายการที่พบ ({filteredStats.count})</CardTitle>
							<div className="flex gap-6 text-sm">
								<div className="text-center">
									<div className="font-semibold text-success">฿{filteredStats.revenue.toLocaleString()}</div>
									<div className="text-muted-foreground thai-text">ยอดรวม</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-primary">฿{filteredStats.cost.toLocaleString()}</div>
									<div className="text-muted-foreground thai-text">ต้นทุน</div>
								</div>
								<div className="text-center">
									<div className="font-semibold text-success">฿{filteredStats.profit.toLocaleString()}</div>
									<div className="text-muted-foreground thai-text">กำไร</div>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{items.length === 0 ? (
							<div className="text-center py-10 thai-text text-muted-foreground">
								<Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p>ไม่พบรายการตามเงื่อนไข</p>
								<Button variant="outline" onClick={resetFilters} className="mt-4 btn-outline">
									ล้างตัวกรอง
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table className="enhanced-table">
									<TableHeader>
										<TableRow>
											<TableHead className="thai-text">เลขที่ซ่อม</TableHead>
											<TableHead className="thai-text">ลูกค้า</TableHead>
											<TableHead className="thai-text">โทรศัพท์</TableHead>
											<TableHead className="thai-text">อาการเสีย</TableHead>
											<TableHead className="thai-text">ค่าใช้จ่าย</TableHead>
											<TableHead className="thai-text">ต้นทุน</TableHead>
											<TableHead className="thai-text">กำไร/ขาดทุน</TableHead>
											<TableHead className="thai-text">สถานะการซ่อม</TableHead>
											<TableHead className="thai-text">สถานะการชำระ</TableHead>
											<TableHead className="text-right thai-text">จัดการ</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{items.map((job) => {
											const customer = getCustomerById(job.customerId);
											const totalCost = job.costParts + job.costLabor;
											const profit = job.profit || (job.total - totalCost);
											
											return (
												<TableRow key={job.id} className="hover:bg-accent/50">
													<TableCell className="font-mono font-semibold">{job.id}</TableCell>
													<TableCell className="thai-text">
														<div className="font-medium">{customer?.name || 'ไม่ระบุ'}</div>
													</TableCell>
													<TableCell className="thai-text">
														<div className="font-medium">{job.brand} {job.model}</div>
														<div className="text-xs text-muted-foreground">{customer?.phone || '-'}</div>
													</TableCell>
													<TableCell className="thai-text max-w-xs truncate" title={job.issueDesc}>
														{job.issueDesc}
													</TableCell>
													<TableCell className="font-semibold text-success">
														฿{job.total.toLocaleString()}
													</TableCell>
													<TableCell className="text-sm">
														<div className="flex items-center gap-1">
															<span>฿{totalCost.toLocaleString()}</span>
															{totalCost > 0 && (
																<Badge variant="outline" className="text-xs">
																	จากอะไหล่
																</Badge>
															)}
														</div>
													</TableCell>
													<TableCell className={`font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
														{profit >= 0 ? '↑' : '↓'} ฿{Math.abs(profit).toLocaleString()}
													</TableCell>
													<TableCell>
														<StatusBadge status={job.status} />
													</TableCell>
													<TableCell>
														<PaymentBadge status={job.paymentStatus} />
													</TableCell>
													<TableCell className="text-right">
														<div className="flex justify-end gap-1">
															<Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
																<Link to={`/jobs/${job.id}`} title="ดู">
																	<Eye className="w-4 h-4" />
																</Link>
															</Button>
															<Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
																<Link to={`/jobs/${job.id}/edit`} title="แก้ไข">
																	<Edit className="w-4 h-4" />
																</Link>
															</Button>
															<Button variant="outline" size="sm" asChild className="h-8 w-8 p-0 btn-outline">
																<Link to={`/print/jobs/${job.id}`} title="พิมพ์">
																	<Printer className="w-4 h-4" />
																</Link>
															</Button>
															<Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive btn-outline" title="ลบ">
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default Jobs;


