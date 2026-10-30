import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

// ================= SHARED CHART TOKENS =================
// Ordinal emerald ramp (light → dark), validated for ordered stages on a light surface.
export const ORDINAL_EMERALD = ['#10b981', '#059669', '#047857', '#065f46'];
// Wider-spaced 3-step ramp for charts where segments sit side by side (e.g. donut).
export const ORDINAL_EMERALD_3 = ['#10b981', '#047857', '#064e3b'];
export const SERIES_PRIMARY = '#059669';
export const TRACK = '#eef2f6';
export const MUTED_MARK = '#94a3b8';
export const STATUS = {
  good: '#059669',
  warning: '#d97706',
  critical: '#e11d48'
};

export const formatINR = (value) => {
  const n = Number(value) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

// ================= CARD WRAPPER =================
export function ChartCard({ title, subtitle, icon: Icon, action, className = '', children }) {
  return (
    <section
      className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0 flex items-start gap-3">
          {Icon && (
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
              <Icon className="w-[18px] h-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

// ================= TOOLTIP =================
function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div
      className="pointer-events-none absolute z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] shadow-lg whitespace-nowrap"
      style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
    >
      <p className="font-semibold">{tip.title}</p>
      {tip.lines?.map((l, i) => (
        <p key={i} className="text-slate-300">{l}</p>
      ))}
    </div>
  );
}

function useTooltip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, title, lines) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, title, lines });
  };
  const hide = () => setTip(null);
  return { ref, tip, show, hide };
}

