"use client";

import ReactECharts from "echarts-for-react";

import type { EventActivity } from "@/lib/api/metrics";

interface EventTypeDistributionProps {
  data: EventActivity[];
}

const EVENT_COLORS: Record<string, string> = {
  user_created: "#a78bfa",
  product_viewed: "#62a8ff",
  order_created: "#d7a84a",
  payment_completed: "#4ade80",
};

export function EventTypeDistribution({ data }: EventTypeDistributionProps) {
  const totals = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.event_type] = (acc[item.event_type] ?? 0) + item.event_count;

    return acc;
  }, {});

  const entries = Object.entries(totals).sort(([, a], [, b]) => b - a);

  const totalEvents = entries.reduce((sum, [, value]) => sum + value, 0);

  const categories = entries.map(([type]) => formatEventType(type));

  const values = entries.map(([, value]) => value);

  const option = {
    animation: true,
    animationDuration: 700,

    grid: {
      left: 8,
      right: 24,
      top: 12,
      bottom: 12,
      containLabel: true,
    },

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.25)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (
        params: Array<{
          name: string;
          value: number;
          marker: string;
        }>,
      ) => {
        const item = params[0];

        if (!item) {
          return "";
        }

        const percentage =
          totalEvents > 0 ? (item.value / totalEvents) * 100 : 0;

        return `
          <div style="min-width:160px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:5px;
            ">
              ${item.name}
            </div>

            <div style="
              display:flex;
              justify-content:space-between;
              gap:20px;
            ">
              <strong>
                ${item.value.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                ${percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        `;
      },
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

      data: categories,

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 10,
      },
    },

    series: [
      {
        type: "bar",

        data: entries.map(([type, value]) => ({
          value,
          itemStyle: {
            color: EVENT_COLORS[type] ?? "#62a8ff",
            borderRadius: [0, 3, 3, 0],
          },
        })),

        barWidth: 18,

        showBackground: true,

        backgroundStyle: {
          color: "rgba(255,255,255,0.025)",
          borderRadius: [0, 3, 3, 0],
        },

        label: {
          show: true,
          position: "right",

          color: "rgba(255,255,255,0.45)",

          fontSize: 9,

          formatter: (params: { value: number }) =>
            params.value.toLocaleString("en-IN"),
        },

        emphasis: {
          focus: "series",
        },
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            Distribution
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Event composition
          </h2>
        </div>

        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            Total
          </p>

          <p className="mt-1 font-mono text-sm text-[#62a8ff]">
            {totalEvents.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="h-[270px] px-3 py-4 sm:h-[300px] sm:px-5">
        {entries.length > 0 ? (
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
            No event activity available
          </div>
        )}
      </div>
    </section>
  );
}

function formatEventType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
