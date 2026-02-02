import { useState, useEffect } from "react";
import { fetchTotalJobs, JobStatsResponse } from "../services/insights.api";

export const TotalJobsCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [data, setData] = useState<JobStatsResponse | null>(null);

  useEffect(() => {
    fetchTotalJobs(dateRange).then(setData).catch(console.error);
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 14, color: "#666", fontWeight: "bold" }}>Total Jobs</div>
      <div style={{ fontSize: 36, fontWeight: 600, margin: "12px 0" }}>
        {data ? data.total : "..."}
      </div>
      {data && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {data.breakdown.map((item) => (
            <div key={item.status} style={{ 
              fontSize: 12, 
              background: "#f9f9f9", 
              padding: "4px 8px", 
              borderRadius: 4,
              border: "1px solid #eee",
              display: "flex",
              gap: 4
            }}>
              <span style={{ color: "#666" }}>{item.status.replace(/_/g, " ")}:</span>
              <span style={{ fontWeight: 600 }}>{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};