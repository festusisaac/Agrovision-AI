import { Building2, ShoppingBag, Radio, ShieldCheck } from "lucide-react";

const METRICS = [
  { value: "38M+", label: "Smallholders in Nigeria", sub: "Producing 80% of total national crop yield" },
  { value: "$3.5B", label: "Annual preventable crop loss", sub: "Lost to late diagnosis & guesswork chemistry" },
  { value: "1 : 2,500", label: "Extension deficit ratio", sub: "Global recommended benchmark is 1:400" },
  { value: "70%+", label: "2G / Feature phone reach", sub: "Accessible instantly via our USSD gateway" },
];

const REVENUE_STREAMS = [
  {
    icon: Building2,
    tag: "B2G & Institutional SaaS",
    title: "Outbreak Intelligence Portals",
    body: "State Ministries of Agriculture, ADPs, and international NGOs (IITA, AGRA, FAO) license Village Watch heatmaps and real-time alert dispatch to prevent regional epidemics.",
  },
  {
    icon: ShoppingBag,
    tag: "Agro-Input Commerce",
    title: "Precision Treatment Marketplace",
    body: "Certified agrochemical, biological, and seed suppliers (Bayer, Syngenta, Notore) partner for context-aware product placement when specific crop diseases are diagnosed.",
  },
  {
    icon: Radio,
    tag: "Telco VAS Revenue Share",
    title: "USSD Micro-Subscriptions",
    body: "In partnership with telecom carriers (MTN, Airtel), farmers query AgroVision over standard 2G USSD (*384*4130#) for ₦50/week without requiring smartphones or data plans.",
  },
  {
    icon: ShieldCheck,
    tag: "Agri-Fintech Data",
    title: "Credit & Insurance De-risking",
    body: "Hyperlocal crop stage, historical spray logs, and verified disease recovery curves provide credit underwriters with ground truth to safely disburse farmer micro-loans.",
  },
];

export default function BusinessModel() {
  return (
    <section id="business" className="border-t border-[var(--color-border)] py-24">
      <div className="font-mono text-[11px] tracking-[0.12em] text-warn uppercase">
        03 — Market Opportunity & Business Model
      </div>
      <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <h2 className="font-heading max-w-[22ch] text-[28px] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[34px] lg:text-[42px] lg:leading-[1.05] lg:tracking-[-0.03em]">
          Transforming a $40B agricultural sector with scalable unit economics.
        </h2>
        <p className="max-w-[42ch] text-[15.5px] leading-[1.6] text-fg-dim">
          AgroVision bridges the gap between field-level smallholder diagnoses and high-value institutional intelligence across four diversified revenue streams.
        </p>
      </div>

      <div
        className="mt-12 grid grid-cols-2 gap-[2px] overflow-hidden rounded-[18px] border sm:grid-cols-4"
        style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
      >
        {METRICS.map((m) => (
          <div key={m.label} className="bg-background p-6 sm:p-7">
            <div className="font-heading text-[28px] font-bold text-leaf sm:text-[34px]">{m.value}</div>
            <div className="mt-1 font-heading text-[15px] font-semibold">{m.label}</div>
            <div className="mt-1 text-[12px] text-fg-dim">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {REVENUE_STREAMS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="flex flex-col rounded-[18px] border p-6"
              style={{
                borderColor: "rgba(242,240,230,0.1)",
                background: "linear-gradient(180deg, rgba(242,240,230,0.045), rgba(242,240,230,0))",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] tracking-[0.08em] text-fg-faint uppercase">{s.tag}</span>
              </div>
              <div className="font-heading mt-5 text-[17px] font-semibold">{s.title}</div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-fg-dim">{s.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
