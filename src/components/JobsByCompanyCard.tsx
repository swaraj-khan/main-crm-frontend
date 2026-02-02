import { useState, useEffect } from "react";
import { fetchJobsByCompany, JobByCompany } from "../services/insights.api";

export const JobsByCompanyCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [jobs, setJobs] = useState<JobByCompany[]>([]);
  const [meta, setMeta] = useState({ totalJobs: 0, totalCompanies: 0 });
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async (p: number, append = false) => {
    setLoading(true);
    try {
      const response = await fetchJobsByCompany(p, 10, dateRange);
      if (append) {
        setJobs((prev) => [...prev, ...response.data]);
      } else {
        setJobs(response.data);
      }
      setMeta(response.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [dateRange]);

  const handleShowMore = () => {
    setShowModal(true);
  };

  const loadMoreInModal = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  const downloadCSV = async () => {
    const response = await fetchJobsByCompany(1, 'all', dateRange);
    const allData = response.data;
    if (!allData.length) return;
    const headers = Object.keys(allData[0]).join(",");
    const rows = allData.map(obj => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs_by_company.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const List = ({ items }: { items: JobByCompany[] }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: "left", color: "#666", borderBottom: "1px solid #eee" }}>
          <th style={{ padding: "8px 0" }}>Company</th>
          <th style={{ padding: "8px 0", textAlign: "right" }}>Job Count</th>
          <th style={{ padding: "8px 0", textAlign: "right" }}>Total Apps</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={`${item.companyName}-${i}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
            <td style={{ padding: "12px 0", fontWeight: 500 }}>{item.companyName}</td>
            <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>{item.jobCount}</td>
            <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>{item.totalApplications}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div style={{
        background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            Jobs by Company <span style={{ color: "#999", fontWeight: "normal", marginLeft: 8 }}>
              ({meta.totalCompanies})({meta.totalJobs})
            </span>
          </h3>
          <button onClick={handleShowMore} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14 }}>
            Show More
          </button>
        </div>
        <List items={jobs.slice(0, 6)} />
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", width: "900px", maxHeight: "80vh", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Jobs by Company</h2>
                <button onClick={downloadCSV} style={{ padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Download CSV</button>
              </div>
              <button onClick={() => setShowModal(false)} style={{ cursor: "pointer", border: "none", background: "none", fontSize: 20 }}>&times;</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
              <List items={jobs} />
              <div style={{ textAlign: "center", marginTop: 20 }}><button onClick={loadMoreInModal} disabled={loading} style={{ padding: "8px 16px", cursor: "pointer" }}>{loading ? "Loading..." : "Load More"}</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};