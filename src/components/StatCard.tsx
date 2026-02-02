type Props = {
  label: string;
  value: number;
  updatedAt: string;
};

export const StatCard = ({ label, value, updatedAt }: Props) => {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 14, color: "#666", fontWeight: "bold" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 600, margin: "12px 0" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#999" }}>
        Updated: {new Date(updatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
};
