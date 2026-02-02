import { useState, useEffect } from "react";
import { fetchTopApplicants, TopApplicant } from "../services/insights.api";

export const TopApplicantsCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [applicants, setApplicants] = useState<TopApplicant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async (p: number, append = false) => {
    setLoading(true);
    try {
      const data = await fetchTopApplicants(p, 10, dateRange);
      if (append) {
        setApplicants((prev) => [...prev, ...data]);
      } else {
        setApplicants(data);
      }
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
    // Reset to page 1 for modal if needed, or keep current state
  };

  const loadMoreInModal = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  const downloadCSV = async () => {
    const allData = await fetchTopApplicants(1, 'all', dateRange);
    if (!allData.length) return;
    const headers = Object.keys(allData[0]).join(",");
    const rows = allData.map(obj => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "top_applicants.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const List = ({ items }: { items: TopApplicant[] }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: "left", color: "#666", borderBottom: "1px solid #eee" }}>
          <th style={{ padding: "8px 0" }}>Name</th>
          <th style={{ padding: "8px 0", textAlign: "center" }}>Total Apps</th>
          <th style={{ padding: "8px 0" }}>Role</th>
          <th style={{ padding: "8px 0", textAlign: "right" }}>Role Count</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const isSameUser = i > 0 && items[i - 1].userId === item.userId;
          return (
            <tr key={`${item.userId}-${i}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "12px 0", fontWeight: 500 }}>{!isSameUser ? item.fullName : ""}</td>
              <td style={{ padding: "12px 0", textAlign: "center", fontWeight: 600 }}>{!isSameUser ? item.totalApplications : ""}</td>
              <td style={{ padding: "12px 0", color: "#666" }}>{item.jobRole || "N/A"}</td>
              <td style={{ padding: "12px 0", textAlign: "right" }}>{item.roleCount}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <>
      <div style={{
        background: "#ffffff",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Top Applicants In Detail</h3>
          <button 
            onClick={handleShowMore}
            style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14 }}
          >
            Show More
          </button>
        </div>
        
        <List items={applicants.slice(0, 5)} />
      </div>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", width: "600px", maxHeight: "80vh", borderRadius: 12, padding: 24,
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>All Top Applicants</h2>
                <button onClick={downloadCSV} style={{ padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Download CSV</button>
              </div>
              <button onClick={() => setShowModal(false)} style={{ cursor: "pointer", border: "none", background: "none", fontSize: 20 }}>&times;</button>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
              <List items={applicants} />
              
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button 
                  onClick={loadMoreInModal} 
                  disabled={loading}
                  style={{ padding: "8px 16px", cursor: "pointer" }}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};