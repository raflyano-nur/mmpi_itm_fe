export const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    fontFamily: "'DM Mono', monospace",
  },
  
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  dot: (color : any) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 8px ${color}`,
    transition: "all 0.3s ease",
  }),
  label: {
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6b6b80",
  },
  canvasWrap: {
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #1e1e2e",
  },
  canvas: {
    display: "block",
    width: "100%",
    maxHeight: "50px",
  },
  refreshBtn: {
    position: "absolute",
    top: "6px",
    right: "8px",
    background: "none",
    border: "none",
    color: "#3a3a5a",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "color 0.2s ease",
    lineHeight: 1,
  },
  input: {
    background: "#111118",
    border: "1.5px solid #1e1e2e",
    borderRadius: "8px",
    color: "#e8e8f0",
    fontFamily: "'DM Mono', monospace",
    fontSize: "1.1rem",
    letterSpacing: "0.25em",
    padding: "10px 14px",
    textAlign: "center",
    textTransform: "uppercase",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  msg: {
    fontSize: "0.72rem",
    textAlign: "center",
    margin: "-4px 0",
    letterSpacing: "0.05em",
  },
};

export const STATUS_COLORS : any = {
  idle: "#0196fe",
  success: "#10b981",
  error: "#ef4444",
};

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes fadeIn {
    from { opacity:0; transform: translateY(6px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .captcha-input:focus {
    outline: none;
    border-color: #0196fe !important;
    box-shadow: 0 0 0 3px rgba(1,150,254,0.15);
  }
  .refresh-btn:hover { color: #0196fe !important; }
`;