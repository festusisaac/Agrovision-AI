import Image from "next/image";

const PAIN_POINTS = [
  {
    title: "No expert within reach",
    body: "One extension officer serves thousands of farms. Diagnosis is delayed by weeks, if it comes at all.",
  },
  {
    title: "Guesswork chemistry",
    body: "Wrong pesticide, wrong dose, wrong week — money spent, resistance built, yield still lost.",
  },
  {
    title: "No signal, no service",
    body: "Cloud-only tools stop working exactly where they are needed most — in the field, off-grid.",
  },
  {
    title: "Knowledge in the wrong language",
    body: "Agronomic guidance is written in English text for readers. Many farmers need spoken Hausa, Yoruba or Igbo.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="border-t border-[var(--color-border)] py-24">
      <div className="grid grid-cols-1 items-start gap-10 lg:gap-16 lg:[grid-template-columns:minmax(280px,380px)_1fr]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">01 — The problem</div>
          <h2 className="font-heading mt-4 text-[28px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[34px] lg:text-[42px] lg:leading-[1.05] lg:tracking-[-0.03em]">
            Advice arrives after the crop is already lost.
          </h2>
          <p className="mt-[18px] text-[16px] leading-[1.6] text-fg-dim" style={{ textWrap: "pretty" }}>
            A farmer who spots an unfamiliar pest on Monday may wait weeks for an extension officer. By then an
            armyworm generation has cycled twice.
          </p>
          <div className="relative mt-[26px] h-[240px] overflow-hidden rounded-2xl">
            <Image
              src="/images/background3.jpg"
              alt="Farmers weeding a groundnut field by hand"
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover"
            />
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-[2px] overflow-hidden rounded-[18px] border sm:grid-cols-2"
          style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
        >
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="bg-background p-7">
              <div className="font-heading text-[17px] font-semibold">{p.title}</div>
              <p className="mt-2 text-[14px] leading-[1.6] text-fg-dim">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
