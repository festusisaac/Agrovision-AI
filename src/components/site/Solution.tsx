import Image from "next/image";

const CARDS = [
  {
    image: "/images/pic2.jpg",
    alt: "Tomatoes ripening in a field row",
    position: "50% 50%",
    title: "Visual diagnosis",
    body: "Photograph a leaf. Gemma 4 names the disease or pest, scores confidence and rates severity.",
  },
  {
    image: "/images/pic4.jpg",
    alt: "Farmer holding freshly picked tomatoes",
    position: "50% 35%",
    title: "Actionable advice",
    body: "Specific product, dose, timing and prevention — not a Wikipedia paragraph.",
  },
  {
    image: "/images/pic5.jpg",
    alt: "Seedlings emerging in ploughed rows",
    position: "50% 50%",
    title: "Predictive insight",
    body: "Harvest windows, irrigation schedules and weather-aware nudges from your own farm log.",
  },
  {
    image: "/images/background2.jpg",
    alt: "Women planting together on a smallholding",
    position: "45% 40%",
    title: "Voice, any language",
    body: "Ask out loud in Hausa, Yoruba, Igbo or English and hear the answer spoken back.",
  },
];

export default function Solution() {
  return (
    <section className="border-t border-[var(--color-border)] py-24">
      <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">02 — The solution</div>
      <h2 className="font-heading mt-4 mb-8 max-w-[20ch] text-[28px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[34px] lg:mb-[46px] lg:text-[42px] lg:leading-[1.05] lg:tracking-[-0.03em]">
        Four capabilities, one assistant.
      </h2>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="rounded-[18px] border p-[26px]"
            style={{
              borderColor: "rgba(242,240,230,0.1)",
              background: "linear-gradient(180deg, rgba(242,240,230,0.045), rgba(242,240,230,0))",
            }}
          >
            <div className="relative h-[124px] overflow-hidden rounded-xl">
              <Image src={c.image} alt={c.alt} fill sizes="280px" className="object-cover" style={{ objectPosition: c.position }} />
            </div>
            <div className="font-heading mt-4 text-[17px] font-semibold">{c.title}</div>
            <p className="mt-2 text-[14px] leading-[1.6] text-fg-dim">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
