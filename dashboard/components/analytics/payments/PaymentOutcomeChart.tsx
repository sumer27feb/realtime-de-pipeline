"use client";

import ReactECharts from "echarts-for-react";

import type { PaymentPerformance } from "@/lib/api/metrics";

interface PaymentOutcomeChartProps {
  data: PaymentPerformance[];
}

export function PaymentOutcomeChart({ data }: PaymentOutcomeChartProps) {
  const modes = Array.from(new Set(data.map((item) => item.payment_mode)));

  const aggregate = modes.map((mode) => {
    const rows = data.filter((item) => item.payment_mode === mode);

    return {
      mode,

      successful: rows.reduce((sum, item) => sum + item.successful_attempts, 0),

      failed: rows.reduce((sum, item) => sum + item.failed_attempts, 0),

      pending: rows.reduce((sum, item) => sum + item.pending_attempts, 0),

      attempts: rows.reduce((sum, item) => sum + item.total_attempts, 0),
    };
  });

  const option = {
    animation: true,
    animationDuration: 900,

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (
        params: Array<{
          seriesName: string;
          value: number;
          marker: string;
          dataIndex: number;
        }>,
      ) => {
        const index = params[0]?.dataIndex;

        if (index === undefined) {
          return "";
        }

        const item = aggregate[index];

        return `
          <div style="min-width:190px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:8px;
            ">
              ${formatLabel(item.mode)}
            </div>

            <div style="
              color:#718096;
              font-size:9px;
              margin-bottom:7px;
            ">
              ${item.attempts.toLocaleString("en-IN")}
              total attempts
            </div>

            ${params
              .map(
                (entry) => `
                  <div style="
                    display:flex;
                    justify-content:space-between;
                    gap:24px;
                    margin-top:5px;
                  ">
                    <span>
                      ${entry.marker}
                      ${entry.seriesName}
                    </span>

                    <strong>
                      ${Number(entry.value).toLocaleString("en-IN")}
                    </strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        `;
      },
    },

    legend: {
      top: 0,
      right: 0,

      icon: "roundRect",

      itemWidth: 10,
      itemHeight: 6,
      itemGap: 18,

      textStyle: {
        color: "rgba(255,255,255,0.42)",
        fontSize: 9,
      },
    },

    grid: {
      left: 8,
      right: 20,
      top: 38,
      bottom: 12,
      containLabel: true,
    },

    xAxis: {
      type: "value",

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.25)",
        fontSize: 9,
      },

      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },

    yAxis: {
      type: "category",

      inverse: true,

      data: modes.map(formatLabel),

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 10,
      },
    },

    series: [
      {
        name: "Successful",

        type: "bar",

        stack: "total",

        barWidth: 22,

        itemStyle: {
          color: "#4ade80",
          borderRadius: [4, 0, 0, 4],
        },

        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: "rgba(74,222,128,0.25)",
          },
        },

        data: aggregate.map((item) => item.successful),
      },

      {
        name: "Failed",

        type: "bar",

        stack: "total",

        barWidth: 22,

        itemStyle: {
          color: "#f87171",
        },

        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: "rgba(248,113,113,0.25)",
          },
        },

        data: aggregate.map((item) => item.failed),
      },

      {
        name: "Pending",

        type: "bar",

        stack: "total",

        barWidth: 22,

        itemStyle: {
          color: "#d7a84a",
          borderRadius: [0, 4, 4, 0],
        },

        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: "rgba(215,168,74,0.25)",
          },
        },

        data: aggregate.map((item) => item.pending),
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          Outcomes
        </p>

        <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
          Payment outcomes
        </h2>
      </div>

      <div className="h-[330px] px-3 py-4 sm:h-[360px] sm:px-5">
        {aggregate.length > 0 ? (
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
          <div className="flex h-full items-center justify-center text-xs text-white/30">
            No payment data available
          </div>
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
