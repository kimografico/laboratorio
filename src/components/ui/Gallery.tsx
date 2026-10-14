import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import Stage from "./Stage";
import { defaultsFromProps, type PropDef } from "../../lib/props";

export interface ExperimentMeta {
  id: string;
  title: string;
  description: string;
  category: "backgrounds" | "texts" | string;
  component: string;
  accent?: string;
  props: PropDef[];
}

interface GalleryProps {
  experiments: ExperimentMeta[];
}

function LazyPreview({
  componentId,
  props,
  category,
}: {
  componentId: string;
  props: PropDef[];
  category: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const values = useMemo(() => defaultsFromProps(props), [props]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "150px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isText = category === "texts";

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {visible &&
        (isText ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div className="[--flip-duration:5s]">
              <Stage componentId={componentId} values={values} />
            </div>
          </div>
        ) : (
          <Stage componentId={componentId} values={values} />
        ))}
    </div>
  );
}

export default function Gallery({ experiments }: GalleryProps) {
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(experiments.map((e) => e.category));
    return ["all", ...Array.from(set)];
  }, [experiments]);

  const counts = useMemo(() => {
    return experiments.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [experiments]);

  const filtered = useMemo(
    () => experiments.filter((e) => category === "all" || e.category === category),
    [experiments, category]
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="sticky top-0 z-20 -mx-5 mb-8 border-b border-white/10 bg-[#0b0b0c]/85 px-5 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-white/40" />
          {categories.map((c) => {
            const count = c === "all" ? experiments.length : counts[c] ?? 0;
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition ${
                  active
                    ? "border-white/60 bg-white text-black"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {c === "all" ? "Todos" : c}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    active ? "bg-black/10 text-black/60" : "bg-white/10 text-white/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-white/50">Sin resultados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp) => (
            <a
              key={exp.id}
              href={`/experiment/${exp.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141416] transition hover:-translate-y-0.5 hover:border-white/25 hover:shadow-2xl hover:shadow-black/40"
            >
              <div className="relative h-44 w-full overflow-hidden border-b border-white/10">
                <LazyPreview componentId={exp.component} props={exp.props} category={exp.category} />
                <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70 backdrop-blur">
                  {exp.category}
                </span>
              </div>
              <div className="relative z-10 flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: exp.accent ?? "#ffffff" }}
                  />
                  <h3 className="text-base font-semibold text-white">{exp.title}</h3>
                </div>
                <p className="line-clamp-2 text-sm text-white/55">{exp.description}</p>
              </div>
              <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-white/0 transition group-hover:text-white/80">
                <Sparkles className="h-5 w-5" />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
