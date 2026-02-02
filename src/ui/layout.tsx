export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{
      padding: "40px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <h1 style={{ 
          fontSize: "32px", 
          marginBottom: "32px", 
          fontWeight: "700",
          color: "#1e293b",
          letterSpacing: "-0.025em"
        }}>
          CRM Executive Dashboard
        </h1>
        {children}
      </div>
    </div>
  );
};
