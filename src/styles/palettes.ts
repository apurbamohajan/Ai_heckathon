export type PaletteName = "sunshine" | "candy" | "forest";

type Palette = Record<string, string>;

const PALETTES: Record<PaletteName, Palette> = {
  sunshine: {
    "--bg": "#060816",
    "--bg-2": "#0a0e28",
    "--bg-3": "#0d1330",

    "--glass": "rgba(15,21,42,0.64)",
    "--glass-strong": "rgba(23,32,58,0.82)",

    "--ink": "#f6f8ff",
    "--ink-2": "#9aa8c9",

    "--indigo": "#6366f1",
    "--violet": "#8b5cf6",
    "--cyan": "#00d4ff",
    "--success": "#10b981",
    "--warning": "#f59e0b",
    "--error": "#f43f5e",
  },

  candy: {
    "--bg": "#170b1e",
    "--bg-2": "#25112f",
    "--bg-3": "#321643",

    "--glass": "rgba(45,25,58,0.65)",
    "--glass-strong": "rgba(58,34,76,0.82)",

    "--ink": "#fff7fc",
    "--ink-2": "#d8bfd8",

    "--indigo": "#b388ff",
    "--violet": "#d16bff",
    "--cyan": "#66e6ff",
    "--success": "#74d99f",
    "--warning": "#ffc857",
    "--error": "#ff6b9d",
  },

  forest: {
    "--bg": "#07120d",
    "--bg-2": "#0b1b15",
    "--bg-3": "#12271f",

    "--glass": "rgba(18,35,28,0.65)",
    "--glass-strong": "rgba(28,48,38,0.82)",

    "--ink": "#edfdf5",
    "--ink-2": "#a8c6b5",

    "--indigo": "#4f8f6b",
    "--violet": "#3fa37d",
    "--cyan": "#67d5c4",
    "--success": "#34d399",
    "--warning": "#eab308",
    "--error": "#ef4444",
  },
};

export function applyPalette(name: PaletteName): void {
  const palette = PALETTES[name] ?? PALETTES.sunshine;
  const root = document.documentElement;

  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function applyIntensity(intensity: number): void {
  const root = document.documentElement;

  const stroke =
    intensity <= 0.6 ? "1px" :
    intensity >= 1.5 ? "2px" :
    "1.5px";

  const strokeThick =
    intensity <= 0.6 ? "2px" :
    intensity >= 1.5 ? "3px" :
    "2.5px";

  root.style.setProperty("--stroke", stroke);
  root.style.setProperty("--stroke-thick", strokeThick);
}