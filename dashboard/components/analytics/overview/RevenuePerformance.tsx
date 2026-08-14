"use client";

import ReactECharts from "echarts-for-react";
import type { EcommerceOverview } from "@/lib/api/metrics";

interface RevenuePerformanceProps {
  data: EcommerceOverview;
}

export function RevenuePerformance({ data }: RevenuePerformanceProps) {
  const revenueRealization =
    data.order_value > 0 ? data.successful_revenue / data.order_value : 0;

  const realizationPercent = revenueRealization * 100;

  const option = {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "item",
      formatter: () => `
        <div style="font-size:12px">
          <div style="font-weight:600;margin-bottom:4px">
            Revenue Realization
          </div>
          <div>
            ${realizationPercent.toFixed(2)}%
          </div>
        </div>
      `,
    },

    series: [
      {
        type: "gauge",

        startAngle: 210,
        endAngle: -30,

        min: 0,
        max: 100,

        center: ["50%", "58%"],
        radius: "72%",

        pointer: {
          show: true,
          length: "58%",
          width: 4,
          itemStyle: {
            color: "#62a8ff",
          },
        },

        progress: {
          show: true,
          width: 12,
          itemStyle: {
            color: "#62a8ff",
          },
        },

        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, "rgba(255,255,255,0.07)"]],
          },
        },

        axisTick: {
          show: false,
        },

        splitLine: {
          show: false,
        },

        axisLabel: {
          show: false,
        },

        anchor: {
          show: true,
          size: 8,
          itemStyle: {
            color: "#62a8ff",
          },
        },

        title: {
          show: true,
          offsetCenter: [0, "32%"],
          color: "rgba(255,255,255,0.35)",
          fontSize: 9,
        },

        detail: {
          valueAnimation: true,
          offsetCenter: [0, "-5%"],
          color: "#f4f1ea",
          fontSize: 28,
          fontWeight: 500,
          formatter: (value: number) => `${value.toFixed(1)}%`,
        },

        data: [
          {
            value: realizationPercent,
            name: "REALIZED",
          },
        ],
      },
    ],
  };

  return (
    <section className="min-h-0 border border-white/10 bg-[#0d1118]">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
          Revenue Performance
        </p>

        <h2 className="mt-1 text-base font-medium tracking-[-0.02em] text-white">
          Order value vs successful revenue
        </h2>
      </div>

      {/* Main visualization */}
      <div className="grid min-h-[320px] grid-cols-1 sm:grid-cols-[1fr_1.1fr]">
        {/* Revenue comparison */}
        <div className="flex flex-col justify-center gap-7 border-b border-white/10 p-6 sm:border-b-0 sm:border-r">
          <RevenueMetric
            label="Order Value"
            value={data.order_value}
            maximum={data.order_value}
          />

          <RevenueMetric
            label="Successful Revenue"
            value={data.successful_revenue}
            maximum={data.order_value}
            accent
          />

          <div className="border-t border-white/10 pt-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
              Average Order Value
            </p>

            <p className="mt-2 text-2xl font-medium tracking-[-0.045em] text-[#f4f1ea]">
              ₹
              {data.average_order_value.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative min-h-[280px]">
          <ReactECharts
            option={option}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "280px",
            }}
            opts={{
              renderer: "svg",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function RevenueMetric({
  label,
  value,
  maximum,
  accent = false,
}: {
  label: string;
  value: number;
  maximum: number;
  accent?: boolean;
}) {
  const percentage = maximum > 0 ? (value / maximum) * 100 : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
          {label}
        </p>

        <p
          className={`text-lg font-medium tracking-[-0.03em] ${
            accent ? "text-[#62a8ff]" : "text-[#f4f1ea]"
          }`}
        >
          ₹
          {value.toLocaleString("en-IN", {
            notation: "compact",
            maximumFractionDigits: 1,
          })}
        </p>
      </div>

      <div className="mt-3 h-1 overflow-hidden bg-white/[0.06]">
        <div
          className={`h-full transition-all duration-700 ${
            accent ? "bg-[#62a8ff]" : "bg-white/25"
          }`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
