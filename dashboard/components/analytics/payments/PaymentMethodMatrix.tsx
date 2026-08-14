"use client";

import ReactECharts from "echarts-for-react";

import type { PaymentPerformance } from "@/lib/api/metrics";

interface PaymentMethodMatrixProps {
  data: PaymentPerformance[];
}

export function PaymentMethodMatrix({ data }: PaymentMethodMatrixProps) {
  const modes = Array.from(new Set(data.map((item) => item.payment_mode)));

  const providers = Array.from(
    new Set(data.map((item) => item.payment_provider)),
  );

  const matrixData = data.map((item) => [
    providers.indexOf(item.payment_provider),
    modes.indexOf(item.payment_mode),
    Number((item.success_rate * 100).toFixed(1)),
    item.total_attempts,
    item.successful_attempts,
  ]);

  const option = {
    animation: true,
    animationDuration: 900,

    tooltip: {
      position: "top",

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: {
        data: [number, number, number, number, number];
      }) => {
        const [providerIndex, modeIndex, successRate, attempts, successful] =
          params.data;

        return `
          <div style="min-width:180px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:8px;
            ">
              ${formatLabel(modes[modeIndex])}
              ·
              ${formatLabel(providers[providerIndex])}
            </div>

            <div style="
              font-size:20px;
              font-weight:600;
              color:#f4f1ea;
            ">
              ${successRate.toFixed(1)}%
            </div>

            <div style="
              margin-top:7px;
              color:#718096;
              font-size:9px;
            ">
              ${successful.toLocaleString("en-IN")}
              successful /
              ${attempts.toLocaleString("en-IN")}
              attempts
            </div>
          </div>
        `;
      },
    },

    grid: {
      left: 8,
      right: 18,
      top: 25,
      bottom: 12,
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: providers.map(formatLabel),

      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
        },
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 9,
      },
    },

    yAxis: {
      type: "category",
      data: modes.map(formatLabel),

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 9,
      },
    },

    visualMap: {
      show: false,

      min: 0,
      max: 100,

      inRange: {
        color: [
          "#321b25",
          "#63303a",
          "#9c5b3c",
          "#d7a84a",
          "#62a8ff",
          "#4ade80",
        ],
      },
    },

    series: [
      {
        type: "heatmap",

        data: matrixData,

        itemStyle: {
          borderColor: "#0b1018",
          borderWidth: 3,
          borderRadius: 5,
        },

        label: {
          show: true,

          color: "#f4f1ea",

          fontSize: 11,
          fontWeight: 600,

          formatter: (params: { data: [number, number, number] }) =>
            `${Number(params.data[2]).toFixed(1)}%`,
        },

        emphasis: {
          itemStyle: {
            borderColor: "#f4f1ea",
            borderWidth: 2,

            shadowBlur: 20,
            shadowColor: "rgba(98,168,255,0.3)",
          },

          label: {
            fontSize: 13,
          },
        },
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            Matrix
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Payment channel efficiency
          </h2>
        </div>

        <div className="hidden sm:block">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            Cell value
          </p>

          <p className="mt-1 text-[10px] text-[#62a8ff]/70">Success rate</p>
        </div>
      </div>

      <div className="h-[350px] px-3 py-4 sm:h-[390px] sm:px-5">
        {matrixData.length > 0 ? (
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
        ) : (
          <Empty />
        )}
      </div>
    </section>
  );
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-white/30">
      No payment data available
    </div>
  );
}
