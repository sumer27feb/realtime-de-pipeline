"use client";

import ReactECharts from "echarts-for-react";

import type { EventActivity } from "@/lib/api/metrics";

interface ActiveUsersTimelineProps {
  data: EventActivity[];
}

const EVENT_COLORS: Record<string, string> = {
  user_created: "#a78bfa",
  product_viewed: "#62a8ff",
  order_created: "#d7a84a",
  payment_completed: "#4ade80",
};

export function ActiveUsersTimeline({ data }: ActiveUsersTimelineProps) {
  const windows = Array.from(
    new Set(data.map((item) => item.window_start)),
  ).sort();

  const eventTypes = Array.from(new Set(data.map((item) => item.event_type)));

  const getUsers = (windowStart: string, eventType: string) => {
    const row = data.find(
      (item) =>
        item.window_start === windowStart && item.event_type === eventType,
    );

    return row?.unique_users ?? 0;
  };

  const option = {
    animation: true,
    animationDuration: 700,

    tooltip: {
      trigger: "axis",

      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(255,255,255,0.18)",
        },
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
          seriesName: string;
          value: number;
          marker: string;
          dataIndex: number;
        }>,
      ) => {
        if (!params.length) {
          return "";
        }

        const index = params[0].dataIndex;
        const date = new Date(windows[index]);

        const heading = date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });

        const rows = params
          .filter((item) => Number(item.value) > 0)
          .map(
            (item) => `
              <div style="
                display:flex;
                justify-content:space-between;
                gap:24px;
                margin-top:5px;
              ">
                <span>
                  ${item.marker}
                  ${item.seriesName}
                </span>

                <strong>
                  ${Number(item.value).toLocaleString("en-IN")}
                </strong>
              </div>
            `,
          )
          .join("");

        return `
          <div style="min-width:190px">
            <div style="
              color:#8fa0b5;
              margin-bottom:7px;
              font-size:10px;
            ">
              ${heading}
            </div>

            ${rows}
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

      data: eventTypes.map(formatEventType),
    },

    grid: {
      left: 8,
      right: 12,
      top: 42,
      bottom: 12,
      containLabel: true,
    },

    xAxis: {
      type: "category",

      boundaryGap: false,

      data: windows.map((value) => {
        const date = new Date(value);

        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),

      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
        },
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.28)",
        fontSize: 9,
        margin: 10,
      },
    },

    yAxis: {
      type: "value",

      splitNumber: 4,

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
          color: "rgba(255,255,255,0.055)",
        },
      },
    },

    series: eventTypes.map((eventType) => ({
      name: formatEventType(eventType),

      type: "line",

      smooth: 0.3,

      symbol: "none",

      emphasis: {
        focus: "series",
      },

      lineStyle: {
        width: 2,
        color: EVENT_COLORS[eventType] ?? "#62a8ff",
      },

      areaStyle: {
        color: EVENT_COLORS[eventType] ?? "#62a8ff",
        opacity: 0.07,
      },

      itemStyle: {
        color: EVENT_COLORS[eventType] ?? "#62a8ff",
      },

      data: windows.map((windowStart) => getUsers(windowStart, eventType)),
    })),
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          Participation
        </p>

        <div className="mt-1 flex items-end justify-between gap-4">
          <h2 className="text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Active users across time
          </h2>

          <span className="hidden text-[9px] uppercase tracking-[0.15em] text-[#62a8ff]/60 sm:block">
            Unique per window
          </span>
        </div>
      </div>

      <div className="h-[300px] w-full px-3 pb-4 pt-3 sm:h-[340px] sm:px-5">
        {data.length > 0 ? (
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
            No activity available
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
