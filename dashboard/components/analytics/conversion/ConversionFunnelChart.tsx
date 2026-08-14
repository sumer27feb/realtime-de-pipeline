"use client";

import ReactECharts from "echarts-for-react";

import type { ConversionFunnel } from "@/lib/api/metrics";

interface ConversionFunnelChartProps {
  data: ConversionFunnel;
}

const STAGES = [
  {
    key: "users",
    label: "Users",
    color: "#62a8ff",
  },
  {
    key: "views",
    label: "Product Views",
    color: "#4d8edb",
  },
  {
    key: "orders",
    label: "Orders",
    color: "#d7a84a",
  },
  {
    key: "attempts",
    label: "Payment Attempts",
    color: "#c58f36",
  },
  {
    key: "success",
    label: "Successful Payments",
    color: "#e8c66f",
  },
] as const;

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const values = [
    data.total_users,
    data.total_product_views,
    data.total_orders,
    data.total_payment_attempts,
    data.successful_payments,
  ];

  const funnelData = STAGES.map((stage, index) => ({
    name: stage.label,
    value: values[index],
    itemStyle: {
      color: stage.color,
      borderColor: "#0b1018",
      borderWidth: 3,
    },
  }));

  const option = {
    animation: true,
    animationDuration: 1000,
    animationEasing: "cubicOut",

    tooltip: {
      trigger: "item",

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      padding: [10, 13],

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: {
        name: string;
        value: number;
        percent: number;
        dataIndex: number;
      }) => {
        const previous =
          params.dataIndex > 0 ? values[params.dataIndex - 1] : null;

        const conversion =
          previous && previous > 0 ? (params.value / previous) * 100 : null;

        return `
          <div style="min-width:170px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:7px;
              letter-spacing:.04em;
            ">
              ${params.name}
            </div>

            <div style="
              font-size:18px;
              font-weight:600;
              color:#f4f1ea;
            ">
              ${params.value.toLocaleString("en-IN")}
            </div>

            ${
              conversion !== null
                ? `
                  <div style="
                    margin-top:6px;
                    color:#62a8ff;
                    font-size:10px;
                  ">
                    ${conversion.toFixed(1)}%
                    from previous stage
                  </div>
                `
                : `
                  <div style="
                    margin-top:6px;
                    color:#718096;
                    font-size:10px;
                  ">
                    Starting population
                  </div>
                `
            }
          </div>
        `;
      },
    },

    series: [
      {
        name: "Conversion Funnel",
        type: "funnel",

        left: "5%",
        top: 12,
        bottom: 12,
        width: "90%",
        height: "90%",

        min: 0,
        max: Math.max(...values),

        minSize: "14%",
        maxSize: "92%",

        sort: "descending",

        gap: 4,

        funnelAlign: "center",

        label: {
          show: true,
          position: "inside",

          color: "#0b1018",

          fontSize: 11,
          fontWeight: 600,

          formatter: (params: { name: string; value: number }) => {
            return `{name|${params.name}}\n{value|${params.value.toLocaleString(
              "en-IN",
            )}}`;
          },

          rich: {
            name: {
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(11,16,24,0.72)",
              lineHeight: 16,
            },

            value: {
              fontSize: 18,
              fontWeight: 700,
              color: "#0b1018",
              lineHeight: 24,
            },
          },
        },

        labelLine: {
          show: false,
        },

        itemStyle: {
          borderColor: "#0b1018",
          borderWidth: 3,
          shadowBlur: 0,
        },

        emphasis: {
          label: {
            show: true,
          },

          itemStyle: {
            borderColor: "#f4f1ea",
            borderWidth: 2,

            shadowBlur: 24,
            shadowColor: "rgba(98,168,255,0.28)",
          },
        },

        data: funnelData,
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
            Journey
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Conversion funnel
          </h2>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            View → payment
          </p>

          <p className="mt-1 font-mono text-sm text-[#d7a84a]">
            {formatPercent(data.view_to_successful_payment_rate)}
          </p>
        </div>
      </div>

      <div className="relative h-[460px] w-full px-3 py-4 sm:h-[520px] sm:px-6">
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

        {/* Stage transition indicators */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {[
            data.view_to_order_rate,
            data.payment_attempts_per_order,
            data.payment_success_rate,
          ].map((value, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-[#62a8ff]/50" />

              <span className="font-mono text-[8px] text-white/25">
                {index === 1 ? `${value.toFixed(2)}×` : formatPercent(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