// ================= DONUT (part-to-whole, ≤ 6 segments) =================
export function DonutChart({ data, size = 168, thickness = 22, centerLabel, centerValue, onSegmentClick, selectedLabel }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = data.filter((d) => d.value > 0).length > 1 ? 3 : 0;

  let offset = 0;
  const arcs = data.map((d) => {
    const len = total ? (d.value / total) * c : 0;
    const arc = { ...d, dash: Math.max(len - gap, 0), offset };
    offset += len;
    return arc;
  });

  const shown = active !== null ? data[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={thickness} />
          {arcs.map((a, i) =>
            a.dash > 0 ? (
              <circle
                key={`${a.label}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={active === i ? thickness + 4 : thickness}
                strokeDasharray={`${a.dash} ${c - a.dash}`}
                strokeDashoffset={-a.offset}
                opacity={
                  active !== null ? (active === i ? 1 : 0.35) : selectedLabel && selectedLabel !== a.label ? 0.35 : 1
                }
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={onSegmentClick ? () => onSegmentClick(a) : undefined}
              />
            ) : null
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 leading-none">
            {shown ? shown.value : centerValue ?? total}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 max-w-[90px] leading-tight">
            {shown ? shown.label : centerLabel}
          </span>
          {shown && total > 0 && (
            <span className="text-[11px] font-semibold text-slate-700 mt-0.5">
              {Math.round((shown.value / total) * 100)}%
            </span>
          )}
        </div>
      </div>

      <ul className="w-full space-y-1.5 text-xs">
        {data.map((d, i) => {
          const content = (
            <>
              <span className="flex items-center gap-2 text-slate-600 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{d.value}</span>
            </>
          );
          const rowClass = `w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition ${
            active === i || selectedLabel === d.label ? 'bg-slate-50' : ''
          } ${selectedLabel === d.label ? 'ring-1 ring-emerald-500/40' : ''}`;
          return (
            <li key={`${d.label}-${i}`} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              {onSegmentClick ? (
                <button
                  type="button"
                  onClick={() => onSegmentClick(d)}
                  aria-pressed={selectedLabel === d.label}
                  className={`${rowClass} text-left hover:bg-slate-50`}
                >
                  {content}
                </button>
              ) : (
                <div className={`${rowClass} cursor-default`}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ================= HORIZONTAL BAR (single series, magnitude by category) =================
export function HBarChart({ data, color = SERIES_PRIMARY, valueFormat = (v) => v, emptyText = 'No data yet.', max: fixedMax, onBarClick }) {
  const { ref, tip, show, hide } = useTooltip();
  const max = fixedMax || Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-500">{emptyText}</p>;
  }

  return (
    <div ref={ref} className="relative space-y-2.5" onMouseLeave={hide}>
      {data.map((d, i) => (
        <div
          key={`${d.label}-${i}`}
          className={`group ${onBarClick ? 'cursor-pointer' : 'cursor-default'}`}
          onMouseMove={(e) => show(e, d.label, [].concat(d.tooltip || valueFormat(d.value)))}
          onClick={onBarClick ? () => onBarClick(d) : undefined}
          role={onBarClick ? 'button' : undefined}
          tabIndex={onBarClick ? 0 : undefined}
          onKeyDown={onBarClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onBarClick(d)) : undefined}
        >
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-slate-600 truncate pr-2 group-hover:text-slate-900 transition">{d.label}</span>
            <span className="font-bold text-slate-900 tabular-nums">{valueFormat(d.value)}</span>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: TRACK }}>
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color || color }}
            />
          </div>
        </div>
      ))}
      <Tooltip tip={tip} />
    </div>
  );
}

// ================= BULLET BARS (progress of value against its own target) =================
export function BulletList({ data, valueFormat = formatINR }) {
  const { ref, tip, show, hide } = useTooltip();
  return (
    <div ref={ref} className="relative space-y-3" onMouseLeave={hide}>
      {data.map((d, i) => {
        const pct = d.target ? Math.min((d.value / d.target) * 100, 100) : 0;
        return (
          <div
            key={d.id || `${d.label}-${i}`}
            className="group cursor-default"
            onMouseMove={(e) =>
              show(e, d.label, [
                `Disbursed: ${valueFormat(d.value)}`,
                `Sanctioned: ${valueFormat(d.target)}`,
                `Utilisation: ${Math.round(pct)}%`
              ])
            }
          >
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-slate-700 font-medium truncate pr-2">{d.label}</span>
              <span className="text-slate-500 tabular-nums shrink-0">
                <strong className="text-slate-900">{valueFormat(d.value)}</strong> / {valueFormat(d.target)}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full" style={{ background: TRACK }}>
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                style={{ width: `${pct}%`, background: SERIES_PRIMARY }}
              />
            </div>
          </div>
        );
      })}
      <Tooltip tip={tip} />
    </div>
  );
}

// ================= FUNNEL / PIPELINE (ordered stages) =================
export function PipelineChart({ stages, onStageClick }) {
  const { ref, tip, show, hide } = useTooltip();
  const max = Math.max(...stages.map((s) => s.value), 1);
  const total = stages.reduce((sum, s) => sum + s.value, 0);

  return (
    <div ref={ref} className="relative space-y-2" onMouseLeave={hide}>
      {stages.map((s, i) => (
        <button
          type="button"
          key={`${s.label}-${i}`}
          onClick={() => onStageClick?.(s)}
          onMouseMove={(e) =>
            show(e, s.label, [`${s.value} application${s.value === 1 ? '' : 's'}`, total ? `${Math.round((s.value / total) * 100)}% of intake` : ''])
          }
          className="w-full flex items-center gap-3 group text-left"
        >
          <span className="w-24 sm:w-36 shrink-0 text-[12px] leading-tight text-slate-600 group-hover:text-slate-900 transition">
            {s.label}
          </span>
          <span className="flex-1 h-7 rounded-md relative" style={{ background: TRACK }}>
            <span
              className="absolute inset-y-0 left-0 rounded-md transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${Math.max((s.value / max) * 100, s.value ? 6 : 0)}%`, background: s.color }}
            />
          </span>
          <span className="w-6 text-right text-xs font-bold text-slate-900 tabular-nums">{s.value}</span>
        </button>
      ))}
      <Tooltip tip={tip} />
    </div>
  );
}

