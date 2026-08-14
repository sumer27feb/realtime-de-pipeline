"use client";

import ReactECharts from "echarts-for-react";
import type { EcommerceOverview } from "@/lib/api/metrics";

interface AudiencePanelProps {
  data: EcommerceOverview;
}

export function AudiencePanel({ data }: AudiencePanelProps) {
  const viewsPerUser =
    data.total_users > 0 ? data.total_product_views / data.total_users : 0;

  const option = {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "item",
      backgroundColor: "#111820",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: {
        color: "#f4f1ea",
        fontSize: 12,
      },
    },

    grid: {
      left: 8,
      right: 8,
      top: 10,
      bottom: 10,
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: ["Users", "Unique Viewers"],
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 9,
      },
    },

    yAxis: {
      type: "value",
      show: false,
    },

    series: [
      {
        type: "bar",
        barWidth: "34%",
        data: [
          {
            value: data.total_users,
            itemStyle: {
              color: "rgba(255,255,255,0.18)",
              borderRadius: [3, 3, 0, 0],
            },
          },
          {
            value: data.unique_viewers,
            itemStyle: {
              color: "#62a8ff",
              borderRadius: [3, 3, 0, 0],
            },
          },
        ],

        label: {
          show: true,
          position: "top",
          color: "#f4f1ea",
          fontSize: 12,
          fontWeight: 500,
          formatter: (params: { value: number }) =>
            params.value.toLocaleString("en-IN"),
        },

        emphasis: {
          itemStyle: {
            opacity: 0.85,
          },
        },
      },
    ],
  };

  return (
    <section className="min-h-0 border border-white/10 bg-[#0d1118]">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
          Audience
        </p>

        <h2 className="mt-1 text-base font-medium tracking-[-0.02em] text-white">
          Reach & engagement
        </h2>
      </div>

      <div className="grid min-h-[260px] grid-cols-1 sm:grid-cols-[1.15fr_0.85fr]">
        {/* Audience comparison */}
        <div className="min-h-[230px] p-4">
          <ReactECharts
            option={option}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "230px",
            }}
            opts={{
              renderer: "svg",
            }}
          />
        </div>

        {/* Engagement metric */}
        <div className="flex flex-col justify-center border-t border-white/10 p-6 sm:border-l sm:border-t-0">
          <p className="text-[9px] uppercase tracking-[0.17em] text-white/30">
            Views / User
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-medium tracking-[-0.06em] text-[#f4f1ea]">
              {viewsPerUser.toFixed(2)}
            </span>

            <span className="text-xs text-white/30">views</span>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <Metric label="Total users" value={data.total_users} />

            <Metric label="Unique viewers" value={data.unique_viewers} />

            <Metric label="Product views" value={data.total_product_views} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-white/35">{label}</span>

      <span className="font-mono text-xs text-white/75">
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
