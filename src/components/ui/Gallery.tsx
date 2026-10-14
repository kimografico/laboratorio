import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Stage from "./Stage";
import { defaultsFromProps, type PropDef } from "../../lib/props";
import { withBase } from "../../lib/base";

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
  basePath?: string;
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
  const themed = useMemo(
    () => props.filter((p) => p.type === "color").map((p) => p.name),
    [props]
  );

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
  const isBackground = category === "backgrounds";

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {visible &&
        (isBackground ? (
          <Stage componentId={componentId} values={values} themed={themed} />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 text-center ${
              isText ? "" : "pointer-events-none bg-surface"
            }`}
          >
            {isText ? (
              <div className="[--flip-duration:5s]">
                <Stage componentId={componentId} values={values} themed={themed} />
              </div>
            ) : (
              <div className="w-full">
                <Stage componentId={componentId} values={values} themed={themed} />
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default function Gallery({ experiments, basePath = "/experiment" }: GalleryProps) {
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(experiments.map((e) => e.category));
    return ["all", ...Array.from(set)];
  }, [experiments]);

  const hasFilter = categories.length > 2;

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
      {hasFilter && (
        <div className="sticky top-0 z-20 -mx-5 mb-8 border-b border-line bg-surface/85 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-faint" />
            {categories.map((c) => {
              const count = c === "all" ? experiments.length : counts[c] ?? 0;
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition ${
                    active
                      ? "border-fg bg-fg text-surface"
                      : "border-line-strong bg-subtle text-muted hover:border-fg/40"
                  }`}
                >
                  {c === "all" ? "Todos" : c}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? "bg-surface/20 text-surface/70" : "bg-subtle-strong text-faint"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-faint">Sin resultados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp) => (
            <a
              key={exp.id}
              href={withBase(`${basePath}/${exp.id}`)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-2xl hover:shadow-black/40"
            >
              <div className="relative h-44 w-full overflow-hidden border-b border-line">
                <LazyPreview componentId={exp.component} props={exp.props} category={exp.category} />
                {hasFilter && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-surface/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted backdrop-blur">
                    {exp.category}
                  </span>
                )}
              </div>
              <div className="relative z-10 flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: exp.accent ?? "currentColor" }}
                  />
                  <h3 className="text-base font-semibold text-fg">{exp.title}</h3>
                </div>
                <p className="line-clamp-2 text-sm text-muted">{exp.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
