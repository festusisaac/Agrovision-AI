const ROWS = [
  {
    title: "Multimodal vision",
    body: "Leaf photograph plus crop context in a single prompt returns a structured diagnosis: class, confidence, severity, treatment.",
  },
  {
    title: "Native function calling",
    body: (
      <>
        The assistant calls <code className="font-mono text-[12.5px]">getWeather</code>,{" "}
        <code className="font-mono text-[12.5px]">readFarmLog</code> and{" "}
        <code className="font-mono text-[12.5px]">scheduleTask</code> to turn advice into an agent action.
      </>
    ),
  },
  {
    title: "Long-context reasoning",
    body: "A whole season of planting dates, sprays and rainfall fits in context, so recommendations reference what this farm actually did.",
  },
  {
    title: "Local language",
    body: "Responses are generated directly in Hausa, Yoruba or Igbo and read aloud with the Web Speech API.",
  },
  {
    title: "Efficient inference",
    body: "Small enough to run under Ollama on a mid-range laptop or handset — the basis of the offline phase.",
  },
];

export default function GemmaIntegration() {
  return (
    <section id="gemma" className="border-t border-[var(--color-border)] py-24">
      <div className="grid grid-cols-1 items-start gap-10 lg:gap-16 lg:[grid-template-columns:minmax(280px,360px)_1fr]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">04 — Gemma 4 integration</div>
          <h2 className="font-heading mt-4 text-[28px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[34px] lg:text-[42px] lg:leading-[1.05] lg:tracking-[-0.03em]">
            The model is the product, not a garnish.
          </h2>
          <p className="mt-[18px] text-[16px] leading-[1.6] text-fg-dim">
            Every feature above maps to a specific Gemma 4 capability. Remove the model and there is no app left.
          </p>
        </div>

        <div
          className="flex flex-col gap-[2px] overflow-hidden rounded-[18px] border"
          style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
        >
          {ROWS.map((row) => (
            <div
              key={row.title}
              className="grid grid-cols-1 items-baseline gap-2 bg-background px-7 py-6 sm:gap-6 sm:[grid-template-columns:200px_1fr]"
            >
              <div className="font-heading text-[16px] font-semibold text-leaf">{row.title}</div>
              <div className="text-[14px] leading-[1.6] text-fg-dim">{row.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
