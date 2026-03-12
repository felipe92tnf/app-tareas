const themeToggleButton = document.getElementById("theme-toggle");
const THEME_STORAGE_KEY = "taskflow_theme";

/**
 * Aplica el tema claro u oscuro a la página y sincroniza el estado visual
 * y almacenado de la preferencia de tema.
 *
 * @param {boolean} isDark Indica si se debe activar el modo oscuro.
 */
function applyThemePreference(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  themeToggleButton.textContent = isDark ? "☀️ Modo claro" : "🌙 Modo oscuro";
  themeToggleButton.setAttribute("aria-pressed", String(isDark));
  themeToggleButton.setAttribute(
    "aria-label",
    isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
  );
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}

// Al cargar: aplica tema guardado (si no hay, usa claro)
const savedThemePreference = localStorage.getItem(THEME_STORAGE_KEY);
applyThemePreference(savedThemePreference === "dark");

themeToggleButton.addEventListener("click", () => {
  const isDarkModeEnabled = document.documentElement.classList.contains("dark");
  applyThemePreference(!isDarkModeEnabled);
});

