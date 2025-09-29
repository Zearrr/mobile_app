import { PageHeader } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRepairStore } from '@/stores/useRepairStore';
import type { JobStatus, PaymentStatus } from '@/types';
import { AlertTriangle, Calendar, CheckCircle, Clock, CreditCard, Edit, Eye, Filter, Printer, RotateCcw, Search, Trash2, TrendingUp, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

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
	const navigate = useNavigate();
	const {
		getFilteredJobs,
		setFilters,
		clearFilters,
		filters,
		getCustomerById,
		jobs,
		updatePaymentStatus
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

	// Pagination for jobs table
	const [page, setPage] = useState(1);
	const perPage = 5;
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const start = (page - 1) * perPage;
	const pageItems = items.slice(start, start + perPage);

	// Reset to first page when filters change
	useEffect(() => {
		setPage(1);
	}, [search, status, payment, dateFrom, dateTo, filters]);

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
		const cost = items.reduce((s, j) => s + ((j.costParts ?? 0) + (j.costLabor ?? 0)), 0);
		
		return { count, revenue, profit, cost };
	}, [items]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary animate-fade-in">
			<div className="p-6 md:p-8 max-w-7xl mx-auto">
				<PageHeader 
					title="จัดการงานซ่อม" 
					description="ดูและจัดการงานซ่อมทั้งหมดในระบบ" 
					showActions={true} 
				/>

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

				{/* Results Summary + Filters in header */}
				<Card className="glass-card">
					<CardHeader>
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<CardTitle className="thai-text flex items-center gap-2">
								<Search className="w-5 h-5 text-primary" /> รายการที่พบ ({filteredStats.count})
							</CardTitle>
						<div className="flex gap-3 md:gap-4 flex-wrap">
							<div className="rounded-full px-5 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 min-w-[130px] text-center transition-colors hover:from-emerald-500/90 hover:to-emerald-600/90">
									<div className="text-[11px] thai-text">ยอดรวม</div>
									<div className="text-base font-extrabold">฿{filteredStats.revenue.toLocaleString()}</div>
								</div>
							<div className="rounded-full px-5 py-2.5 bg-gradient-to-b from-sky-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 min-w-[130px] text-center transition-colors hover:from-sky-500/90 hover:to-cyan-600/90">
									<div className="text-[11px] thai-text">ต้นทุน</div>
									<div className="text-base font-extrabold">฿{filteredStats.cost.toLocaleString()}</div>
								</div>
							<div className="rounded-full px-5 py-2.5 bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 ring-1 ring-white/20 min-w-[130px] text-center transition-colors hover:from-amber-500/90 hover:to-amber-600/90">
									<div className="text-[11px] thai-text">กำไร</div>
									<div className="text-base font-extrabold">฿{filteredStats.profit.toLocaleString()}</div>
								</div>
							</div>
						</div>
						<div className="mt-4 rounded-2xl border border-border p-4 bg-white/80">
							<div className="flex items-center gap-2 mb-3">
								<Filter className="h-5 w-5 text-primary" />
								<span className="thai-text font-medium text-foreground">ตัวกรองและค้นหา</span>
							</div>

							<div className="flex flex-col md:flex-row md:items-end md:gap-3 gap-4">
								<Input placeholder="ค้นหา: รหัสงาน, ลูกค้า, เบอร์, รุ่น, อาการเสีย" value={search} onChange={(e) => setSearch(e.target.value)} className="thai-text md:flex-[2]" />
								<div className="md:w-56">
									<Select value={status} onValueChange={(v) => setStatus(v as any)}>
										<SelectTrigger className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ring-0 outline-none">
											<SelectValue placeholder="สถานะงาน" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">สถานะทั้งหมด</SelectItem>
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
								<div className="md:w-56">
									<Select value={payment} onValueChange={(v) => setPayment(v as any)}>
										<SelectTrigger className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ring-0 outline-none">
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
								<div className="md:w-44">
									<label className="text-sm font-medium thai-text mb-2 block md:mb-1">วันที่เริ่ม</label>
									<div className="relative">
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-10 thai-text" />
									</div>
								</div>
								<div className="md:w-44">
									<label className="text-sm font-medium thai-text mb-2 block md:mb-1">วันที่สิ้นสุด</label>
									<div className="relative">
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-10 thai-text" />
									</div>
								</div>
								<div className="flex gap-2 md:w-64">
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
							<>
							<div className="overflow-x-hidden">
								<Table className="enhanced-table w-full text-xs">
									<TableHeader>
										<TableRow>
											<TableHead className="thai-text whitespace-nowrap h-10 px-3">เลขที่ซ่อม</TableHead>
											<TableHead className="thai-text h-10 px-3">ลูกค้า</TableHead>
											<TableHead className="thai-text whitespace-nowrap h-10 px-3">โทรศัพท์</TableHead>
											<TableHead className="thai-text h-10 px-3">อาการเสีย</TableHead>
											<TableHead className="thai-text whitespace-nowrap h-10 px-3">ค่าใช้จ่าย</TableHead>
											<TableHead className="thai-text whitespace-nowrap h-10 px-3">ต้นทุน</TableHead>
                                        <TableHead className="thai-text whitespace-nowrap h-10 px-3">กำไร/ขาดทุน</TableHead>
											<TableHead className="thai-text whitespace-nowrap h-10 px-3">สถานะการชำระ</TableHead>
											<TableHead className="text-right thai-text whitespace-nowrap h-10 px-3">จัดการ</TableHead>
										</TableRow>
									</TableHeader>
							<TableBody>
								{pageItems.map((job, index) => {
											const customer = getCustomerById(job.customerId);
											const total = job.total ?? 0;
											const costParts = job.costParts ?? 0;
											const costLabor = job.costLabor ?? 0;
											const totalCost = costParts + costLabor;
											const profit = job.profit ?? (total - totalCost);
											
											return (
												<TableRow key={job.id} className="hover:bg-accent/50 odd:bg-muted/60">
													<TableCell className="font-mono font-semibold p-3">{job.id}</TableCell>
													<TableCell className="thai-text p-3">
														<div className="font-medium">{customer?.name || 'ไม่ระบุ'}</div>
													</TableCell>
													<TableCell className="thai-text p-3">
														<div className="font-medium">{job.brand} {job.model}</div>
														<div className="text-xs text-muted-foreground">{customer?.phone || '-'}</div>
													</TableCell>
													<TableCell className="thai-text max-w-xs truncate p-3" title={job.issueDesc}>
														{job.issueDesc}
													</TableCell>
													<TableCell className="font-semibold text-success whitespace-nowrap p-3">
														฿{total.toLocaleString()}
													</TableCell>
													<TableCell className="text-sm whitespace-nowrap p-3">
													<div className="flex items-center gap-1">
														<span>฿{totalCost.toLocaleString()}</span>
													</div>
													</TableCell>
                                                    <TableCell className={`font-semibold whitespace-nowrap p-3 ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
														{profit >= 0 ? '↑' : '↓'} ฿{Math.abs(profit).toLocaleString()}
													</TableCell>
                                                    <TableCell className="p-3">
                                                        {job.paymentStatus !== 'paid' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2 thai-text bg-green-600/90 hover:bg-green-700 text-white border-0"
                                                                onClick={() => updatePaymentStatus(job.id, 'paid')}
                                                                title="ทำเครื่องหมายว่าชำระแล้ว"
                                                            >
                                                                <CreditCard className="w-4 h-4 mr-1" /> ชำระแล้ว
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2 thai-text bg-rose-600/90 hover:bg-rose-700 text-white border-0"
                                                                onClick={() => updatePaymentStatus(job.id, 'unpaid')}
                                                                title="เปลี่ยนเป็นยังไม่ชำระ"
                                                            >
                                                                <CreditCard className="w-4 h-4 mr-1" /> ยังไม่ชำระ
                                                            </Button>
                                                        )}
                                                    </TableCell>
													<TableCell className="text-right whitespace-nowrap p-3">
														<div className="flex justify-end gap-2">
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
															<Button variant="outline" size="sm" className="h-8 w-8 p-0 btn-outline text-rose-600 hover:bg-rose-50" title="ลบ">
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
							{/* Pagination footer */}
							{items.length > 0 && (
								<div className="flex items-center justify-between p-4 border-t">
									<div className="text-sm thai-text text-muted-foreground">
										หน้า {page} / {totalPages} • แสดง {pageItems.length} จาก {items.length} รายการ
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											disabled={page === 1}
											onClick={() => setPage(p => Math.max(1, p - 1))}
											className="rounded-xl h-9 px-3"
										>ก่อนหน้า</Button>
										<Button
											variant="outline"
											disabled={page === totalPages}
											onClick={() => setPage(p => Math.min(totalPages, p + 1))}
											className="rounded-xl h-9 px-3"
										>ถัดไป</Button>
									</div>
								</div>
							)}
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Jobs;


