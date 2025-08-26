import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { useRepairStore } from '@/stores/useRepairStore';
import { LockType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Grid3x3, KeyRound, X as XIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const newJobSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
    phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
    lineId: z.string().optional(),
    altPhone: z.string().optional()
  }),
  device: z.object({
    brand: z.string().min(1, 'กรุณากรอกยี่ห้อ'),
    model: z.string().min(1, 'กรุณากรอกรุ่น'),
    color: z.string().optional(),
    imei: z.string().optional(),
    serial: z.string().optional()
  }),
  lock: z.object({
    type: z.enum(['none', 'pin', 'pattern']),
    note: z.string().optional()
  }),
  details: z.object({
    issueDesc: z.string().min(1, 'กรุณากรอกรายละเอียดอาการเสีย'),
    accessories: z.string().optional().default(''),
    preCheck: z.string().optional().default('')
  }),
  pricing: z.object({
    estimateParts: z.coerce.number().min(0).default(0),
    estimateLabor: z.coerce.number().min(0).default(0),
    deposit: z.coerce.number().min(0).default(0)
  }),
  schedule: z.object({
    dueAt: z.string().optional(),
    warrantyDays: z.coerce.number().min(0).default(30),
    technician: z.string().optional()
  })
});

type NewJobForm = z.infer<typeof newJobSchema>;

// Local inline PatternLock component (SVG + Pointer Events)
type PatternLockProps = {
  size?: number;
  dotRadius?: number;
  onComplete?: (path: number[]) => void;
  showOrderText?: boolean;
  autoResetOnComplete?: boolean;
};

type Point = { x: number; y: number };

function useNodes(size: number) {
  return useMemo(() => {
    const cell = size / 3;
    const centers: { id: number; x: number; y: number }[] = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const id = r * 3 + c + 1;
        const x = c * cell + cell / 2;
        const y = r * cell + cell / 2;
        centers.push({ id, x, y });
      }
    }
    return centers;
  }, [size]);
}

