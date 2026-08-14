"use client";

import { ConversionEfficiency } from "./conversion/ConversionEfficiency";
import { ConversionFunnelChart } from "./conversion/ConversionFunnelChart";
import { FunnelHeadline } from "./conversion/FunnelHeadline";
import { FunnelMetrics } from "./conversion/FunnelMetrics";

import { useConversionFunnel } from "@/lib/queries/useConversionFunnel";

export function ConversionDashboard() {
  const { data, isLoading, isError, error, isFetching } = useConversionFunnel();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/60">
            Conversion Funnel
          </div>

          <p className="mt-3 text-sm text-white/40">
            Loading conversion data...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="border border-red-400/20 bg-red-400/[0.04] px-8 py-7 text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-red-400/70">
            Conversion unavailable
          </div>

          <p className="mt-3 text-sm text-white/60">
            {error instanceof Error
              ? error.message
              : "Unable to load conversion metrics."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* Page heading */}
      <div className="flex shrink-0 items-end justify-between gap-6 pb-5">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#62a8ff]/70">
            Analytics
          </p>

          <h1 className="mt-1 text-2xl font-medium tracking-[-0.045em] text-[#f4f1ea] sm:text-3xl">
            Conversion Funnel
          </h1>

          <p className="mt-1 text-xs text-white/35">
            From product discovery to successful payment
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isFetching ? "animate-pulse bg-[#62a8ff]" : "bg-white/20"
            }`}
          />

          <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
            {isFetching ? "Updating" : "Live data"}
          </span>
        </div>
      </div>

      {/* Stage headline */}
      <FunnelHeadline data={data} />

      {/* Main funnel */}
      <div className="mt-3">
        <ConversionFunnelChart data={data} />
      </div>

      {/* Secondary visualizations */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ConversionEfficiency data={data} />

        <FunnelMetrics data={data} />
      </div>
    </div>
  );
}
