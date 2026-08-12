import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ProducerHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/45 transition hover:border-[#d7a84a]/50 hover:text-[#d7a84a]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="leading-none">
          <div className="text-sm font-semibold tracking-[-0.02em]">
            E-Commerce Pulse
          </div>

          <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#d7a84a]/70">
            Producer
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.18em]">
        <Link href="/" className="text-[#d7a84a]">
          Home
        </Link>

        <Link
          href="/analytics"
          className="text-white/30 transition hover:text-white"
        >
          Analytics
        </Link>
      </nav>
    </header>
  );
}
