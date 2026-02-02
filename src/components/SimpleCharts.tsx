import React, { useState } from "react";

export const SimpleBarChart = ({ data, color = "#3b82f6" }: { data: { label: string, value: number }[], color?: string }) => {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div style={{ margin: "16px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#444" }} title={d.label}>{d.label}</div>
          <div style={{ flex: 2, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
            <div title={`${d.value}`} style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ width: 30, fontSize: 12, textAlign: "right", fontWeight: 600, color: "#333" }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
};

export const SimpleDonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let currentAngle = 0;
  const gradient = data.map(d => {
    const start = currentAngle;
    const degree = (d.value / total) * 360;
    currentAngle += degree;
    return `${d.color} ${start}deg ${currentAngle}deg`;
  }).join(", ");

  const background = data.length ? `conic-gradient(${gradient})` : "#eee";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, margin: "16px 0" }}>
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: background,
        position: "relative",
        flexShrink: 0
      }}>
        <div style={{ position: "absolute", inset: 20, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
           <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>{data.reduce((acc, curr) => acc + curr.value, 0)}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
            <span style={{ color: "#666" }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: "#333" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SimpleLineChart = ({ 
  data, 
  height = 300 
}: { 
  data: { label: string, color: string, points: { date: string, value: number }[] }[], 
  height?: number 
}) => {
  const [hovered, setHovered] = useState<{ x: number; y: number; value: number } | null>(null);

  if (!data.length || !data.some(s => s.points.length)) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>No trend data available</div>;
  }

  // Flatten points to find min/max
  const allPoints = data.flatMap(s => s.points);
  const uniqueDates = Array.from(new Set(allPoints.map(p => p.date))).sort();
  
  if (uniqueDates.length === 0) return null;

  const maxVal = Math.max(...allPoints.map(p => p.value)) * 1.1 || 5; // Add 10% headroom

  // SVG Dimensions & Padding
  const svgW = 500;
  const svgH = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;

  const getX = (date: string) => {
    const index = uniqueDates.indexOf(date);
    return padding.left + (index / (uniqueDates.length - 1 || 1)) * chartW;
  };

  const getY = (val: number) => {
    return padding.top + chartH - (val / maxVal) * chartH;
  };

  return (
    <div style={{ margin: "16px 0", width: "100%" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: height, overflow: "visible" }}>
        {/* Y Axis Grid & Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const val = maxVal * t;
          const y = getY(val);
          return (
            <g key={t}>
              <line x1={padding.left} y1={y} x2={svgW - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#999">
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {uniqueDates.map((date, i) => {
          // Show fewer labels if too many
          const step = Math.ceil(uniqueDates.length / 7);
          if (i % step !== 0 && i !== uniqueDates.length - 1) return null;
          
          const x = getX(date);
          const d = new Date(date);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          
          return (
            <text key={date} x={x} y={svgH - 5} textAnchor="middle" fontSize="12" fill="#999">
              {label}
            </text>
          );
        })}

        {/* Lines */}
        {data.map((series, i) => {
          const sorted = [...series.points].sort((a, b) => a.date.localeCompare(b.date));
          if (sorted.length === 0) return null;

          const d = sorted.map((p, idx) => 
            `${idx === 0 ? 'M' : 'L'} ${getX(p.date)} ${getY(p.value)}`
          ).join(" ");
          
          return (
            <g key={i}>
              <path 
                d={d} 
                fill="none" 
                stroke={series.color} 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {sorted.map(p => (
                <circle 
                  key={p.date} 
                  cx={getX(p.date)} 
                  cy={getY(p.value)} 
                  r="6" 
                  fill="white" 
                  stroke={series.color} 
                  strokeWidth="2" 
                  onMouseEnter={() => setHovered({ x: getX(p.date), y: getY(p.value), value: p.value })}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", transition: "r 0.2s" }}
                />
              ))}
            </g>
          );
        })}
        {hovered && (
          <g pointerEvents="none">
            <rect x={hovered.x - 20} y={hovered.y - 35} width="40" height="24" rx="4" fill="#1f2937" />
            <text x={hovered.x} y={hovered.y - 19} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
              {hovered.value}
            </text>
            <path d={`M${hovered.x - 6},${hovered.y - 11} L${hovered.x + 6},${hovered.y - 11} L${hovered.x},${hovered.y - 5} Z`} fill="#1f2937" />
          </g>
        )}
      </svg>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginTop: 8 }}>
        {data.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SimpleStackedBarChart = ({ 
  data, 
  height = 300,
  colors = {}
}: { 
  data: { label: string, segments: { key: string, value: number }[] }[], 
  height?: number,
  colors?: Record<string, string>
}) => {
  const [hovered, setHovered] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No data</div>;

  // Calculate max total value for scaling
  const maxVal = Math.max(...data.map(d => d.segments.reduce((acc, s) => acc + s.value, 0))) * 1.1 || 1;
  
  // Default colors
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const getSegmentColor = (key: string, idx: number) => colors[key] || defaultColors[idx % defaultColors.length];

  const svgW = 800;
  const svgH = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;
  
  const barWidth = Math.min(40, (chartW / data.length) * 0.6);

  return (
    <div style={{ margin: "16px 0", width: "100%" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height, overflow: "visible" }}>
        {/* Y Axis */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const val = maxVal * t;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return (
            <g key={t}>
              <line x1={padding.left} y1={y} x2={svgW - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#999">{Math.round(val)}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + (i * (chartW / data.length)) + (chartW / data.length - barWidth) / 2;
          let currentY = padding.top + chartH;
          
          return (
            <g key={i}>
              {d.segments.map((seg, segIdx) => {
                const h = (seg.value / maxVal) * chartH;
                currentY -= h;
                return (
                  <rect 
                    key={segIdx} 
                    x={x} 
                    y={currentY} 
                    width={barWidth} 
                    height={h} 
                    fill={getSegmentColor(seg.key, segIdx)}
                    onMouseEnter={() => setHovered({ x: x + barWidth / 2, y: currentY, value: seg.value, label: seg.key })}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              <text x={x + barWidth / 2} y={padding.top + chartH + 20} textAnchor="middle" fontSize="11" fill="#666">
                {d.label}
              </text>
            </g>
          );
        })}
        {hovered && (
          <g pointerEvents="none" transform={`translate(${hovered.x}, ${hovered.y - 10})`}>
            <rect x="-30" y="-24" width="60" height="20" rx="4" fill="#1f2937" />
            <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" dominantBaseline="middle">
              {hovered.value}
            </text>
            <path d="M-4,-4 L4,-4 L0,2 Z" fill="#1f2937" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const SimplePieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let currentAngle = 0;
  const gradient = data.map(d => {
    const start = currentAngle;
    const degree = (d.value / total) * 360;
    currentAngle += degree;
    return `${d.color} ${start}deg ${currentAngle}deg`;
  }).join(", ");

  const background = data.length ? `conic-gradient(${gradient})` : "#eee";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, margin: "16px 0" }}>
      <div style={{
        width: 150, height: 150, borderRadius: "50%",
        background: background,
        flexShrink: 0
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, background: d.color, borderRadius: 2 }} />
            <span style={{ color: "#666" }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: "#333" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SimpleGroupedBarChart = ({ 
  data, 
  height = 300,
  colors = {},
  minGroupWidth = 100
}: { 
  data: { label: string, segments: { key: string, value: number }[] }[], 
  height?: number,
  colors?: Record<string, string>,
  minGroupWidth?: number
}) => {
  const [hovered, setHovered] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No data</div>;

  const maxVal = Math.max(...data.flatMap(d => d.segments.map(s => s.value))) * 1.1 || 1;
  
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const getSegmentColor = (key: string, idx: number) => colors[key] || defaultColors[idx % defaultColors.length];

  // Dynamic width calculation for scrollability
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const svgW = Math.max(800, data.length * minGroupWidth + padding.left + padding.right);
  const svgH = height;
  const chartW = svgW - padding.left - padding.right;
  const chartH = svgH - padding.top - padding.bottom;
  
  const groupWidth = chartW / data.length;
  const maxSegments = Math.max(...data.map(d => d.segments.length)) || 1;
  const barWidth = (groupWidth * 0.8) / maxSegments;
  const groupPadding = (groupWidth * 0.2) / 2;

  return (
    <div style={{ margin: "16px 0", width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: `${svgW}px`, height, overflow: "visible" }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const val = maxVal * t;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return (
            <g key={t} style={{ pointerEvents: "none" }}>
              <line x1={padding.left} y1={y} x2={svgW - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              {/* Only show Y-axis labels on the left, maybe sticky in a real implementation, but here just static */}
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#999" style={{ pointerEvents: "none" }}>{Math.round(val)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const groupX = padding.left + (i * groupWidth) + groupPadding;
          return (
            <g key={i}>
              {d.segments.map((seg, segIdx) => {
                const h = (seg.value / maxVal) * chartH;
                const y = padding.top + chartH - h;
                const x = groupX + (segIdx * barWidth);
                return (
                  <rect 
                    key={segIdx} 
                    x={x} 
                    y={y} 
                    width={barWidth} 
                    height={h} 
                    fill={getSegmentColor(seg.key, segIdx)}
                    onMouseEnter={() => setHovered({ x: x + barWidth / 2, y: y, value: seg.value, label: seg.key })}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              <text x={padding.left + (i * groupWidth) + groupWidth / 2} y={padding.top + chartH + 20} textAnchor="middle" fontSize="11" fill="#666">
                {d.label}
              </text>
            </g>
          );
        })}
        {hovered && (
          <g pointerEvents="none" transform={`translate(${hovered.x}, ${hovered.y - 10})`}>
            <rect x="-30" y="-24" width="60" height="20" rx="4" fill="#1f2937" />
            <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" dominantBaseline="middle">
              {hovered.value}
            </text>
            <path d="M-4,-4 L4,-4 L0,2 Z" fill="#1f2937" />
          </g>
        )}
      </svg>
    </div>
  );
};