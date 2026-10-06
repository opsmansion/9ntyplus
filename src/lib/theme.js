// Inlined in the document head so the selected palette applies before paint.
(() => {
  const storageKey = "9ntyplus-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const isTheme = (value) => value === "light" || value === "dark";
  const readPreference = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      return isTheme(value) ? value : null;
    } catch {
      return null;
    }
  };
  let preference = readPreference();
  const applyTheme = () => {
    const theme = preference ?? (systemTheme.matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.dispatchEvent(new Event("9ntyplus:theme-changed"));
  };

  applyTheme();
  window.addEventListener("9ntyplus:theme-change", (event) => {
    const theme = /** @type {CustomEvent<string>} */ (event).detail;
    if (!isTheme(theme)) return;
    preference = theme;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Keep the selection for this page when storage is unavailable.
    }
    applyTheme();
  });
  systemTheme.addEventListener("change", () => {
    if (preference === null) applyTheme();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = readPreference();
    applyTheme();
  });
})();
