import { useState, useEffect } from "react";
import { fetchTopCountries } from "../services/insights.api";
import { SimpleGroupedBarChart } from "./SimpleCharts";

export const TopCountriesComparisonCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [chartData, setChartData] = useState<{ label: string, segments: { key: string, value: number }[] }[]>([]);

  useEffect(() => {
    // Fetch 'all' countries
    fetchTopCountries('all', dateRange).then(res => {
      // Merge countries from both lists
      const allCountries = new Set([
        ...res.byUser.data.map(c => c.country),
        ...res.byJob.data.map(c => c.country)
      ]);

      const data = Array.from(allCountries).map(country => {
        const userCount = res.byUser.data.find(c => c.country === country)?.count || 0;
        const jobCount = res.byJob.data.find(c => c.country === country)?.count || 0;
        
        return {
          label: country,
          segments: [
            { key: "Users", value: userCount },
            { key: "Jobs", value: jobCount }
          ]
        };
      });

      // Sort by total activity (Users + Jobs) descending
      data.sort((a, b) => {
        const totalA = a.segments.reduce((acc, s) => acc + s.value, 0);
        const totalB = b.segments.reduce((acc, s) => acc + s.value, 0);
        return totalB - totalA;
      });

      setChartData(data);
    }).catch(console.error);
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Top Countries Comparison (Users vs Jobs)</h3>
      <SimpleGroupedBarChart 
        data={chartData} 
        colors={{ "Users": "#3b82f6", "Jobs": "#10b981" }} 
      />
    </div>
  );
};