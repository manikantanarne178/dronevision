export const tokens = {
  colors: {
    bg: {
      app: "#F8FAFC", // Main application canvas
      card: "#FFFFFF", // Primary card & surface
      secondary: "#F1F5F9", // Secondary containers & table headers
      tertiary: "#E2E8F0", // Neutral highlights
      input: "#FFFFFF",
    },
    border: {
      default: "#E2E8F0",
      subtle: "#F1F5F9",
      focus: "#0891B2",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
      muted: "#94A3B8",
      inverted: "#FFFFFF",
    },
    brand: {
      primary: "#0891B2", // Cyan 600
      hover: "#0E7490", // Cyan 700
      light: "#ECFEFF", // Cyan 50
      ring: "rgba(8, 145, 178, 0.2)",
    },
    status: {
      success: {
        text: "#059669",
        bg: "#ECFDF5",
        border: "#A7F3D0",
      },
      warning: {
        text: "#D97706",
        bg: "#FFFBEB",
        border: "#FDE68A",
      },
      error: {
        text: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
      },
      info: {
        text: "#0284C7",
        bg: "#F0F9FF",
        border: "#BAE6FD",
      },
    },
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
  },
};

export default tokens;
