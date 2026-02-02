import { useState, useEffect } from "react";
import { fetchTopCountries, TopCountriesResponse, TopCountryItem } from "../services/insights.api";

const CountryList = ({ title, items, total }: { title: string, items: TopCountryItem[], total: number }) => (
  <div style={{ flex: 1 }}>
    <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#333", borderBottom: "1px solid #eee", paddingBottom: 8 }}>
      {title} <span style={{ fontWeight: 'normal', color: '#999' }}>({total})</span>
    </h4>
    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td style={{ padding: "6px 0" }}>{item.country}</td>
            <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


export const TopCountriesCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [data, setData] = useState<TopCountriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTopCountries(10, dateRange)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  return (
    <div style={{
      background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Top Countries</h3>
      {loading ? (
        <div>Loading...</div>
      ) : data ? (
        <div style={{ display: "flex", gap: "32px", justifyContent: "space-between" }}>
          <CountryList title="Top countries by User" items={data.byUser.data} total={data.byUser.total} />
          <div style={{ borderLeft: "1px solid #eee" }} />
          <CountryList title="Top countries by Jobs" items={data.byJob.data} total={data.byJob.total} />
        </div>
      ) : (
        <div>No data available.</div>
      )}
    </div>
  );
};