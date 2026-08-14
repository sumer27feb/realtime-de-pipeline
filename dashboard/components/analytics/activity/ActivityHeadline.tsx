"use client";

import ReactECharts from "echarts-for-react";

import type { EventActivity } from "@/lib/api/metrics";

interface ActivityHeadlineProps {
  data: EventActivity[];
}

export function ActivityHeadline({ data }: ActivityHeadlineProps) {
  const totalEvents = data.reduce((sum, item) => sum + item.event_count, 0);

  const averageIntensity =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.events_per_active_user, 0) /
        data.length
      : 0;

  const peakWindow = data.reduce<EventActivity | null>(
    (peak, item) =>
      !peak || item.event_count > peak.event_count ? item : peak,
    null,
  );

  const eventTotals = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.event_type] = (acc[item.event_type] ?? 0) + item.event_count;

    return acc;
  }, {});

  const leadingEvent = Object.entries(eventTotals).reduce<{
    type: string;
    count: number;
  } | null>(
    (leader, [type, count]) =>
      !leader || count > leader.count ? { type, count } : leader,
    null,
  );

  const chartData = Object.entries(eventTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name: formatEventType(name),
      value,
    }));

  const chartOption = {
    animation: true,
    animationDuration: 700,

    tooltip: {
      trigger: "item",
      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.25)",
      borderWidth: 1,
      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },
      formatter: (params: { name: string; value: number; percent: number }) => `
        <div style="font-size:11px">
          <div style="color:#8fa0b5;margin-bottom:4px">
            ${params.name}
          </div>
          <strong style="font-size:14px">
            ${params.value.toLocaleString()}
          </strong>
          <span style="color:#718096;margin-left:6px">
            ${params.percent.toFixed(1)}%
          </span>
        </div>
      `,
    },

    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,

        itemStyle: {
          borderColor: "#0b1018",
          borderWidth: 3,
        },

        label: {
          show: false,
        },

        labelLine: {
          show: false,
        },

        emphasis: {
          scale: true,
          scaleSize: 5,

          itemStyle: {
            shadowBlur: 18,
            shadowColor: "rgba(98,168,255,0.25)",
          },
        },

        data: chartData,
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
            Event Activity
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Stream at a glance
          </h2>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
            Event types
          </p>

          <p className="mt-1 font-mono text-sm text-[#62a8ff]">
            {chartData.length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.25fr]">
        {/* Total events */}
        <Metric
          label="Total events"
          value={totalEvents.toLocaleString()}
          accent
        />

        {/* Peak window */}
        <Metric
          label="Peak window"
          value={peakWindow ? peakWindow.event_count.toLocaleString() : "—"}
          suffix="events"
        />

        {/* Average intensity */}
        <Metric
          label="Avg intensity"
          value={averageIntensity > 0 ? averageIntensity.toFixed(2) : "—"}
          suffix="events / active user"
        />

        {/* Distribution */}
        <div className="col-span-2 flex min-h-[150px] items-center border-t border-white/10 p-5 lg:col-span-1 lg:border-l lg:border-t-0 sm:p-6">
          <div className="flex w-full items-center gap-5">
            <div className="h-[110px] w-[110px] shrink-0">
              <ReactECharts
                option={chartOption}
                style={{
                  height: "100%",
                  width: "100%",
                }}
                opts={{
                  renderer: "svg",
                }}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                Leading event
              </p>

              <p className="mt-2 truncate text-lg font-medium tracking-[-0.03em] text-[#f4f1ea]">
                {leadingEvent ? formatEventType(leadingEvent.type) : "—"}
              </p>

              <p className="mt-1 font-mono text-xs text-[#62a8ff]">
                {leadingEvent
                  ? `${leadingEvent.count.toLocaleString()} events`
                  : "No activity"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="min-h-[150px] border-r border-white/10 p-5 sm:p-6">
      <p className="text-[9px] uppercase tracking-[0.17em] text-white/30">
        {label}
      </p>

      <div
        className={`mt-5 text-2xl font-medium tracking-[-0.05em] sm:text-3xl ${
          accent ? "text-[#62a8ff]" : "text-[#f4f1ea]"
        }`}
      >
        {value}
      </div>

      {suffix && <p className="mt-2 text-[10px] text-white/25">{suffix}</p>}
    </div>
  );
}

function formatEventType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