// ================= AREA CHART with crosshair (change over time) =================
export function AreaChart({ points, height = 170, valueFormat = (v) => v, seriesLabel = 'Value' }) {
  const wrapRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  // Draw at the container's real pixel width so axis text stays legible on phones
  const [width, setWidth] = useState(560);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(Math.round(entry.contentRect.width), 240)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [points.length >= 2]);
  const pad = { top: 24, right: 16, bottom: 26, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const niceMax = Math.ceil(max / 2) * 2 || 2;

  if (points.length < 2) {
    return <p className="py-8 text-center text-xs text-slate-500">Not enough history to plot a trend yet.</p>;
  }

  const x = (i) => pad.left + (i / (points.length - 1)) * innerW;
  const y = (v) => pad.top + innerH - (v / niceMax) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;
  const ticks = [0, niceMax / 2, niceMax];
  const labelEvery = Math.ceil(points.length / Math.max(Math.floor(innerW / 80), 2));

  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((px - pad.left) / innerW) * (points.length - 1));
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const hp = hoverIdx !== null ? points[hoverIdx] : null;
  const last = points[points.length - 1];

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={SERIES_PRIMARY} stopOpacity="0.22" />
            <stop offset="100%" stopColor={SERIES_PRIMARY} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {t}
            </text>
          </g>
        ))}

        {/* Labels counted back from the latest point so the newest month is always labelled without collisions */}
        {points.map((p, i) =>
          (points.length - 1 - i) % labelEvery === 0 ? (
            <text
              key={p.label}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              fontSize="11"
              fill="#64748b"
            >
              {p.label}
            </text>
          ) : null
        )}

        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke={SERIES_PRIMARY} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Direct label on the latest value */}
        {!hp && (
          <g>
            <circle cx={x(points.length - 1)} cy={y(last.value)} r="4" fill={SERIES_PRIMARY} stroke="#fff" strokeWidth="2" />
            <text x={x(points.length - 1) - 10} y={y(last.value) - 10} textAnchor="end" fontSize="12" fontWeight="700" fill="#0f172a">
              {valueFormat(last.value)}
            </text>
          </g>
        )}

        {hp && (
          <g>
            <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={pad.top} y2={pad.top + innerH} stroke="#94a3b8" strokeWidth="1" />
            <circle cx={x(hoverIdx)} cy={y(hp.value)} r="5" fill={SERIES_PRIMARY} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] shadow-lg whitespace-nowrap"
          style={{
            left: `${(x(hoverIdx) / width) * 100}%`,
            top: 0,
            transform: `translateX(${hoverIdx > points.length / 2 ? 'calc(-100% - 10px)' : '10px'})`
          }}
        >
          <p className="font-semibold">{hp.label}</p>
          <p className="text-slate-300">
            {seriesLabel}: {valueFormat(hp.value)}
          </p>
          {hp.note && <p className="text-slate-300">{hp.note}</p>}
        </div>
      )}
    </div>
  );
}

// ================= PROGRESS RING (single headline %) =================
export function ProgressRing({ value, size = 112, thickness = 10, color = SERIES_PRIMARY, label }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900 leading-none">{Math.round(pct)}%</span>
        {label && <span className="text-[11px] text-slate-500 mt-1">{label}</span>}
      </div>
    </div>
  );
}

