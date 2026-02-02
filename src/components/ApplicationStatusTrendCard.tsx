import { useState, useEffect } from "react";
import { fetchApplicationStatusTrend, AppStatusTrendItem } from "../services/insights.api";
import { SimpleGroupedBarChart } from "./SimpleCharts";

export const ApplicationStatusTrendCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [data, setData] = useState<AppStatusTrendItem[]>([]);

  useEffect(() => {
    let range = dateRange;
    if (!dateRange?.start && !dateRange?.end) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      range = {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }
    fetchApplicationStatusTrend(range).then(setData).catch(console.error);
  }, [dateRange]);

  // Transform data for chart
  const dates = Array.from(new Set(data.map(d => d.date))).sort();
  const statuses = Array.from(new Set(data.map(d => d.status)));
  
  const chartData = dates.map(date => {
    const dayItems = data.filter(d => d.date === date);
    const segments = statuses.map(status => ({
      key: status,
      value: dayItems.find(d => d.status === status)?.count || 0
    })).filter(s => s.value > 0);
    
    // Format date
    const d = new Date(date);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    
    return { label, segments };
  });

  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const predefinedColors: Record<string, string> = {
    "APPLIED": "#3b82f6",
    "SHORTLISTED": "#f59e0b",
    "REJECTED": "#ef4444",
    "HIRED": "#10b981",
    "INTERVIEW": "#8b5cf6"
  };
  
  const effectiveColors: Record<string, string> = {};
  statuses.forEach((s, i) => {
    effectiveColors[s] = predefinedColors[s] || defaultColors[i % defaultColors.length];
  });

  return (
    <div style={{
      background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Application Status Trend</h3>
      <SimpleGroupedBarChart data={chartData} height={300} colors={effectiveColors} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginTop: 12 }}>
        {statuses.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              background: effectiveColors[s] 
            }} />
            {s.replace(/_/g, " ")}
          </div>
        ))}
      </div>
    </div>
  );
};