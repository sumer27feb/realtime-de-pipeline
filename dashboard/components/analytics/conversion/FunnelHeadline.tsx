"use client";

import type { ConversionFunnel } from "@/lib/api/metrics";

interface FunnelHeadlineProps {
  data: ConversionFunnel;
}

export function FunnelHeadline({ data }: FunnelHeadlineProps) {
  const stages = [
    {
      label: "Users",
      value: data.total_users,
    },
    {
      label: "Product views",
      value: data.total_product_views,
    },
    {
      label: "Orders",
      value: data.total_orders,
    },
    {
      label: "Payment attempts",
      value: data.total_payment_attempts,
    },
    {
      label: "Successful payments",
      value: data.successful_payments,
    },
  ];

  const largestStage = stages.reduce(
    (largest, stage) => (stage.value > largest.value ? stage : largest),
    stages[0],
  );

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
              Conversion
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Customer journey
            </h2>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              Final conversion
            </p>

            <p className="mt-1 font-mono text-sm text-[#62a8ff]">
              {formatPercent(data.view_to_successful_payment_rate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/10 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className={`relative min-h-[125px] p-5 sm:p-6 ${
              index > 1 ? "border-t border-white/10 lg:border-t-0" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">
                {String(index + 1).padStart(2, "0")}
              </span>

              {stage.label === largestStage.label && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#62a8ff]" />
              )}
            </div>

            <p className="mt-5 text-[10px] text-white/40">{stage.label}</p>

            <p className="mt-1 font-mono text-xl tracking-[-0.04em] text-[#f4f1ea] sm:text-2xl">
              {stage.value.toLocaleString("en-IN")}
            </p>

            {index > 0 && (
              <p className="mt-2 text-[9px] text-white/25">
                {stage.label === "Product views"
                  ? `${data.views_per_user.toFixed(2)} / user`
                  : stage.label === "Orders"
                    ? formatPercent(data.view_to_order_rate)
                    : stage.label === "Payment attempts"
                      ? `${data.payment_attempts_per_order.toFixed(2)} / order`
                      : formatPercent(data.payment_success_rate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
