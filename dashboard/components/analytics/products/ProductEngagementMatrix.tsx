"use client";

import ReactECharts from "echarts-for-react";

import type { ProductPerformance } from "@/lib/api/metrics";

interface ProductEngagementMatrixProps {
  data: ProductPerformance[];
}

interface ProductPoint {
  views: number;
  conversion: number;
  revenue: number;
  orders: number;
  units: number;
  viewers: number;
  product: string;
  category: string;
}

const CATEGORY_COLORS = [
  "#62a8ff",
  "#d7a84a",
  "#4ade80",
  "#c084fc",
  "#f472b6",
  "#38bdf8",
];

export function ProductEngagementMatrix({
  data,
}: ProductEngagementMatrixProps) {
  if (!data.length) {
    return <EmptyState />;
  }

  const categories = Array.from(new Set(data.map((item) => item.category)));

  const categoryColor = new Map(
    categories.map((category, index) => [
      category,
      CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    ]),
  );

  const points: ProductPoint[] = data.map((item) => ({
    views: item.views,
    conversion: item.conversion_rate * 100,
    revenue: item.successful_revenue,
    orders: item.orders,
    units: item.units_sold,
    viewers: item.unique_viewers,
    product: item.product_name,
    category: item.category,
  }));

  const averageConversion =
    points.reduce((sum, item) => sum + item.conversion, 0) / points.length;

  const averageRevenue =
    points.reduce((sum, item) => sum + item.revenue, 0) / points.length;

  const maxRevenue = Math.max(...points.map((item) => item.revenue), 1);

  const maxViews = Math.max(...points.map((item) => item.views), 1);

  /*
   * We use revenue per 1,000 views as the Y-axis.
   *
   * This is much more useful than plotting unique viewers against
   * views because it answers:
   *
   * "Which products are actually monetizing their traffic?"
   */
  const enrichedPoints = points.map((item) => ({
    ...item,
    revenueEfficiency: item.views > 0 ? (item.revenue / item.views) * 1000 : 0,
  }));

  const averageEfficiency =
    enrichedPoints.reduce((sum, item) => sum + item.revenueEfficiency, 0) /
    enrichedPoints.length;

  const maxEfficiency = Math.max(
    ...enrichedPoints.map((item) => item.revenueEfficiency),
    1,
  );

  /*
   * Label only meaningful outliers.
   * Labeling every product makes dense scatter plots unreadable.
   */
  const labelCandidates = [...enrichedPoints]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, Math.min(5, enrichedPoints.length));

  const labelSet = new Set(labelCandidates.map((item) => item.product));

  const option = {
    animation: true,
    animationDuration: 1200,
    animationEasing: "cubicOut",

    backgroundColor: "transparent",

    tooltip: {
      trigger: "item",

      confine: true,

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.35)",
      borderWidth: 1,

      padding: [12, 14],

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: { value: number[] }) => {
        const index = params.value[6];

        const item = enrichedPoints[index];

        if (!item) {
          return "";
        }

        const trafficToViewer =
          item.views > 0 ? (item.viewers / item.views) * 100 : 0;

        return `
          <div style="min-width:230px">

            <div style="
              color:#f4f1ea;
              font-size:13px;
              font-weight:600;
              margin-bottom:3px;
            ">
              ${escapeHtml(item.product)}
            </div>

            <div style="
              color:#718096;
              font-size:9px;
              text-transform:uppercase;
              letter-spacing:0.12em;
              margin-bottom:12px;
            ">
              ${escapeHtml(item.category)}
            </div>

            <div style="
              display:grid;
              grid-template-columns:1fr auto;
              gap:7px 24px;
            ">

              <span style="color:#718096">
                Conversion
              </span>

              <strong style="color:#62a8ff">
                ${item.conversion.toFixed(1)}%
              </strong>

              <span style="color:#718096">
                Revenue
              </span>

              <strong style="color:#4ade80">
                ${formatCurrency(item.revenue)}
              </strong>

              <span style="color:#718096">
                Revenue / 1K views
              </span>

              <strong>
                ${formatCurrency(item.revenueEfficiency)}
              </strong>

              <span style="color:#718096">
                Views
              </span>

              <strong>
                ${item.views.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Unique viewers
              </span>

              <strong>
                ${item.viewers.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Orders
              </span>

              <strong>
                ${item.orders.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Units sold
              </span>

              <strong>
                ${item.units.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Viewer / view
              </span>

              <strong>
                ${trafficToViewer.toFixed(1)}%
              </strong>

            </div>
          </div>
        `;
      },
    },

    legend: {
      top: 0,
      left: 0,

      type: "scroll",

      icon: "circle",

      itemWidth: 7,
      itemHeight: 7,
      itemGap: 14,

      textStyle: {
        color: "rgba(255,255,255,0.42)",
        fontSize: 9,
      },

      data: categories,
    },

    grid: {
      left: 18,
      right: 24,
      top: 48,
      bottom: 30,
      containLabel: true,
    },

    xAxis: {
      type: "value",

      name: "CONVERSION RATE",

      nameLocation: "middle",
      nameGap: 28,

      nameTextStyle: {
        color: "rgba(255,255,255,0.25)",
        fontSize: 8,
        fontWeight: 500,
      },

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
        fontSize: 8,

        formatter: (value: number) => `${value.toFixed(0)}%`,
      },

      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.045)",
        },
      },

      min: 0,
      max: (value: { max: number }) => Math.ceil(value.max * 1.08),
    },

    yAxis: {
      type: "value",

      name: "REVENUE / 1K VIEWS",

      nameLocation: "middle",
      nameGap: 44,

      nameTextStyle: {
        color: "rgba(255,255,255,0.25)",
        fontSize: 8,
        fontWeight: 500,
      },

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        color: "rgba(255,255,255,0.28)",
        fontSize: 8,

        formatter: (value: number) => formatCompactCurrency(value),
      },

      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.045)",
        },
      },

      min: 0,
      max: Math.max(maxEfficiency * 1.12, averageEfficiency * 2),
    },

    /*
     * These four areas make the scatter immediately interpretable.
     */
    series: [
      {
        name: "Product performance",

        type: "scatter",

        data: enrichedPoints.map((item, index) => [
          item.conversion,
          item.revenueEfficiency,
          item.revenue,
          item.views,
          item.orders,
          item.units,
          index,
        ]),

        symbolSize: (value: number[]) => {
          const revenue = Number(value[2]);

          const normalized = revenue / maxRevenue;

          return 10 + normalized * 32;
        },

        itemStyle: {
          color: (params: { value: number[] }) => {
            const item = enrichedPoints[Number(params.value[6])];

            return categoryColor.get(item?.category) ?? "#62a8ff";
          },

          opacity: 0.72,
        },

        label: {
          show: true,

          position: "top",

          color: "rgba(244,241,234,0.7)",

          fontSize: 8,

          formatter: (params: { value: number[] }) => {
            const item = enrichedPoints[Number(params.value[6])];

            return item && labelSet.has(item.product) ? item.product : "";
          },
        },

        emphasis: {
          scale: 1.35,

          itemStyle: {
            opacity: 1,

            borderColor: "#f4f1ea",
            borderWidth: 1.5,

            shadowBlur: 25,
            shadowColor: "rgba(98,168,255,0.38)",
          },

          label: {
            show: true,

            color: "#f4f1ea",

            fontSize: 9,

            fontWeight: 500,
          },
        },

        markLine: {
          silent: true,

          symbol: "none",

          lineStyle: {
            type: "dashed",
            width: 1,
            color: "rgba(255,255,255,0.12)",
          },

          label: {
            show: true,

            color: "rgba(255,255,255,0.25)",
            fontSize: 8,

            formatter: (params: { name?: string }) => params.name ?? "",
          },

          data: [
            {
              xAxis: averageConversion,
              name: "Avg conversion",
            },
            {
              yAxis: averageEfficiency,
              name: "Avg efficiency",
            },
          ],
        },

        markArea: {
          silent: true,

          itemStyle: {
            color: "rgba(98,168,255,0.018)",
          },

          data: [
            [
              {
                xAxis: averageConversion,
                yAxis: averageEfficiency,
              },
              {
                xAxis: "max",
                yAxis: "max",
              },
            ],
          ],
        },
      },
    ],

    dataZoom: [
      {
        type: "inside",

        xAxisIndex: 0,

        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
              Product intelligence
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Engagement matrix
            </h2>

            <p className="mt-1 text-[10px] text-white/25">
              Find products that convert traffic into revenue
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Bubble size
            </p>

            <p className="mt-1 text-[10px] text-[#4ade80]/70">
              Successful revenue
            </p>
          </div>
        </div>
      </div>

      <div className="h-[480px] px-3 py-4 sm:h-[530px] sm:px-5">
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
    </section>
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatCompactCurrency(value: number) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(value)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function EmptyState() {
  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="flex h-[400px] items-center justify-center text-xs text-white/30">
        No product data available
      </div>
    </section>
  );
}
