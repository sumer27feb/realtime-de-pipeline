"use client";

import { PaymentAmountPerformance } from "./payments/PaymentAmountPerformance";
import { PaymentHeadline } from "./payments/PaymentHeadline";
import { PaymentMethodMatrix } from "./payments/PaymentMethodMatrix";
import { PaymentOutcomeChart } from "./payments/PaymentOutcomeChart";

import { usePaymentPerformance } from "@/lib/queries/usePaymentPerformance";

export function PaymentPerformanceDashboard() {
  const { data, isLoading, isError, error, isFetching } =
    usePaymentPerformance();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/60">
            Payment Performance
          </div>

          <p className="mt-3 text-sm text-white/40">Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="border border-red-400/20 bg-red-400/[0.04] px-8 py-7 text-center">
          <div className="text-[9px] uppercase tracking-[0.2em] text-red-400/70">
            Payment performance unavailable
          </div>

          <p className="mt-3 text-sm text-white/60">
            {error instanceof Error
              ? error.message
              : "Unable to load payment performance metrics."}
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
            Payment Performance
          </h1>

          <p className="mt-1 text-xs text-white/35">
            Payment channels, outcomes, and transaction value
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

      {/* Payment system overview */}
      <PaymentHeadline data={data} />

      {/* Provider × mode matrix */}
      <div className="mt-3">
        <PaymentMethodMatrix data={data} />
      </div>

      {/* Outcome + financial analysis */}
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <PaymentOutcomeChart data={data} />

        <PaymentAmountPerformance data={data} />
      </div>
    </div>
  );
}
