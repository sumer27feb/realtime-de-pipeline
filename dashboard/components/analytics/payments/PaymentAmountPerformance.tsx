"use client";

import ReactECharts from "echarts-for-react";

import type { PaymentPerformance } from "@/lib/api/metrics";

interface PaymentAmountPerformanceProps {
  data: PaymentPerformance[];
}

interface TooltipParam {
  seriesName: string;
  value: number | string;
  marker: string;
  dataIndex: number;
}

export function PaymentAmountPerformance({
  data,
}: PaymentAmountPerformanceProps) {
  const modes = Array.from(new Set(data.map((item) => item.payment_mode)));

  const aggregate = modes.map((mode) => {
    const rows = data.filter((item) => item.payment_mode === mode);

    const totalAmount = rows.reduce(
      (sum, item) => sum + item.total_payment_amount,
      0,
    );

    const successfulAmount = rows.reduce(
      (sum, item) => sum + item.successful_payment_amount,
      0,
    );

    const attempts = rows.reduce((sum, item) => sum + item.total_attempts, 0);

    const successful = rows.reduce(
      (sum, item) => sum + item.successful_attempts,
      0,
    );

    return {
      mode,
      totalAmount,
      successfulAmount,
      successRate: attempts > 0 ? (successful / attempts) * 100 : 0,
    };
  });

  const option = {
    animation: true,
    animationDuration: 1000,

    tooltip: {
      trigger: "axis",

      axisPointer: {
        type: "cross",

        crossStyle: {
          color: "rgba(255,255,255,0.15)",
        },
      },

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: TooltipParam[]) => {
        const index = params[0]?.dataIndex;

        if (index === undefined) {
          return "";
        }

        const item = aggregate[index];

        return `
          <div style="min-width:210px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:8px;
            ">
              ${formatLabel(item.mode)}
            </div>

            ${params
              .map((entry) => {
                const numericValue = Number(entry.value);

                const value =
                  entry.seriesName === "Success rate"
                    ? `${numericValue.toFixed(1)}%`
                    : formatCurrency(numericValue);

                return `
                  <div style="
                    display:flex;
                    justify-content:space-between;
                    gap:24px;
                    margin-top:6px;
                  ">
                    <span>
                      ${entry.marker}
                      ${entry.seriesName}
                    </span>

                    <strong>
                      ${value}
                    </strong>
                  </div>
                `;
              })
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
      itemGap: 16,

      textStyle: {
        color: "rgba(255,255,255,0.42)",
        fontSize: 9,
      },
    },

    grid: {
      left: 10,
      right: 18,
      top: 42,
      bottom: 12,
      containLabel: true,
    },

    xAxis: {
      type: "category",

      data: modes.map(formatLabel),

      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
        },
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.42)",
        fontSize: 9,
      },
    },

    yAxis: [
      {
        type: "value",

        name: "Amount",

        nameTextStyle: {
          color: "rgba(255,255,255,0.22)",
          fontSize: 8,
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "rgba(255,255,255,0.25)",
          fontSize: 8,

          formatter: (value: number) => `₹${Math.round(value / 1000)}k`,
        },

        splitLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.05)",
          },
        },
      },

      {
        type: "value",

        name: "Success",

        min: 0,
        max: 100,

        nameTextStyle: {
          color: "rgba(255,255,255,0.22)",
          fontSize: 8,
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "rgba(255,255,255,0.25)",
          fontSize: 8,

          formatter: "{value}%",
        },

        splitLine: {
          show: false,
        },
      },
    ],

    series: [
      {
        name: "Total amount",

        type: "bar",

        barWidth: 24,

        itemStyle: {
          color: "#24517a",
          borderRadius: [4, 4, 0, 0],
        },

        emphasis: {
          itemStyle: {
            color: "#397fb8",

            shadowBlur: 18,
            shadowColor: "rgba(98,168,255,0.25)",
          },
        },

        data: aggregate.map((item) => item.totalAmount),
      },

      {
        name: "Successful amount",

        type: "bar",

        barWidth: 14,

        barGap: "-58%",

        itemStyle: {
          color: "#4ade80",

          borderRadius: [4, 4, 0, 0],
        },

        emphasis: {
          itemStyle: {
            shadowBlur: 18,
            shadowColor: "rgba(74,222,128,0.25)",
          },
        },

        data: aggregate.map((item) => item.successfulAmount),
      },

      {
        name: "Success rate",

        type: "line",

        yAxisIndex: 1,

        smooth: true,

        symbol: "circle",
        symbolSize: 7,

        lineStyle: {
          width: 2,
          color: "#d7a84a",
        },

        itemStyle: {
          color: "#d7a84a",

          borderColor: "#f4f1ea",
          borderWidth: 1,
        },

        emphasis: {
          scale: true,

          itemStyle: {
            shadowBlur: 15,
            shadowColor: "rgba(215,168,74,0.35)",
          },
        },

        data: aggregate.map((item) => item.successRate),
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Financial performance
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Payment value
            </h2>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Overlay
            </p>

            <p className="mt-1 text-[10px] text-[#d7a84a]">Success rate</p>
          </div>
        </div>
      </div>

      <div className="h-[350px] px-3 py-4 sm:h-[380px] sm:px-5">
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

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}
