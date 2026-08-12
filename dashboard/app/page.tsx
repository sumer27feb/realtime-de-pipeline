import Link from "next/link";
import { ArrowUpRight, BarChart3, Terminal } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#0b0b0c] text-[#f4f1ea]">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[-0.02em] sm:text-base"
          >
            E-Commerce Pulse
          </Link>

          <div className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.16em] text-white/45 sm:flex">
            <Link
              href="/producer"
              className="transition-colors hover:text-white"
            >
              Producer
            </Link>

            <Link
              href="/analytics"
              className="transition-colors hover:text-white"
            >
              Analytics
            </Link>
          </div>

          <div className="text-[10px] uppercase tracking-[0.15em] text-white/35 sm:hidden">
            v1.0
          </div>
        </header>

        {/* Main */}
        <section className="flex flex-1 items-center py-12 sm:py-16 lg:py-10">
          <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            {/* Left */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-[2px] w-8 bg-[#d7a84a]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#d7a84a]">
                  A complete data pipeline project
                </span>
              </div>

              <h1 className="max-w-3xl text-[clamp(3.5rem,7vw,7.8rem)] font-medium leading-[0.86] tracking-[-0.075em]">
                E-commerce
                <br />
                <span className="text-[#d8d2c7]">Pulse</span>
              </h1>

              <p className="mt-8 max-w-lg text-sm leading-6 text-[#9f9b93] sm:text-base">
                Produce the events. Consume the data. Explore the analytics.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/analytics"
                  className="group inline-flex items-center gap-3 bg-[#e8e1d5] px-5 py-3 text-sm font-medium text-[#111113] transition-all hover:bg-white"
                >
                  Open Analytics
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  href="/producer"
                  className="inline-flex items-center gap-3 border border-white/15 bg-white/[0.035] px-5 py-3 text-sm font-medium text-[#e8e3da] transition-all hover:border-white/30 hover:bg-white/[0.07]"
                >
                  Open Producer
                </Link>
              </div>
            </div>

            {/* Right — module selector */}
            <div className="grid w-full grid-cols-1 border border-white/10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Module
                number="01"
                icon={<Terminal className="h-5 w-5" />}
                title="Producer"
                description="Generate and control the e-commerce event stream."
                href="/producer"
                accent="producer"
              />

              <Module
                number="02"
                icon={<BarChart3 className="h-5 w-5" />}
                title="Analytics"
                description="Explore performance across products, payments and conversion."
                href="/analytics"
                accent="analytics"
              />
            </div>
          </div>
        </section>

        {/* Bottom */}
        <footer className="border-t border-white/10 pt-4">
          <div className="flex flex-col gap-2 text-[9px] uppercase tracking-[0.16em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>Real-time e-commerce data platform</span>
            <span>Kafka · Databricks · dbt · Airflow · FastAPI</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Module({
  number,
  icon,
  title,
  description,
  href,
  accent,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  accent: "producer" | "analytics";
}) {
  const isProducer = accent === "producer";

  return (
    <Link
      href={href}
      className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden border-b border-white/10 bg-[#111113] p-6 transition-all duration-300 hover:bg-[#18181a] sm:min-h-[290px] sm:border-b-0 sm:border-r last:border-r-0 lg:border-b lg:border-r-0 lg:last:border-b-0 xl:min-h-[320px] xl:border-b-0 xl:border-r xl:last:border-r-0"
    >
      {/* Accent edge */}
      <div
        className={`absolute inset-y-0 left-0 w-[2px] transition-all duration-300 ${
          isProducer
            ? "bg-[#d7a84a] group-hover:w-1"
            : "bg-[#62a8ff] group-hover:w-1"
        }`}
      />

      <div className="flex items-start justify-between pl-2">
        <div
          className={`flex h-10 w-10 items-center justify-center border ${
            isProducer
              ? "border-[#d7a84a]/30 text-[#d7a84a]"
              : "border-[#62a8ff]/30 text-[#62a8ff]"
          }`}
        >
          {icon}
        </div>

        <span className="font-mono text-[10px] text-white/25">{number}</span>
      </div>

      <div className="pl-2">
        <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#f0ece4]">
          {title}
        </h2>

        <p className="mt-3 max-w-xs text-sm leading-5 text-[#8f8c87]">
          {description}
        </p>

        <div className="mt-7 flex items-center gap-2 text-xs font-medium text-white/50 transition-colors group-hover:text-white">
          Enter
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
