import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function ThemeApplier() {
  const settings = useStore((s) => s.settings);
  useEffect(() => {
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty("--primary", settings.primaryColor);
    if (settings.accentColor) root.style.setProperty("--accent", settings.accentColor);
    if (settings.fontFamily) root.style.setProperty("--app-font", settings.fontFamily);
    document.body.style.fontFamily = settings.fontFamily;
    document.body.style.fontSize = `${settings.fontSize}px`;
    if (settings.themeMode === "dark") root.classList.add("dark");
    else if (settings.themeMode === "light") root.classList.remove("dark");
  }, [settings]);
  return null;
}