// ================= WORKFLOW DIAGRAM (what this dashboard does) =================
export function WorkflowDiagram({ steps }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-0 items-stretch">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const Wrapper = s.onClick ? 'button' : 'div';
        return (
          <div key={s.title} className="flex items-stretch">
            <Wrapper
              type={s.onClick ? 'button' : undefined}
              onClick={s.onClick}
              className={`flex-1 text-left p-3.5 rounded-xl border transition group ${
                s.state === 'done'
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : s.state === 'active'
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/15'
                  : 'bg-slate-50 border-slate-200'
              } ${s.onClick ? 'hover:border-emerald-400 hover:shadow-sm cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    s.state === 'pending' ? 'bg-slate-200/70 text-slate-500' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                </span>
                {s.metric !== undefined && (
                  <span className="text-sm font-black text-slate-900 tabular-nums">{s.metric}</span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900">{s.title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
            </Wrapper>
            {i < steps.length - 1 && (
              <div className="hidden lg:flex items-center px-1 text-slate-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================= LINE (2–4 series over time, shared y-axis) =================
export function LineChart({ points, series, height = 200, emptyText = 'No activity yet.', onPointClick }) {
  const wrapRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [width, setWidth] = useState(560);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(Math.round(entry.contentRect.width), 240)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasData = points.some((p) => series.some((s) => p[s.key] > 0));
  const pad = { top: 16, right: 16, bottom: 26, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...points.flatMap((p) => series.map((s) => p[s.key] || 0)), 1);
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const x = (i) => pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => pad.top + innerH - (v / niceMax) * innerH;
  const ticks = [0, niceMax / 2, niceMax];
  const labelEvery = Math.ceil(points.length / Math.max(Math.floor(innerW / 70), 2));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const idx = points.length === 1 ? 0 : Math.round(((px - pad.left) / innerW) * (points.length - 1));
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-[12px] text-slate-600">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      {!hasData ? (
        <p className="py-10 text-center text-xs text-slate-500">{emptyText}</p>
      ) : (
        <>
          <svg
            width={width}
            height={height}
            className={`block ${onPointClick ? 'cursor-pointer' : ''}`}
            onMouseMove={onMove}
            onMouseLeave={() => setHoverIdx(null)}
            onClick={onPointClick && hoverIdx !== null ? () => onPointClick(points[hoverIdx]) : undefined}
            role="img"
            aria-label={series.map((s) => `${s.label}: ${points.map((p) => `${p.label} ${p[s.key] || 0}`).join(', ')}`).join('. ')}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? '' : '3 4'} />
                <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">
                  {Math.round(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) =>
              (points.length - 1 - i) % labelEvery === 0 ? (
                <text
                  key={p.label}
                  x={x(i)}
                  y={height - 6}
                  textAnchor={points.length > 1 && i === 0 ? 'start' : points.length > 1 && i === points.length - 1 ? 'end' : 'middle'}
                  fontSize="11"
                  fill="#64748b"
                >
                  {p.label}
                </text>
              ) : null
            )}
            {hoverIdx !== null && (
              <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={pad.top} y2={pad.top + innerH} stroke="#94a3b8" strokeDasharray="3 3" />
            )}
            {series.map((s) => (
              <g key={s.key}>
                <path
                  d={points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p[s.key] || 0)}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((p, i) =>
                  hoverIdx === i || points.length <= 12 ? (
                    <circle
                      key={i}
                      cx={x(i)}
                      cy={y(p[s.key] || 0)}
                      r={hoverIdx === i ? 5 : 3}
                      fill={hoverIdx === i ? s.color : '#fff'}
                      stroke={s.color}
                      strokeWidth="2"
                    />
                  ) : null
                )}
              </g>
            ))}
          </svg>
          {hoverIdx !== null && (
            <div
              className="pointer-events-none absolute z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] shadow-lg whitespace-nowrap"
              style={{
                left: x(hoverIdx),
                top: 28,
                transform: `translateX(${hoverIdx > points.length / 2 ? 'calc(-100% - 10px)' : '10px'})`
              }}
            >
              <p className="font-semibold">{points[hoverIdx].label}</p>
              {series.map((s) => (
                <p key={s.key} className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                  {s.label}: <strong className="text-white">{points[hoverIdx][s.key] || 0}</strong>
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ================= STACKED BAR (part-to-whole per category, horizontal) =================
export function StackedBarChart({ rows, series, onRowClick, onSegmentClick, emptyText = 'No data yet.' }) {
  const { ref, tip, show, hide } = useTooltip();
  if (rows.length === 0) return <p className="py-8 text-center text-xs text-slate-500">{emptyText}</p>;

  return (
    <div ref={ref} className="relative" onMouseLeave={hide}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[12px] text-slate-600">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="space-y-3">
        {rows.map((row) => {
          const total = series.reduce((sum, s) => sum + (row.values[s.key] || 0), 0);
          const lines = series.map((s) => `${s.label}: ${row.values[s.key] || 0}`);
          return (
            <div key={row.label}>
              <button
                type="button"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                disabled={!onRowClick}
                className="w-full flex items-center justify-between text-[12px] mb-1 text-left disabled:cursor-default"
              >
                <span className="font-medium text-slate-700 truncate pr-2 hover:text-slate-900">{row.label}</span>
                <span className="text-slate-500 tabular-nums shrink-0">{row.caption ?? total}</span>
              </button>
              <div className="flex h-3 w-full gap-[2px] rounded-full overflow-hidden" style={{ background: TRACK }}>
                {series.map((s) => {
                  const v = row.values[s.key] || 0;
                  return v > 0 ? (
                    <div
                      key={s.key}
                      className="h-full transition-all duration-500 hover:brightness-110 cursor-pointer"
                      style={{ width: `${(v / (total || 1)) * 100}%`, background: s.color }}
                      onMouseMove={(e) => show(e, row.label, lines)}
                      onClick={onSegmentClick ? () => onSegmentClick(row, s) : onRowClick ? () => onRowClick(row) : undefined}
                    />
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Tooltip tip={tip} />
    </div>
  );
}
