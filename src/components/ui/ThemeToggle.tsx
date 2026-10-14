import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Cambiar tema claro/oscuro"
      onClick={() => setDark((d) => !d)}
      className="relative inline-flex h-9 w-[4.5rem] items-center rounded-full border border-white/15 bg-white/10 transition-colors hover:border-white/30"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-white/40">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4" />
      </span>
      <span
        className={`absolute left-1 grid h-7 w-7 place-items-center rounded-full bg-white text-black shadow transition-transform duration-300 ${
          dark ? "translate-x-[2.25rem]" : "translate-x-0"
        }`}
      >
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}
