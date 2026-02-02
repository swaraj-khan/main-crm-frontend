import { useState, useEffect } from "react";
import { fetchJobsByCompany } from "../services/insights.api";
import { SimpleGroupedBarChart } from "./SimpleCharts";

export const JobsByCompanyComparisonCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [chartData, setChartData] = useState<{ label: string, segments: { key: string, value: number }[] }[]>([]);

  useEffect(() => {
    // Fetch 'all' companies
    fetchJobsByCompany(1, 'all', dateRange).then(res => {
      const data = res.data.map(item => ({
        label: item.companyName,
        segments: [
          { key: "Job Count", value: item.jobCount },
          { key: "Total Apps", value: item.totalApplications }
        ]
      }));

      // Sort by Job Count descending
      data.sort((a, b) => {
        const jobCountA = a.segments.find(s => s.key === "Job Count")?.value || 0;
        const jobCountB = b.segments.find(s => s.key === "Job Count")?.value || 0;
        return jobCountB - jobCountA;
      });

      setChartData(data);
    }).catch(console.error);
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Jobs by Company Comparison</h3>
      <SimpleGroupedBarChart 
        data={chartData} 
        colors={{ "Job Count": "#3b82f6", "Total Apps": "#10b981" }} 
        minGroupWidth={200}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <div style={{ width: 10, height: 10, background: "#3b82f6" }} />
          Job Count
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <div style={{ width: 10, height: 10, background: "#10b981" }} />
          Total Apps
        </div>
      </div>
    </div>
  );
};