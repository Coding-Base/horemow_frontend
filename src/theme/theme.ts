import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1A4B8C" },
    secondary: { main: "#1E7B34" },
    text: { primary: "#111820", secondary: "#53616c" },
    background: { default: "#f7f7f3", paper: "#ffffff" },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.45) transparent",
          "&::-webkit-scrollbar": {
            width: "7px",
            height: "7px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(148, 163, 184, 0.45)",
            borderRadius: "9999px",
            border: "1.5px solid transparent",
            backgroundClip: "padding-box",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#1A4B8C",
            },
          },
          "&::-webkit-scrollbar-button": {
            display: "none",
            width: 0,
            height: 0,
          },
          "&::-webkit-scrollbar-corner": {
            background: "transparent",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.45) transparent",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(148, 163, 184, 0.45)",
            borderRadius: "9999px",
            "&:hover": {
              backgroundColor: "#1A4B8C",
            },
          },
        },
      },
    },
  },
});
