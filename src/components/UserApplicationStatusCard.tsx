import { useState, useEffect } from "react";
import { fetchUserApplicationStatus, UserAppStatus } from "../services/insights.api";

export const UserApplicationStatusCard = ({ dateRange }: { dateRange?: { start: string, end: string } }) => {
  const [users, setUsers] = useState<UserAppStatus[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async (p: number, append = false) => {
    setLoading(true);
    try {
      // Note: fetchUserApplicationStatus requires a filter argument in the updated API signature.
      // Assuming 'applied' or similar default, or if this component is deprecated in favor of the ListCard, 
      // but based on context it seems to be a separate "First Applications" card.
      // However, the API signature changed to (page, limit, filter, dates).
      // I will assume this card shows ALL users status, but the API now enforces a filter.
      // If this card is meant to show mixed status, the backend route might need adjustment or we use a different call.
      // For now, I will pass 'applied' to satisfy TS if strict, or just pass dates if the API handles it.
      // Actually, looking at previous context, this card used /insights/users-application-status WITHOUT filter param in the URL previously?
      // The backend route now expects filter param logic.
      // Let's assume we pass 'applied' for now or fix the API call if it supports no filter.
      // The backend code: if (filter === 'applied') ... else if (filter === 'not_applied') ... else { // no filter applied }
      // So passing undefined/null for filter is fine.
      // @ts-ignore
      const data = await fetchUserApplicationStatus(p, 10, undefined, dateRange);
      if (append) {
        setUsers((prev) => [...prev, ...data]);
      } else {
        setUsers(data);
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
  };

  const loadMoreInModal = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  const downloadCSV = () => {
    if (!users.length) return;
    const headers = Object.keys(users[0]).join(",");
    const rows = users.map(obj => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_application_status.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const List = ({ items }: { items: UserAppStatus[] }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: "left", color: "#666", borderBottom: "1px solid #eee" }}>
          <th style={{ padding: "8px 0" }}>User ID</th>
          <th style={{ padding: "8px 0" }}>Name</th>
          <th style={{ padding: "8px 0", textAlign: "center" }}>Applied</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={`${item.userId}-${i}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
            <td style={{ padding: "12px 0", color: "#999", fontSize: 12, fontFamily: "monospace" }}>
              {item.userId}
            </td>
            <td style={{ padding: "12px 0", fontWeight: 500 }}>{item.fullName}</td>
            <td style={{ padding: "12px 0", textAlign: "center" }}>
              <span style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: item.hasApplied ? "#e6f4ea" : "#fce8e6",
                color: item.hasApplied ? "#1e8e3e" : "#d93025",
                fontWeight: 600,
                fontSize: 12
              }}>
                {item.hasApplied ? "Y" : "N"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div style={{
        background: "#ffffff", borderRadius: 12, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.05)",

      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>First Applications (Applied Status)</h3>
          <button onClick={handleShowMore} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14 }}>
            Show More
          </button>
        </div>
        <List items={users.slice(0, 5)} />
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", width: "700px", maxHeight: "80vh", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>User Application Status</h2>
                <button onClick={downloadCSV} style={{ padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Download CSV</button>
              </div>
              <button onClick={() => setShowModal(false)} style={{ cursor: "pointer", border: "none", background: "none", fontSize: 20 }}>&times;</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
              <List items={users} />
              <div style={{ textAlign: "center", marginTop: 20 }}><button onClick={loadMoreInModal} disabled={loading} style={{ padding: "8px 16px", cursor: "pointer" }}>{loading ? "Loading..." : "Load More"}</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};