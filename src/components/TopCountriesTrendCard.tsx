import { useState, useEffect } from "react";
import { fetchTopCountriesTrend } from "../services/insights.api";
import { SimpleBarChart } from "./SimpleCharts";

export const TopCountriesTrendCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [data, setData] = useState<{ label: string, value: number }[]>([]);

  useEffect(() => {
    fetchTopCountriesTrend(dateRange).then(res => {
      // Aggregate trend data into totals for the bar chart
      const aggregated = res.topCountries.map(country => {
        const total = res.data
          .filter(d => d.country === country)
          .reduce((sum, d) => sum + d.count, 0);
        return { label: country, value: total };
      });
      
      // Sort by value descending
      setData(aggregated.sort((a, b) => b.value - a.value));
    }).catch(console.error);
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Top Countries Growth (Users)</h3>
      <SimpleBarChart data={data} color="#8b5cf6" />
    </div>
  );
};