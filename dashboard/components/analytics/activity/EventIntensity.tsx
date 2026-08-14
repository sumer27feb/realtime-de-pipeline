"use client";

import ReactECharts from "echarts-for-react";

import type { EventActivity } from "@/lib/api/metrics";

interface EventIntensityProps {
  data: EventActivity[];
}

const EVENT_ORDER = [
  "user_created",
  "product_viewed",
  "order_created",
  "payment_completed",
];

const INTENSITY_COLORS = [
  "#111923",
  "#172b43",
  "#24517a",
  "#397fb8",
  "#62a8ff",
  "#d7a84a",
];

export function EventIntensity({ data }: EventIntensityProps) {
  const windows = Array.from(
    new Set(data.map((item) => item.window_start)),
  ).sort();

  const eventTypes = Array.from(new Set(data.map((item) => item.event_type)));

  const types = EVENT_ORDER.filter((type) => eventTypes.includes(type));

  const typeIndex = new Map(types.map((type, index) => [type, index]));

  const windowIndex = new Map(windows.map((window, index) => [window, index]));

  const heatmapData = data
    .filter(
      (item) =>
        typeIndex.has(item.event_type) && windowIndex.has(item.window_start),
    )
    .map((item) => [
      windowIndex.get(item.window_start)!,
      typeIndex.get(item.event_type)!,
      Number(item.events_per_active_user.toFixed(2)),
    ]);

  const maxIntensity =
    heatmapData.length > 0
      ? Math.max(...heatmapData.map((item) => Number(item[2])))
      : 1;

  const option = {
    animation: true,
    animationDuration: 700,

    tooltip: {
      position: "top",

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.25)",
      borderWidth: 1,

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: { data: [number, number, number] }) => {
        const [x, y, value] = params.data;

        const window = windows[x];
        const eventType = types[y];

        const start = new Date(window);

        const time = start.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
          <div style="min-width:180px">
            <div style="
              color:#8fa0b5;
              font-size:10px;
              margin-bottom:7px;
            ">
              ${time}
            </div>

            <div style="
              display:flex;
              justify-content:space-between;
              gap:20px;
            ">
              <span>
                ${formatEventType(eventType)}
              </span>

              <strong>
                ${Number(value).toFixed(2)}
              </strong>
            </div>

            <div style="
              color:#718096;
              margin-top:5px;
              font-size:9px;
            ">
              events per active user
            </div>
          </div>
        `;
      },
    },

    grid: {
      left: 8,
      right: 18,
      top: 12,
      bottom: 12,
      containLabel: true,
    },

    xAxis: {
      type: "category",

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
      type: "category",

      data: types.map(formatEventType),

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.48)",
        fontSize: 9,
      },
    },

    // Required internally by ECharts heatmap.
    // Hidden so no visualMap controller is rendered.
    visualMap: {
      show: false,

      min: 0,
      max: maxIntensity,

      calculable: false,

      inRange: {
        color: INTENSITY_COLORS,
      },
    },

    series: [
      {
        type: "heatmap",

        data: heatmapData,

        label: {
          show: true,

          color: "rgba(255,255,255,0.55)",

          fontSize: 9,

          formatter: (params: { data: [number, number, number] }) => {
            return Number(params.data[2]).toFixed(1);
          },
        },

        itemStyle: {
          borderColor: "#0b1018",
          borderWidth: 2,
          borderRadius: 3,
        },

        emphasis: {
          itemStyle: {
            borderColor: "#f4f1ea",
            borderWidth: 1.5,
            shadowBlur: 12,
            shadowColor: "rgba(98,168,255,0.35)",
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
            Intensity
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Event intensity
          </h2>
        </div>

        <div className="hidden items-end gap-4 sm:flex">
          <div>
            <p className="mb-1 text-right text-[8px] uppercase tracking-[0.15em] text-white/25">
              Intensity
            </p>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] text-white/25">0</span>

              <div
                className="h-[6px] w-20"
                style={{
                  background:
                    "linear-gradient(to right, #111923, #172b43, #24517a, #397fb8, #62a8ff, #d7a84a)",
                }}
              />

              <span className="font-mono text-[8px] text-white/30">
                {maxIntensity.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Measure
            </p>

            <p className="mt-1 text-[10px] text-[#62a8ff]/70">
              Events / active user
            </p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full px-3 pb-4 pt-4 sm:h-[340px] sm:px-5">
        {heatmapData.length > 0 ? (
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
