import Image from "next/image";

const STACK = [
  "Next.js App Router",
  "Tailwind CSS",
  "Route Handlers",
  "Gemma 4",
  "Vertex AI",
  "Ollama",
  "MediaRecorder API",
  "Web Speech API",
  "IndexedDB",
];

const USERS = [
  "Smallholder and commercial farmers",
  "Agricultural extension officers",
  "Agricultural students and research institutions",
  "NGOs and government agricultural agencies",
];

export default function StackUsers() {
  return (
    <section className="grid grid-cols-1 gap-16 border-t border-[var(--color-border)] py-24 lg:grid-cols-2">
      <div>
        <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">05 — Stack</div>
        <h2 className="font-heading mt-4 mb-6 text-[32px] leading-[1.1] font-semibold tracking-[-0.025em]">
          Built in a day
        </h2>
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span
              key={s}
              className="rounded-full border px-[13px] py-2 font-mono text-[12px] text-fg-muted"
              style={{ borderColor: "rgba(242,240,230,0.14)" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">06 — Who it serves</div>
        <h2 className="font-heading mt-4 mb-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.025em]">
          Target users
        </h2>
        <div className="relative mb-[22px] h-[170px] overflow-hidden rounded-2xl">
          <Image
            src="/images/pic3.jpg"
            alt="Farmer holding a harvest of maize cobs"
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            style={{ objectPosition: "50% 40%" }}
          />
        </div>
        <div className="flex flex-col gap-3 text-[15px] text-fg-muted">
          {USERS.map((u, i) => (
            <div key={u} className="flex items-baseline gap-3">
              <span className="font-mono text-[12px] text-leaf">{String(i + 1).padStart(2, "0")}</span>
              {u}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
