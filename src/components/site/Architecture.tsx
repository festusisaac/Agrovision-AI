function FlowNode({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[10px] border px-[13px] py-[11px] font-mono text-[12px]"
      style={
        accent
          ? {
              background: "rgba(163,230,53,0.09)",
              borderColor: "rgba(163,230,53,0.25)",
              color: "oklch(0.88 0.14 132)",
            }
          : { background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.09)", color: "var(--color-fg-dim)" }
      }
    >
      {label}
    </div>
  );
}

export default function Architecture() {
  return (
    <section id="architecture" className="border-t border-[var(--color-border)] py-24">
      <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">03 — Architecture</div>
      <h2 className="font-heading mt-4 mb-3 max-w-[24ch] text-[28px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[34px] lg:text-[42px] lg:leading-[1.05] lg:tracking-[-0.03em]">
        Cloud today, on-device tomorrow — same interface.
      </h2>
      <p className="mb-[46px] max-w-[60ch] text-[16px] leading-[1.6] text-fg-dim">
        The Next.js route handler is the only thing that changes between phases. The client, the prompts and the UX
        are identical, so the offline path is a configuration switch rather than a rewrite.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div
          className="rounded-[20px] border p-8"
          style={{
            borderColor: "rgba(242,240,230,0.12)",
            background: "linear-gradient(180deg, rgba(242,240,230,0.05), rgba(242,240,230,0))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] tracking-[0.1em] text-fg-dim uppercase">Phase 1 · shipping now</div>
            <div
              className="rounded-full px-[9px] py-1 font-mono text-[10px]"
              style={{ background: "rgba(242,240,230,0.09)" }}
            >
              CLOUD
            </div>
          </div>
          <div className="font-heading mt-3 text-2xl font-semibold tracking-[-0.02em]">Hosted Gemma 4 inference</div>
          <div className="mt-[22px] flex flex-col gap-[9px]">
            <FlowNode label="Client — camera, MediaRecorder, base64" />
            <div className="text-center text-leaf">↓</div>
            <FlowNode label="/api/diagnose · /api/chat" />
            <div className="text-center text-leaf">↓</div>
            <FlowNode label="Vertex AI / HF Inference — Gemma 4" accent />
          </div>
        </div>

        <div
          className="rounded-[20px] border p-8"
          style={{
            borderColor: "rgba(163,230,53,0.25)",
            background: "linear-gradient(180deg, rgba(163,230,53,0.07), rgba(242,240,230,0))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] tracking-[0.1em] text-fg-dim uppercase">Phase 2 · the goal</div>
            <div className="rounded-full bg-leaf px-[9px] py-1 font-mono text-[10px] text-[#0C130F]">EDGE</div>
          </div>
          <div className="font-heading mt-3 text-2xl font-semibold tracking-[-0.02em]">
            Zero-connectivity local inference
          </div>
          <div className="mt-[22px] flex flex-col gap-[9px]">
            <FlowNode label="Same client, same prompts" />
            <div className="text-center text-leaf">↓</div>
            <FlowNode label="Route handler → localhost:11434" />
            <div className="text-center text-leaf">↓</div>
            <FlowNode label="Ollama — Gemma 4 on the device" accent />
          </div>
        </div>
      </div>
    </section>
  );
}
