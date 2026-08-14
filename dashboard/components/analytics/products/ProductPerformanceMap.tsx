"use client";

import ReactECharts from "echarts-for-react";

import type { ProductPerformance } from "@/lib/api/metrics";

interface ProductPerformanceMapProps {
  data: ProductPerformance[];
}

const CATEGORY_COLORS = [
  "#62a8ff",
  "#d7a84a",
  "#4ade80",
  "#c084fc",
  "#f472b6",
  "#38bdf8",
];

export function ProductPerformanceMap({ data }: ProductPerformanceMapProps) {
  const categories = Array.from(new Set(data.map((item) => item.category)));

  const categoryColor = new Map(
    categories.map((category, index) => [
      category,
      CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    ]),
  );

  const scatterData = data.map((item) => [
    item.views,
    item.conversion_rate * 100,
    item.successful_revenue,
    item.orders,
    item.units_sold,
    item.unique_viewers,
    item.product_name,
    item.category,
  ]);

  const maxRevenue = Math.max(
    ...data.map((item) => item.successful_revenue),
    1,
  );

  const option = {
    animation: true,
    animationDuration: 1200,
    animationEasing: "cubicOut",

    tooltip: {
      trigger: "item",

      backgroundColor: "#0b1018",
      borderColor: "rgba(98,168,255,0.3)",
      borderWidth: 1,

      padding: [11, 14],

      textStyle: {
        color: "#f4f1ea",
        fontSize: 11,
      },

      formatter: (params: {
        value: [number, number, number, number, number, number, string, string];
      }) => {
        const [
          views,
          conversion,
          revenue,
          orders,
          units,
          viewers,
          product,
          category,
        ] = params.value;

        return `
          <div style="min-width:210px">
            <div style="
              color:#f4f1ea;
              font-size:12px;
              font-weight:600;
              margin-bottom:3px;
            ">
              ${product}
            </div>

            <div style="
              color:#718096;
              font-size:9px;
              margin-bottom:10px;
            ">
              ${category}
            </div>

            <div style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:7px 20px;
            ">
              <span style="color:#718096">
                Views
              </span>

              <strong>
                ${views.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Unique viewers
              </span>

              <strong>
                ${viewers.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Orders
              </span>

              <strong>
                ${orders.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Units
              </span>

              <strong>
                ${units.toLocaleString("en-IN")}
              </strong>

              <span style="color:#718096">
                Conversion
              </span>

              <strong style="color:#62a8ff">
                ${conversion.toFixed(1)}%
              </strong>

              <span style="color:#718096">
                Revenue
              </span>

              <strong style="color:#4ade80">
                ${formatCurrency(revenue)}
              </strong>
            </div>
          </div>
        `;
      },
    },

    legend: {
      top: 0,
      left: 0,

      icon: "circle",

      itemWidth: 7,
      itemHeight: 7,
      itemGap: 14,

      textStyle: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 9,
      },

      data: categories,
    },

    grid: {
      left: 12,
      right: 18,
      top: 42,
      bottom: 20,
      containLabel: true,
    },

    xAxis: {
      type: "value",

      name: "Views",

      nameLocation: "middle",
      nameGap: 28,

      nameTextStyle: {
        color: "rgba(255,255,255,0.22)",
        fontSize: 8,
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
        color: "rgba(255,255,255,0.25)",
        fontSize: 8,
      },

      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.045)",
        },
      },
    },

    yAxis: {
      type: "value",

      name: "Conversion",

      nameLocation: "middle",
      nameGap: 40,

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
        lineStyle: {
          color: "rgba(255,255,255,0.045)",
        },
      },
    },

    series: [
      {
        type: "scatter",

        data: scatterData,

        symbolSize: (value: number[]) => {
          const revenue = Number(value[2]);

          const normalized = revenue / maxRevenue;

          return 10 + normalized * 30;
        },

        itemStyle: {
          color: (params: { value: unknown[] }) => {
            const category = String(params.value[7]);

            return categoryColor.get(category) ?? "#62a8ff";
          },

          opacity: 0.75,

          shadowBlur: 8,
          shadowColor: "rgba(98,168,255,0.18)",
        },

        emphasis: {
          scale: 1.35,

          itemStyle: {
            opacity: 1,

            borderColor: "#f4f1ea",
            borderWidth: 1.5,

            shadowBlur: 24,
            shadowColor: "rgba(98,168,255,0.4)",
          },

          label: {
            show: true,

            position: "top",

            color: "#f4f1ea",

            fontSize: 9,

            formatter: (params: { value: unknown[] }) =>
              String(params.value[6]),
          },
        },

        markLine: {
          silent: true,

          symbol: "none",

          lineStyle: {
            type: "dashed",

            color: "rgba(255,255,255,0.08)",
          },

          label: {
            show: false,
          },

          data: [
            {
              yAxis:
                data.reduce(
                  (sum, item) => sum + item.conversion_rate * 100,
                  0,
                ) / Math.max(data.length, 1),
            },
          ],
        },
      },
    ],
  };

  return (
    <section className="border border-white/10 bg-[#0b1018]">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#62a8ff]/70">
            Product map
          </p>

          <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
            Traffic × conversion
          </h2>
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

      <div className="h-[470px] px-3 py-4 sm:h-[520px] sm:px-5">
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
          <Empty />
        )}
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-white/30">
      No product data available
    </div>
  );
}
