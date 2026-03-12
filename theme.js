const themeToggleButton = document.getElementById("theme-toggle");
const THEME_STORAGE_KEY = "taskflow_theme";

function applyTheme(isDark) {
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
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyTheme(savedTheme === "dark");

themeToggleButton.addEventListener("click", () => {
  const isDarkNow = document.documentElement.classList.contains("dark");
  applyTheme(!isDarkNow);
});

