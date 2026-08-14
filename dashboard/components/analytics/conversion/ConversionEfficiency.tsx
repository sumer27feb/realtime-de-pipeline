"use client";

import ReactECharts from "echarts-for-react";

import type { ConversionFunnel } from "@/lib/api/metrics";

interface ConversionEfficiencyProps {
  data: ConversionFunnel;
}

export function ConversionEfficiency({ data }: ConversionEfficiencyProps) {
  const metrics = [
    {
      name: "View → Order",
      value: data.view_to_order_rate * 100,
      display: `${(data.view_to_order_rate * 100).toFixed(1)}%`,
      color: "#62a8ff",
    },
    {
      name: "Payment Success",
      value: data.payment_success_rate * 100,
      display: `${(data.payment_success_rate * 100).toFixed(1)}%`,
      color: "#d7a84a",
    },
    {
      name: "View → Success",
      value: data.view_to_successful_payment_rate * 100,
      display: `${(data.view_to_successful_payment_rate * 100).toFixed(1)}%`,
      color: "#4ade80",
    },
  ];

  const option = {
    animation: true,
    animationDuration: 900,

    tooltip: {
      trigger: "item",

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: {
        name: string;
        value: number | string | number[];
      }) => {
        const value = Array.isArray(params.value)
          ? Number(params.value[0])
          : Number(params.value);

        return `
          <div style="min-width:150px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:6px;
            ">
              ${params.name}
            </div>

            <strong style="
              font-size:18px;
              color:#f4f1ea;
            ">
              ${value.toFixed(1)}%
            </strong>
          </div>
        `;
      },
    },

    radar: {
      center: ["50%", "54%"],
      radius: "62%",

      indicator: metrics.map((metric) => ({
        name: metric.name,
        max: 100,
      })),

      axisName: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 9,
      },

      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
        },
      },

      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.07)",
        },
      },

      splitArea: {
        areaStyle: {
          color: ["rgba(255,255,255,0.015)", "rgba(255,255,255,0.025)"],
        },
      },
    },

    series: [
      {
        type: "radar",

        data: [
          {
            value: metrics.map((metric) => metric.value),

            name: "Efficiency",

            symbol: "circle",
            symbolSize: 7,

            lineStyle: {
              width: 2,
              color: "#62a8ff",
            },

            itemStyle: {
              color: "#d7a84a",
              borderColor: "#f4f1ea",
              borderWidth: 1,
            },

            areaStyle: {
              color: "rgba(98,168,255,0.16)",
            },
          },
        ],

        emphasis: {
          lineStyle: {
            width: 3,
          },

          areaStyle: {
            color: "rgba(98,168,255,0.22)",
          },
        },
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          Efficiency
        </p>

        <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
          Conversion efficiency
        </h2>
      </div>

      <div className="relative h-[350px]">
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

        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-5">
          {metrics.map((metric) => (
            <div key={metric.name} className="text-center">
              <div
                className="mx-auto mb-1 h-1 w-5"
                style={{
                  backgroundColor: metric.color,
                }}
              />

              <p className="text-[8px] uppercase tracking-[0.12em] text-white/25">
                {metric.name}
              </p>

              <p className="mt-0.5 font-mono text-[10px] text-white/55">
                {metric.display}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
