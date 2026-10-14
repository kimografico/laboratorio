import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ demo = false }: { demo?: boolean }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    if (demo) return;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!light}
      aria-label="Cambiar tema claro/oscuro"
      onClick={toggle}
      className="relative inline-flex h-9 w-[4.5rem] items-center rounded-full border border-line-strong bg-subtle-strong transition-colors hover:border-fg/40"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-faint">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4" />
      </span>
      <span
        className={`absolute left-1 grid h-7 w-7 place-items-center rounded-full bg-fg text-surface shadow transition-transform duration-300 ${
          light ? "translate-x-0" : "translate-x-[2.25rem]"
        }`}
      >
        {light ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  );
}
