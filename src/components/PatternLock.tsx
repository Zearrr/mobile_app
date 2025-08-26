import React, { useMemo, useRef, useState } from 'react';

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
        if (dist <= dotRadius) {
          candidates.push({ id: n.id, t });
        }
      });
      // Sort by t to get the closest one
      candidates.sort((a, b) => a.t - b.t);
      if (candidates.length > 0) {
        addId(candidates[0].id);
      }
    }
  };

  const onPointerUp: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    svg.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setPointer(null);
    setHoverId(null);

    if (selected.length > 0 && onComplete) {
      onComplete(selected);
      if (autoResetOnComplete) {
        setTimeout(reset, 1000);
      }
    }
  };

  const onPointerLeave: React.PointerEventHandler<SVGSVGElement> = () => {
    setIsDragging(false);
    setPointer(null);
    setHoverId(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        style={{ touchAction: 'none' }}
        className="select-none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background grid lines */}
        <g stroke="#e5e7eb" strokeWidth="1" fill="none">
          {nodes.map((n, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            if (col < 2) {
              const next = nodes[i + 1];
              return <line key={`h-${i}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} />;
            }
            if (row < 2) {
              const next = nodes[i + 3];
              return <line key={`v-${i}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} />;
            }
            return null;
          })}
        </g>

        {/* Connection lines */}
        {selected.length > 1 && (
          <g stroke="#3b82f6" strokeWidth="3" fill="none" filter="url(#glow)">
            {selected.slice(1).map((id, i) => {
              const prev = nodes[selected[i] - 1];
              const curr = nodes[id - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={curr.x}
                  y2={curr.y}
                />
              );
            })}
          </g>
        )}

        {/* Dots */}
        {nodes.map((n) => {
          const isSelected = selectedSetRef.current.has(n.id);
          const isHovered = hoverId === n.id;
          const order = selected.indexOf(n.id);
          
          return (
            <g key={n.id}>
              {/* Background circle */}
              <circle
                cx={n.x}
                cy={n.y}
                r={dotRadius}
                fill={isSelected ? '#3b82f6' : isHovered ? '#dbeafe' : '#f3f4f6'}
                stroke={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isSelected || isHovered ? '3' : '2'}
                filter={isSelected ? 'url(#glow)' : undefined}
              />
              
              {/* Order number */}
              {showOrderText && isSelected && order >= 0 && (
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {order + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* Pointer line */}
        {isDragging && pointer && selected.length > 0 && (
          <g stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6">
            <line
              x1={nodes[selected[selected.length - 1] - 1].x}
              y1={nodes[selected[selected.length - 1] - 1].y}
              x2={pointer.x}
              y2={pointer.y}
            />
          </g>
        )}
      </svg>

      {/* Reset button */}
      {selected.length > 0 && (
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors thai-text"
        >
          ล้างรูปแบบ
        </button>
      )}
    </div>
  );
}

export default PatternLock;
