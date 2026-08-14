"use client";

import ReactECharts from "echarts-for-react";

import type { ProductPerformance } from "@/lib/api/metrics";

interface ProductRevenueSunburstProps {
  data: ProductPerformance[];
}

interface SunburstNode {
  name: string;
  value: number;
  conversion?: number;
  orders?: number;
  units?: number;
  views?: number;
  category?: string;
  children?: SunburstNode[];
}

const CATEGORY_COLORS = [
  "#62a8ff",
  "#d7a84a",
  "#4ade80",
  "#c084fc",
  "#f472b6",
  "#38bdf8",
  "#fb923c",
  "#a78bfa",
];

export function ProductRevenueSunburst({ data }: ProductRevenueSunburstProps) {
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

  const tree: SunburstNode[] = categories.map((category) => {
    const products = data.filter((item) => item.category === category);

    const revenue = products.reduce(
      (sum, item) => sum + item.successful_revenue,
      0,
    );

    const orders = products.reduce((sum, item) => sum + item.orders, 0);

    const units = products.reduce((sum, item) => sum + item.units_sold, 0);

    const views = products.reduce((sum, item) => sum + item.views, 0);

    const conversion = views > 0 ? (orders / views) * 100 : 0;

    return {
      name: category,

      value: revenue,

      conversion,

      orders,
      units,
      views,

      children: products
        .sort((a, b) => b.successful_revenue - a.successful_revenue)
        .map((item) => ({
          name: item.product_name,

          value: item.successful_revenue,

          conversion: item.conversion_rate * 100,

          orders: item.orders,

          units: item.units_sold,

          views: item.views,

          category,
        })),
    };
  });

  const totalRevenue = tree.reduce((sum, item) => sum + item.value, 0);

  const option = {
    animation: true,

    animationDuration: 1300,

    animationEasing: "cubicOut",

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

      formatter: (params: { data: SunburstNode }) => {
        const item = params.data;

        const revenueShare =
          totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;

        return `
          <div style="min-width:220px">

            <div style="
              color:#f4f1ea;
              font-size:13px;
              font-weight:600;
              margin-bottom:4px;
            ">
              ${escapeHtml(item.name)}
            </div>

            ${
              item.category
                ? `
                  <div style="
                    color:#718096;
                    font-size:9px;
                    text-transform:uppercase;
                    letter-spacing:0.12em;
                    margin-bottom:10px;
                  ">
                    ${escapeHtml(item.category)}
                  </div>
                `
                : ""
            }

            <div style="
              color:#4ade80;
              font-size:20px;
              font-weight:600;
              margin-bottom:10px;
            ">
              ${formatCurrency(item.value)}
            </div>

            <div style="
              display:grid;
              grid-template-columns:1fr auto;
              gap:7px 20px;
            ">

              <span style="color:#718096">
                Revenue share
              </span>

              <strong>
                ${revenueShare.toFixed(1)}%
              </strong>

              ${
                item.conversion !== undefined
                  ? `
                    <span style="color:#718096">
                      Conversion
                    </span>

                    <strong style="color:#62a8ff">
                      ${item.conversion.toFixed(1)}%
                    </strong>
                  `
                  : ""
              }

              ${
                item.orders !== undefined
                  ? `
                    <span style="color:#718096">
                      Orders
                    </span>

                    <strong>
                      ${item.orders.toLocaleString("en-IN")}
                    </strong>
                  `
                  : ""
              }

              ${
                item.units !== undefined
                  ? `
                    <span style="color:#718096">
                      Units sold
                    </span>

                    <strong>
                      ${item.units.toLocaleString("en-IN")}
                    </strong>
                  `
                  : ""
              }

              ${
                item.views !== undefined
                  ? `
                    <span style="color:#718096">
                      Views
                    </span>

                    <strong>
                      ${item.views.toLocaleString("en-IN")}
                    </strong>
                  `
                  : ""
              }

            </div>
          </div>
        `;
      },
    },

    series: [
      {
        type: "sunburst",

        data: tree,

        radius: ["16%", "88%"],

        center: ["50%", "50%"],

        sort: "desc",

        nodeClick: "zoomToNode",

        animation: true,

        emphasis: {
          focus: "ancestor",

          itemStyle: {
            shadowBlur: 20,

            shadowColor: "rgba(98,168,255,0.28)",
          },
        },

        label: {
          show: true,

          color: "#f4f1ea",

          fontSize: 9,

          rotate: "tangential",

          formatter: (params: { name: string; value: number }) => {
            if (!params.value) {
              return "";
            }

            return params.name;
          },
        },

        levels: [
          {
            r0: "16%",
            r: "32%",

            itemStyle: {
              borderWidth: 2,
              borderColor: "#0b1018",
            },

            label: {
              show: false,
            },
          },

          {
            r0: "32%",
            r: "62%",

            itemStyle: {
              borderWidth: 2,
              borderColor: "#0b1018",
            },

            label: {
              show: true,

              fontSize: 9,

              fontWeight: 500,
            },
          },

          {
            r0: "62%",
            r: "88%",

            itemStyle: {
              borderWidth: 1.5,
              borderColor: "#0b1018",
            },

            label: {
              show: false,
            },
          },
        ],

        itemStyle: {
          borderWidth: 2,

          borderColor: "#0b1018",
        },
      },
    ],
  };

  /*
   * Apply category colors recursively.
   *
   * Products get a lighter/darker variation of their
   * category color naturally through ECharts' opacity.
   */
  tree.forEach((category) => {
    const baseColor = categoryColor.get(category.name) ?? "#62a8ff";

    (
      category as SunburstNode & {
        itemStyle?: {
          color?: string;
        };
      }
    ).itemStyle = {
      color: baseColor,
    };

    category.children?.forEach((product) => {
      (
        product as SunburstNode & {
          itemStyle?: {
            color?: string;
          };
        }
      ).itemStyle = {
        color: adjustColor(baseColor, 18),
      };
    });
  });

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#d7a84a]/70">
              Revenue landscape
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Product revenue universe
            </h2>

            <p className="mt-1 text-[10px] text-white/25">
              Click a category to explore its products
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Total revenue
            </p>

            <p className="mt-1 font-mono text-sm text-[#4ade80]">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-[480px] sm:h-[530px]">
        {/* Center metric */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="mt-1 text-center">
            <p className="font-mono text-xl tracking-[-0.05em] text-[#f4f1ea] sm:text-2xl">
              {formatCompactCurrency(totalRevenue)}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-white/25">
              Successful revenue
            </p>
          </div>
        </div>

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
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(value)}`;
}

function adjustColor(hex: string, amount: number) {
  const value = hex.replace("#", "");

  const num = parseInt(value, 16);

  const r = Math.min(255, (num >> 16) + amount);

  const g = Math.min(255, ((num >> 8) & 0xff) + amount);

  const b = Math.min(255, (num & 0xff) + amount);

  return `rgb(${r}, ${g}, ${b})`;
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
