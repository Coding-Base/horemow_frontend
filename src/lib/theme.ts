export interface ThemeSettings {
  headingFont: string;
  bodyFont: string;
  fontSizeScale: "compact" | "standard" | "large" | string;
  brandAccent: string;
}

const STORAGE_KEY_THEME = "horemow_site_theme";

export const DEFAULT_THEME: ThemeSettings = {
  headingFont: "serif",
  bodyFont: "sans",
  fontSizeScale: "standard",
  brandAccent: "#1A4B8C",
};

const FONT_MAP: Record<string, string> = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', Roboto, -apple-system, sans-serif",
  classic: "'Merriweather', Georgia, serif",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const SCALE_MAP: Record<string, string> = {
  compact: "14px",
  standard: "16px",
  large: "18px",
};

export function getStoredTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEME);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    // fallback
  }

  // Backwards compatibility with individual keys
  return {
    headingFont: localStorage.getItem("horemow_font_heading") || DEFAULT_THEME.headingFont,
    bodyFont: localStorage.getItem("horemow_font_body") || DEFAULT_THEME.bodyFont,
    fontSizeScale: localStorage.getItem("horemow_font_scale") || DEFAULT_THEME.fontSizeScale,
    brandAccent: localStorage.getItem("horemow_brand_accent") || DEFAULT_THEME.brandAccent,
  };
}

export function applyTheme(theme: ThemeSettings) {
  if (typeof document === "undefined") return;

  const headingFamily = FONT_MAP[theme.headingFont] || FONT_MAP.serif;
  const bodyFamily = FONT_MAP[theme.bodyFont] || FONT_MAP.sans;
  const fontSize = SCALE_MAP[theme.fontSizeScale] || "16px";
  const brandColor = theme.brandAccent || DEFAULT_THEME.brandAccent;

  let styleTag = document.getElementById("horemow-custom-theme") as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "horemow-custom-theme";
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --brand-primary: ${brandColor} !important;
      --brand-blue: ${brandColor} !important;
      font-size: ${fontSize};
    }
    body {
      font-family: ${bodyFamily} !important;
    }
    h1, h2, h3, h4, h5, h6, .font-serif {
      font-family: ${headingFamily} !important;
    }
  `;

  // Persist locally
  localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(theme));
  localStorage.setItem("horemow_font_heading", theme.headingFont);
  localStorage.setItem("horemow_font_body", theme.bodyFont);
  localStorage.setItem("horemow_font_scale", theme.fontSizeScale);
  localStorage.setItem("horemow_brand_accent", theme.brandAccent);

  window.dispatchEvent(new CustomEvent("horemow_theme_changed", { detail: theme }));
}

export function applyStoredTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
}
