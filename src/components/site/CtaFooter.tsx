import Image from "next/image";
import Link from "next/link";

export default function CtaFooter() {
  return (
    <>
      <section className="pt-0 pb-[110px]">
        <div
          className="relative flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-3xl border p-7 sm:gap-10 sm:p-14"
          style={{ borderColor: "rgba(163,230,53,0.25)" }}
        >
          <Image
            src="/images/background4.jpg"
            alt="Farmer harvesting leaves into a woven basket"
            fill
            sizes="1280px"
            className="object-cover"
            style={{ objectPosition: "50% 55%" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(100deg, rgba(12,19,15,0.94) 34%, rgba(12,19,15,0.62) 100%)" }}
          />

          <div className="relative z-10">
            <h2 className="font-heading max-w-[20ch] text-[24px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px] sm:leading-[1.06] sm:tracking-[-0.03em]">
              Try the prototype, then read the write-up.
            </h2>
            <p className="mt-3.5 text-[15.5px] text-fg-muted">
              Live demo, public repository and Kaggle write-up — AI for Social Impact track.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3">
            <Link
              href="/app/dashboard"
              className="rounded-xl bg-leaf px-[26px] py-[15px] font-medium text-[15px] text-[#0C130F] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Live demo
            </Link>
            <a
              href="#"
              className="rounded-xl border px-[26px] py-[15px] font-medium text-[15px]"
              style={{ borderColor: "rgba(242,240,230,0.2)" }}
            >
              GitHub repo
            </a>
            <a
              href="#"
              className="rounded-xl border px-[26px] py-[15px] font-medium text-[15px]"
              style={{ borderColor: "rgba(242,240,230,0.2)" }}
            >
              Kaggle write-up
            </a>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-6 border-t border-[var(--color-border)] py-8 pb-14 text-[13px] text-fg-faint">
        <div>AgroVision AI — Build with Gemma: AI for Africa, Minna 2026</div>
        <div className="font-mono text-[11.5px]">Tracks: Social Impact · Multimodal · Edge AI · Local Language</div>
      </footer>
    </>
  );
}
