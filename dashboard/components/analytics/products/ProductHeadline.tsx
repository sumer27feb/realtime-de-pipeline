"use client";

import ReactECharts from "echarts-for-react";

import type { ProductPerformance } from "@/lib/api/metrics";

interface ProductHeadlineProps {
  data: ProductPerformance[];
}

export function ProductHeadline({ data }: ProductHeadlineProps) {
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  const uniqueViewers = data.reduce(
    (sum, item) => sum + item.unique_viewers,
    0,
  );

  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  const unitsSold = data.reduce((sum, item) => sum + item.units_sold, 0);

  const orderValue = data.reduce((sum, item) => sum + item.order_value, 0);

  const revenue = data.reduce((sum, item) => sum + item.successful_revenue, 0);

  const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

  const revenuePerOrder = totalOrders > 0 ? revenue / totalOrders : 0;

  const option = {
    animation: true,
    animationDuration: 900,

    series: [
      {
        type: "gauge",

        center: ["50%", "50%"],
        radius: "82%",

        startAngle: 90,
        endAngle: -270,

        min: 0,
        max: 100,

        pointer: {
          show: false,
        },

        progress: {
          show: true,
          roundCap: true,
          width: 8,

          itemStyle: {
            color: "#62a8ff",
          },
        },

        axisLine: {
          roundCap: true,

          lineStyle: {
            width: 8,

            color: [[1, "rgba(255,255,255,0.06)"]],
          },
        },

        axisTick: {
          show: false,
        },

        splitLine: {
          show: false,
        },

        axisLabel: {
          show: false,
        },

        anchor: {
          show: false,
        },

        detail: {
          valueAnimation: true,

          offsetCenter: [0, "3%"],

          color: "#f4f1ea",

          fontSize: 23,
          fontWeight: 500,

          formatter: (value: number | string) => `${Number(value).toFixed(1)}%`,
        },

        title: {
          show: true,

          offsetCenter: [0, "34%"],

          color: "rgba(255,255,255,0.3)",
          fontSize: 8,
        },

        data: [
          {
            value: conversionRate,
            name: "CATALOG CONVERSION",
          },
        ],
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
              Products
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Product performance
            </h2>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Catalog
            </p>

            <p className="mt-1 font-mono text-sm text-[#62a8ff]">
              {data.length} products
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
        <div className="relative h-[220px] border-b border-white/10 lg:border-b-0 lg:border-r">
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          <Metric label="Products" value={data.length} />

          <Metric label="Views" value={totalViews} />

          <Metric label="Unique viewers" value={uniqueViewers} />

          <Metric label="Orders" value={totalOrders} />

          <Metric label="Units sold" value={unitsSold} />

          <Metric label="Order value" value={formatCurrency(orderValue)} />

          <Metric
            label="Revenue"
            value={formatCurrency(revenue)}
            accent="#4ade80"
          />

          <Metric
            label="Revenue / order"
            value={formatCurrency(revenuePerOrder)}
            accent="#d7a84a"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="min-h-[100px] border-b border-white/10 p-5 sm:p-6">
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <p
        className="mt-3 font-mono text-lg tracking-[-0.04em]"
        style={{
          color: accent ?? "#f4f1ea",
        }}
      >
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}
