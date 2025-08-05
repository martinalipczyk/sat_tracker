import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setEnabled(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const newMode = !enabled;
    setEnabled(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  }

  return (
    <button
      onClick={toggle}
      className="text-sm px-3 py-1 border rounded bg-gray-200  "
    >
      {enabled ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
