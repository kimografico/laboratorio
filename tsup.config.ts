import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/lib/index.ts" },
  format: ["esm"],
  target: "es2020",
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react-dom", "react/jsx-runtime", "lucide-react"],
});
