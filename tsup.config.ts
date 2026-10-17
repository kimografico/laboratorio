import { defineConfig } from "tsup";

// Un entry por componente para que el consumidor importe solo lo que usa:
//   "@kimografico/laboratorio/texts/FlipText"
//   "@kimografico/laboratorio/backgrounds/AuroraBackground"
// Las piezas internas del showcase (Gallery, ExperimentPreview, Stage) no se publican.
export default defineConfig({
  entry: [
    "src/components/backgrounds/*.tsx",
    "src/components/texts/*.tsx",
    "src/components/ui/Button.tsx",
    "src/components/ui/ThemeToggle.tsx",
  ],
  format: ["esm"],
  target: "es2020",
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: ["react", "react-dom", "react/jsx-runtime", "lucide-react"],
});
