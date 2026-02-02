import { useState, useEffect } from "react";
import { fetchTotalTickets, TicketStatsResponse } from "../services/insights.api";

export const TotalTicketsCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [data, setData] = useState<TicketStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetchTotalTickets(dateRange)
      .then((res: any) => {
        if (!isMounted) return;
        
        const responseData = res?.data || res;
        if (responseData && responseData.total !== undefined) {
          setData(responseData);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 14, color: "#666", fontWeight: "bold" }}>Total Tickets</div>
      <div style={{ fontSize: 36, fontWeight: 600, margin: "12px 0" }}>
        {loading ? "..." : (data?.total ?? 0)}
      </div>
      {data && Array.isArray(data.breakdown) && (
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