function distance(a: Point, b: Point) {
  const dx = a.x - b.x; const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

// Distance from point P to segment AB and projection t (0..1)
function distancePointToSegment(p: Point, a: Point, b: Point): { dist: number; t: number } {
  const vx = b.x - a.x; const vy = b.y - a.y;
  const wx = p.x - a.x; const wy = p.y - a.y;
  const vv = vx * vx + vy * vy || 1; // avoid divide by zero
  let t = (wx * vx + wy * vy) / vv;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const proj = { x: a.x + t * vx, y: a.y + t * vy };
  return { dist: distance(p, proj), t };
}

function midpointIndex(aId: number, bId: number): number | null {
  if (!aId || !bId) return null;
  const ar = Math.floor((aId - 1) / 3), ac = (aId - 1) % 3;
  const br = Math.floor((bId - 1) / 3), bc = (bId - 1) % 3;
  if (((ar + br) % 2 === 0) && ((ac + bc) % 2 === 0)) {
    const mr = (ar + br) / 2; const mc = (ac + bc) / 2;
    const mid = mr * 3 + mc + 1;
    if (mid !== aId && mid !== bId) return mid;
  }
  return null;
}

function pointFromPointerEvent(svg: SVGSVGElement, e: PointerEvent): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function PatternLock({
  size = 360,
  dotRadius = 28,
  onComplete,
  showOrderText = true,
  autoResetOnComplete = false,
}: PatternLockProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pointer, setPointer] = useState<Point | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const selectedSetRef = useRef<Set<number>>(new Set());
  const nodes = useNodes(size);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const hitTest = (p: Point) => {
    for (const n of nodes) {
      if (distance(p, { x: n.x, y: n.y }) <= dotRadius) return n.id;
    }
    return null;
  };

  const addId = (id: number) => {
    if (selectedSetRef.current.has(id)) return;
    setSelected(prev => {
      const last = prev[prev.length - 1];
      const next: number[] = [...prev];
      if (last) {
        const mid = midpointIndex(last, id);
        if (mid && !selectedSetRef.current.has(mid)) {
          next.push(mid);
          selectedSetRef.current.add(mid);
        }
      }
      next.push(id);
      selectedSetRef.current.add(id);
      return next;
    });
  };

  const reset = () => {
    setSelected([]);
    selectedSetRef.current = new Set();
    setPointer(null);
    setIsDragging(false);
  };

  const onPointerDown: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const isPrimary = e.isPrimary !== false;
    if (!isPrimary) return;
    const p = pointFromPointerEvent(svg, e.nativeEvent);
    const id = hitTest(p);
    if (!id) return;
    // If a previous pattern exists, start a fresh one automatically
    if (selected.length > 0) {
      selectedSetRef.current = new Set();
      setSelected([]);
    }
    svg.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setPointer(p);
    addId(id);
  };

  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const p = pointFromPointerEvent(svg, e.nativeEvent);
    setPointer(isDragging ? p : null);

    const directId = hitTest(p);
    setHoverId(directId);

    if (!isDragging) return;

    // 2) also check if the segment from last node to pointer crosses any node centers
    const lastId = selected[selected.length - 1];
    if (lastId) {
      const lastNode = nodes[lastId - 1];
      const segA = { x: lastNode.x, y: lastNode.y };
      const segB = p;
      const candidates: { id: number; t: number }[] = [];
      nodes.forEach((n) => {
        if (selectedSetRef.current.has(n.id)) return;
        const { dist, t } = distancePointToSegment({ x: n.x, y: n.y }, segA, segB);
        if (t > 0 && t < 1 && dist <= dotRadius) {
          candidates.push({ id: n.id, t });
        }
      });
      candidates.sort((a, b) => a.t - b.t);
      for (const c of candidates) {
        addId(c.id);
      }
    }
    if (directId) addId(directId);
  };

  const finish = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointer(null);
    if (onComplete) onComplete(selected);
    if (autoResetOnComplete) reset();
  };

  const onPointerUp: React.PointerEventHandler<SVGSVGElement> = () => finish();
  const onPointerCancel: React.PointerEventHandler<SVGSVGElement> = () => finish();

  const pathPoints = selected.map(id => {
    const n = nodes[id - 1];
    return `${n.x},${n.y}`;
  }).join(' ');

  const lastNode = selected.length ? nodes[selected[selected.length - 1] - 1] : null;

  const primary = '#2563eb'; // tailwind blue-600
  const primaryDark = '#1d4ed8';
  const mutedStroke = 'rgba(0,0,0,0.25)';

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        className="select-none touch-none mx-auto"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="application"
        aria-label="Pattern lock"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="nodeFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={primaryDark} />
          </linearGradient>
        </defs>
        {selected.length > 1 && (
          <polyline
            points={pathPoints}
            fill="none"
            stroke={primary}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {isDragging && pointer && lastNode && (
          <line
            x1={lastNode.x}
            y1={lastNode.y}
            x2={pointer.x}
            y2={pointer.y}
            stroke={primary}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {nodes.map((n) => {
          const isSelected = selected.includes(n.id);
          const isHover = hoverId === n.id && !isSelected;
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              {/* outer ring */}
              <circle r={dotRadius} fill={isSelected ? 'url(#nodeFill)' : '#ffffff'} stroke={isSelected ? 'url(#nodeFill)' : (isHover ? primary : mutedStroke)} strokeWidth={isSelected ? 2 : 1.5} />
              {/* inner dot */}
              <circle r={Math.max(6, dotRadius - 14)} fill={isSelected ? '#ffffff' : (isHover ? primary : 'transparent')} opacity={isSelected ? 0.9 : (isHover ? 0.35 : 0)} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={600}
                fill={isSelected ? '#ffffff' : '#1f2937'}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-between">
        <div className="thai-text text-muted-foreground text-sm">เคล็ดลับ: แตะค้างแล้วลากผ่านจุดตามลำดับ</div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => {
            setSelected(prev => prev.slice(0, -1));
            const s = new Set(selectedSetRef.current);
            s.delete(selected[selected.length - 1]);
            selectedSetRef.current = s;
          }}>ย้อนกลับ</Button>
          <Button type="button" variant="outline" size="sm" onClick={reset}>เริ่มใหม่</Button>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {selected.length ? `เลือกจุดที่ ${selected[selected.length - 1]}` : 'ยังไม่เลือกจุด'}
      </div>
    </div>
  );
}

export function NewJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const settings = useRepairStore(state => state.settings);
  const customers = useRepairStore(state => state.customers);
  const createCustomer = useRepairStore(state => state.createCustomer);
  const createJob = useRepairStore(state => state.createJob);

  const defaultWarrantyDays = settings?.warrantyDefaultDays ?? 30;

  const form = useForm({
    // Cast to any to avoid type mismatch between local RHF generics and Form wrapper types
    resolver: zodResolver(newJobSchema) as any,
    defaultValues: {
      customer: { name: '', phone: '', lineId: '', altPhone: '' },
      device: { brand: '', model: '', color: '', imei: '', serial: '' },
      lock: { type: 'none' as LockType, note: '' },
      details: { issueDesc: '', accessories: '', preCheck: '' },
      pricing: { estimateParts: 0, estimateLabor: 0, deposit: 0 },
      schedule: { dueAt: '', warrantyDays: defaultWarrantyDays, technician: '' }
    }
  });

  const pricing = form.watch('pricing');
  const lockType = form.watch('lock.type');
  const estimateTotal = useMemo(() => {
    const parts = Number(pricing?.estimateParts || 0);
    const labor = Number(pricing?.estimateLabor || 0);
    return parts + labor;
  }, [pricing]);

  const onSubmit = async (data: NewJobForm) => {
    try {
      // Find or create customer by phone
      const existing = customers.find(c => c.phone === data.customer.phone);
      const customer = existing || await createCustomer({
        name: data.customer.name,
        phone: data.customer.phone,
        lineId: data.customer.lineId || '',
        altPhone: data.customer.altPhone || ''
      });

      const total = Number(data.pricing.estimateParts) + Number(data.pricing.estimateLabor);

      const job = await createJob({
        customerId: customer.id,
        brand: data.device.brand,
        model: data.device.model,
        color: data.device.color,
        imei: data.device.imei,
        serial: data.device.serial,
        lockType: data.lock.type,
        lockNote: data.lock.note,
        photos: [],
        issueDesc: data.details.issueDesc,
        accessories: data.details.accessories || '',
        preCheck: data.details.preCheck || '',
        feeParts: Number(data.pricing.estimateParts) || 0,
        feeLabor: Number(data.pricing.estimateLabor) || 0,
        costParts: 0,
        costLabor: 0,
        deposit: Number(data.pricing.deposit) || 0,
        total,
        profit: total, // initial – costs unknown yet
        status: 'received',
        paymentStatus: 'unpaid',
        technician: data.schedule.technician || undefined,
        receivedAt: new Date(),
        dueAt: data.schedule.dueAt ? new Date(data.schedule.dueAt) : undefined,
        warrantyDays: Number(data.schedule.warrantyDays) || defaultWarrantyDays,
        pdpaConsentAt: undefined,
        customerSign: undefined,
        staffSign: undefined
      });

      toast({
        title: 'บันทึกงานสำเร็จ',
        description: `สร้างงานหมายเลข ${job.id} เรียบร้อย`,
      });
      navigate('/dashboard');
    } catch (e) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถบันทึกงานได้', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Blue gradient header consistent with system */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-5 md:p-6 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold thai-text">แจ้งซ่อมใหม่</div>
              <div className="text-white/90 thai-text text-sm md:text-base">สร้างงานซ่อมใหม่สำหรับลูกค้า</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าแรก
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <Form {...(form as any)}>
        <form id="new-job-form" onSubmit={(form as any).handleSubmit(onSubmit as any)} className="space-y-8">
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-lg font-semibold">ใบแจ้งซ่อมมือถือ</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
            {/* ข้อมูลลูกค้า */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">ข้อมูลลูกค้า</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="customer.name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ชื่อลูกค้า *</FormLabel>
                    <FormControl>
                      <Input autoFocus autoComplete="name" className="h-11" placeholder="เช่น คุณสมชาย" {...field} />
                    </FormControl>
                    <FormMessage className="thai-text" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="customer.phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">เบอร์โทรศัพท์ *</FormLabel>
                    <FormControl>
                      <Input inputMode="tel" autoComplete="tel" className="h-11" placeholder="เช่น 0891234567" {...field} />
                    </FormControl>
                    <FormMessage className="thai-text" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="customer.altPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">เบอร์โทรสำรอง (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input className="h-11" inputMode="tel" placeholder="เช่น 0891234567" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            <Separator />

            {/* ข้อมูลอุปกรณ์ */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">ข้อมูลอุปกรณ์</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="device.brand" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ยี่ห้อ *</FormLabel>
                    <FormControl>
                      <Input className="h-11" list="brand-suggestions" placeholder="เช่น iPhone, Samsung" {...field} />
                    </FormControl>
                    <datalist id="brand-suggestions">
                      <option value="Apple" />
                      <option value="Samsung" />
                      <option value="OPPO" />
                      <option value="vivo" />
                      <option value="Xiaomi" />
                      <option value="Huawei" />
                    </datalist>
                    <FormMessage className="thai-text" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="device.model" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">รุ่น *</FormLabel>
                    <FormControl>
                      <Input className="h-11" list="model-suggestions" placeholder="เช่น 11, A15" {...field} />
                    </FormControl>
                    <datalist id="model-suggestions">
                      <option value="iPhone 11" />
                      <option value="iPhone 12" />
                      <option value="Galaxy S23" />
                      <option value="Galaxy A15" />
                      <option value="Redmi Note" />
                    </datalist>
                    <FormMessage className="thai-text" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="device.color" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">สี (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="device.imei" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">IMEI</FormLabel>
                    <FormControl>
                      <Input className="h-11" inputMode="numeric" placeholder="15–17 หลัก" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="device.serial" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">Serial</FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            <Separator />

            {/* รหัสล็อกหน้าจอ */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">รหัสล็อกหน้าจอ</h3>
              <FormField control={form.control} name="lock.type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="thai-text">เลือกประเภท</FormLabel>
                  <FormControl>
                    <ToggleGroup type="single" value={field.value} onValueChange={(v) => {
                      if (!v) return; field.onChange(v as LockType); if (v === 'none') form.setValue('lock.note', '');
                    }} className="justify-start">
                      <ToggleGroupItem value="none"><XIcon className="w-4 h-4 mr-2" /> ไม่มี</ToggleGroupItem>
                      <ToggleGroupItem value="pin"><KeyRound className="w-4 h-4 mr-2" /> PIN/รหัสผ่าน</ToggleGroupItem>
                      <ToggleGroupItem value="pattern"><Grid3x3 className="w-4 h-4 mr-2" /> Pattern Lock</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )} />
              {lockType !== 'none' && (
                <FormField control={form.control} name="lock.note" render={({ field }) => (
                  <FormItem>
                    {lockType === 'pin' ? (
                      <>
                        <FormLabel className="thai-text">กรอกรหัสผ่าน (ตัวเลข/ตัวอักษร)</FormLabel>
                        <FormControl>
                          <Input className="h-11" placeholder="เช่น 2580 หรือ Abc@1234" {...field} />
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <FormLabel className="thai-text">เลือกแพทเทิร์น โดยกดจุดเรียงตามลำดับ</FormLabel>
                        <FormControl>
                          <div className="py-2">
                            <PatternLock
                              size={340}
                              onComplete={(path) => {
                                // Save as dash-separated string: "1-2-3"
                                field.onChange(path.join('-'));
                              }}
                              showOrderText
                            />
                          </div>
                        </FormControl>
                      </>
                    )}
                  </FormItem>
                )} />
              )}
            </div>

            <Separator />

            {/* อาการเสีย */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">อาการเสีย / รายละเอียด</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="details.issueDesc" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-text">รายละเอียดอาการเสีย *</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-24" rows={4} placeholder="เช่น จอแตก เครื่องดับเอง ชาร์จไม่เข้า" {...field} />
                    </FormControl>
                    <FormMessage className="thai-text" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="details.accessories" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">อุปกรณ์ที่ฝากมาด้วย</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="เช่น กล่อง ซิม เคส เมมการ์ด" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="details.preCheck" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">การประเมินเบื้องต้น</FormLabel>
                    <FormControl>
                      <Input className="h-11" placeholder="เช่น เปลี่ยนแบต เปลี่ยนจอ" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            <Separator />

            {/* ประเมินค่าใช้จ่าย */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">ประเมินค่าใช้จ่าย</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="pricing.estimateParts" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">สินค้า (บาท)</FormLabel>
                    <FormControl>
                      <Input className="h-11" type="number" min={0} step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="pricing.estimateLabor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ค่าแรง (บาท)</FormLabel>
                    <FormControl>
                      <Input className="h-11" type="number" min={0} step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="pricing.deposit" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">มัดจำ (บาท)</FormLabel>
                    <FormControl>
                      <Input className="h-11" type="number" min={0} step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <div>
                  <Label className="thai-text">รวมโดยประมาณ</Label>
                  <Input className="h-11" readOnly value={estimateTotal} />
                </div>
              </div>
            </div>

            <Separator />

            {/* กำหนดการ */}
            <div className="space-y-4">
              <h3 className="thai-text font-medium text-base text-foreground">กำหนดการ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="schedule.dueAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ส่งงานภายใน</FormLabel>
                    <FormControl>
                      <Input className="h-11" type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="schedule.warrantyDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ประกันงาน (วัน)</FormLabel>
                    <FormControl>
                      <Input className="h-11" type="number" min={0} step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="schedule.technician" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-text">ช่างผู้ดูแล (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-10 bg-white border-t pt-4 pb-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => navigate('/jobs')}>
              ยกเลิก
            </Button>
            <Button type="submit" className="rounded-lg">
              บันทึกการแจ้งซ่อม
            </Button>
          </div>
        </div>
      </form>
      </Form>
      </div>
    </div>
  );
}

export default NewJob;


