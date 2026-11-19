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
            <h2 className="font-heading max-w-[22ch] text-[24px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px] sm:leading-[1.06] sm:tracking-[-0.03em]">
              Ready to transform African agricultural productivity?
            </h2>
            <p className="mt-3.5 max-w-[50ch] text-[15.5px] text-fg-muted">
              Explore the live multimodal diagnosis platform, test the USSD feature-phone gateway, or reach out to partner.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3">
            <Link
              href="/app/dashboard"
              className="rounded-xl bg-leaf px-[26px] py-[15px] font-medium text-[15px] text-[#0C130F] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Launch Platform
            </Link>
            <a
              href="https://github.com/festusisaac/Agrovision-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border px-[26px] py-[15px] font-medium text-[15px] transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(242,240,230,0.2)" }}
            >
              GitHub Repo
            </a>
            <a
              href="mailto:invest@agrovision.ai?subject=AgroVision%20AI%20-%20Investment%20%26%20Partnership%20Inquiry"
              className="rounded-xl border px-[26px] py-[15px] font-medium text-[15px] text-leaf transition-colors hover:bg-leaf/10"
              style={{ borderColor: "rgba(163,230,53,0.35)" }}
            >
              Contact Founders ↗
            </a>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-[var(--color-border)] py-8 pb-14 text-[13px] text-fg-faint">
        <div>© 2026 AgroVision AI. Multimodal Edge Intelligence for African Agriculture.</div>
        <div className="font-mono text-[11.5px]">Lagos & Minna, Nigeria · invest@agrovision.ai</div>
      </footer>
    </>
  );
}
