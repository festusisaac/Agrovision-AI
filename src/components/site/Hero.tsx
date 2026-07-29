"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  { src: "/images/background1.jpg", alt: "Young farmer in a maize field at golden hour", position: "62% 42%" },
  { src: "/images/background4.jpg", alt: "Farmer harvesting leaves into a woven basket", position: "50% 50%" },
  { src: "/images/background2.jpg", alt: "Women planting together on a smallholding", position: "45% 45%" },
  { src: "/images/pic3.jpg", alt: "Farmer holding a harvest of maize cobs", position: "55% 40%" },
];

const STATS = [
  { value: "33M", label: "smallholder farms in Nigeria" },
  { value: "1:2,500", label: "extension officer to farmer ratio" },
  { value: "0 MB", label: "data needed in Phase 2 edge mode" },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="demo"
      className="relative grid grid-cols-1 items-start gap-14 pt-16 pb-20 sm:pt-24 lg:pb-[140px] lg:[grid-template-columns:minmax(320px,720px)]"
      style={{ minHeight: 560 }}
    >
      <div
        className="pointer-events-none absolute left-1/2 z-0 h-[820px] w-screen -translate-x-1/2 overflow-hidden"
        style={{ top: -140 }}
      >
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover transition-opacity duration-[1600ms] ease-in-out"
            style={{ objectPosition: slide.position, opacity: i === index ? 0.38 : 0 }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg,#0C130F 14%, rgba(12,19,15,0.55) 58%, rgba(12,19,15,0.92) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(12,19,15,0.9) 0%, rgba(12,19,15,0.1) 26%, #0C130F 96%)",
          }}
        />
      </div>

      <div className="relative z-10 pt-6">
        <div
          className="inline-flex items-center gap-2.5 rounded-full border px-3.5 py-[7px] font-mono text-[11.5px] tracking-[0.08em] text-leaf uppercase"
          style={{ borderColor: "rgba(163,230,53,0.25)", background: "rgba(163,230,53,0.06)" }}
        >
          <span className="animate-agv-pulse h-1.5 w-1.5 rounded-full bg-leaf" />
          Build with Gemma · Minna 2026
        </div>

        <h1
          className="font-heading mt-[26px] text-[38px] leading-[1.02] font-bold tracking-[-0.03em] sm:text-[52px] sm:leading-[1] lg:text-[68px] lg:leading-[0.98] lg:tracking-[-0.035em]"
          style={{ textWrap: "balance" }}
        >
          A farm expert in every pocket — <span className="text-leaf">even offline.</span>
        </h1>

        <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.55] text-fg-muted sm:text-[19px]" style={{ textWrap: "pretty" }}>
          AgroVision AI diagnoses crop disease from a photo, answers questions by voice in Hausa, Yoruba and Igbo,
          and tracks a farm&apos;s history — powered by Gemma 4 running in the cloud today and fully on-device
          tomorrow.
        </p>

        <div className="mt-[34px] flex flex-wrap gap-3.5">
          <Link
            href="/app/dashboard"
            className="rounded-xl bg-leaf px-[26px] py-[15px] font-medium text-[15px] text-[#0C130F] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Open the full app
          </Link>
          <a
            href="#architecture"
            className="rounded-xl border px-[26px] py-3.5 font-medium text-[15px]"
            style={{ borderColor: "rgba(242,240,230,0.18)" }}
          >
            See the architecture
          </a>
        </div>

        <div
          className="mt-14 grid grid-cols-1 gap-[2px] overflow-hidden rounded-[14px] border sm:grid-cols-3"
          style={{ background: "rgba(242,240,230,0.09)", borderColor: "rgba(242,240,230,0.09)" }}
        >
          {STATS.map((s) => (
            <div key={s.value} className="bg-background px-[18px] py-5">
              <div className="font-heading text-[30px] font-semibold tracking-[-0.02em]">{s.value}</div>
              <div className="mt-1 text-[12.5px] leading-[1.4] text-fg-dim">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
