"use client";

import { useOverview } from "@/lib/queries/useOverview";

import { OverviewKpiStrip } from "./overview/OverviewKpiStrip";
import { ConversionJourney } from "./overview/ConversionJourney";
import { RevenuePerformance } from "./overview/RevenuePerformance";
import { AudiencePanel } from "./overview/AudiencePanel";
import { TransactionHealth } from "./overview/TransactionHealth";

export function OverviewDashboard() {
  const { data, isLoading, isError, error, isFetching } = useOverview();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/60">
            Overview
          </div>

          <p className="mt-3 text-sm text-white/40">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="border border-red-400/20 bg-red-400/[0.04] px-8 py-7 text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-red-400/70">
            Metrics unavailable
          </div>

          <p className="mt-3 text-sm text-white/60">
            {error instanceof Error
              ? error.message
              : "Unable to load overview metrics."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* Overview heading */}
      <div className="flex shrink-0 items-end justify-between gap-6 pb-5">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#62a8ff]/70">
            Analytics
          </p>

          <h1 className="mt-1 text-2xl font-medium tracking-[-0.045em] text-[#f4f1ea] sm:text-3xl">
            Overview
          </h1>

          <p className="mt-1 text-xs text-white/35">
            E-commerce performance at a glance
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isFetching ? "bg-[#62a8ff] animate-pulse" : "bg-white/20"
            }`}
          />

          <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
            {isFetching ? "Updating" : "Live data"}
          </span>
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="shrink-0">
        <OverviewKpiStrip data={data} />
      </div>

      {/* Main visualizations */}
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <ConversionJourney data={data} />

        <RevenuePerformance data={data} />
      </div>

      {/* Supporting visualizations */}
      <div className="mt-3 grid grid-cols-1 gap-3 pb-3 lg:grid-cols-2">
        <AudiencePanel data={data} />

        <TransactionHealth data={data} />
      </div>
    </div>
  );
}
