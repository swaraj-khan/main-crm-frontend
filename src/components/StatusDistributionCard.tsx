import { useState, useEffect } from "react";
import { fetchApplicationStatusStats, StatusStat } from "../services/insights.api";

export const StatusDistributionCard = () => {
  const [stats, setStats] = useState<StatusStat[]>([]);

  useEffect(() => {
    fetchApplicationStatusStats().then(setStats).catch(console.error);
  }, []);

  const total = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>
        Application Status <span style={{ color: "#999", fontWeight: "normal", marginLeft: 8 }}>({total})</span>
      </h3>
      <table style={{ width: "100%", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#999" }}>
            <th style={{ paddingBottom: 8 }}>Status</th>
            <th style={{ paddingBottom: 8, textAlign: "right" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.status} style={{ borderTop: "1px solid #f0f0f0" }}>
              <td style={{ padding: "10px 0", color: "#333" }}>
                {stat.status.replace(/_/g, " ")}
              </td>
              <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 600 }}>
                {stat.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};