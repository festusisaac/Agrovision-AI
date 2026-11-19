import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#demo", label: "Overview" },
  { href: "#problem", label: "The Problem" },
  { href: "#business", label: "Market & Model" },
  { href: "#architecture", label: "Edge Architecture" },
  { href: "#gemma", label: "AI Engine" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between gap-6 py-6"
      style={{ background: "linear-gradient(#0C130F 70%, rgba(12,19,15,0))" }}
    >
      <Link href="/" className="flex items-center gap-3">
        <Image src="/images/logo.png" alt="AgroVision AI" width={36} height={36} className="object-contain" />
        <span className="font-heading text-[17px] font-semibold tracking-[-0.01em]">AgroVision AI</span>
      </Link>

      <nav className="hidden gap-7 text-sm text-fg-dim md:flex">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="text-inherit hover:text-leaf">
            {l.label}
          </a>
        ))}
      </nav>

      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-2 rounded-full bg-leaf px-[18px] py-[11px] font-medium text-[14px] text-[#0C130F] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Launch Live App
      </Link>
    </header>
  );
}
