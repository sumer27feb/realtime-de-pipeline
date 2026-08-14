"use client";

import ReactECharts from "echarts-for-react";

import type { ConversionFunnel } from "@/lib/api/metrics";

interface FunnelMetricsProps {
  data: ConversionFunnel;
}

export function FunnelMetrics({ data }: FunnelMetricsProps) {
  const gauges = [
    {
      name: "View → Order",
      value: data.view_to_order_rate * 100,
      color: "#62a8ff",
    },
    {
      name: "Payment Success",
      value: data.payment_success_rate * 100,
      color: "#d7a84a",
    },
    {
      name: "View → Success",
      value: data.view_to_successful_payment_rate * 100,
      color: "#4ade80",
    },
  ];

  const option = {
    animation: true,
    animationDuration: 900,

    series: gauges.map((gauge, index) => ({
      type: "gauge",

      center: [`${18 + index * 32}%`, "45%"],

      radius: "62%",

      min: 0,
      max: 100,

      startAngle: 90,
      endAngle: -270,

      splitNumber: 5,

      pointer: {
        show: false,
      },

      progress: {
        show: true,
        roundCap: true,
        width: 8,

        itemStyle: {
          color: gauge.color,
        },
      },

      axisLine: {
        roundCap: true,

        lineStyle: {
          width: 8,
          color: [[1, "rgba(255,255,255,0.06)"]],
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
        show: false,
      },

      title: {
        show: true,

        offsetCenter: [0, "72%"],

        color: "rgba(255,255,255,0.35)",
        fontSize: 9,
      },

      detail: {
        valueAnimation: true,

        offsetCenter: [0, "4%"],

        color: "#f4f1ea",

        fontSize: 20,
        fontWeight: 500,

        formatter: (value: number) => `${value.toFixed(1)}%`,
      },

      data: [
        {
          value: gauge.value,
          name: gauge.name,
        },
      ],
    })),
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Metrics
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Funnel efficiency
            </h2>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Supporting ratios
            </p>
          </div>
        </div>
      </div>

      <div className="h-[270px] w-full px-2 pt-2 sm:h-[290px] sm:px-4">
        <ReactECharts
          option={option}
          style={{
            width: "100%",
            height: "100%",
          }}
          opts={{
            renderer: "svg",
          }}
        />
      </div>

      <div className="grid grid-cols-2 border-t border-white/10">
        <Metric
          label="Views / user"
          value={data.views_per_user.toFixed(2)}
          suffix="product views"
        />

        <Metric
          label="Payment attempts / order"
          value={data.payment_attempts_per_order.toFixed(2)}
          suffix="attempts"
        />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="p-5 sm:px-6 sm:py-5">
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-xl tracking-[-0.04em] text-[#f4f1ea]">
          {value}
        </span>

        <span className="text-[9px] text-white/25">{suffix}</span>
      </div>
    </div>
  );
}
