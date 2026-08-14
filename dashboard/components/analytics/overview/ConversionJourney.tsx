"use client";

import ReactECharts from "echarts-for-react";
import type { EcommerceOverview } from "@/lib/api/metrics";

interface ConversionJourneyProps {
  data: EcommerceOverview;
}

export function ConversionJourney({ data }: ConversionJourneyProps) {
  const option = {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number; percent: number }) => {
        return `
          <div style="font-size:12px">
            <div style="font-weight:600;margin-bottom:4px">
              ${params.name}
            </div>
            <div>
              ${params.value.toLocaleString("en-IN")}
            </div>
          </div>
        `;
      },
    },

    series: [
      {
        type: "funnel",

        left: "5%",
        top: "8%",
        bottom: "8%",
        width: "90%",

        min: 0,
        max: data.total_product_views,

        minSize: "12%",
        maxSize: "100%",

        sort: "descending",

        gap: 6,

        label: {
          show: true,
          position: "inside",
          color: "#f4f1ea",
          fontSize: 12,
          fontWeight: 500,
          formatter: (params: { name: string; value: number }) => {
            return `${params.name}\n${params.value.toLocaleString("en-IN")}`;
          },
        },

        labelLine: {
          show: false,
        },

        itemStyle: {
          borderColor: "#05080d",
          borderWidth: 2,
        },

        emphasis: {
          label: {
            fontSize: 13,
            fontWeight: 600,
          },
        },

        data: [
          {
            name: "Product Views",
            value: data.total_product_views,
          },
          {
            name: "Orders",
            value: data.total_orders,
          },
          {
            name: "Payment Attempts",
            value: data.total_payment_attempts,
          },
          {
            name: "Successful Payments",
            value: data.successful_payments,
          },
        ],
      },
    ],
  };

  return (
    <section className="min-h-0 border border-white/10 bg-[#0d1118]">
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
            Conversion Journey
          </p>

          <h2 className="mt-1 text-base font-medium tracking-[-0.02em] text-white">
            From view to successful payment
          </h2>
        </div>

        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
            View → Order
          </p>

          <p className="mt-1 text-sm font-medium text-[#62a8ff]">
            {(data.view_to_order_rate * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full px-2 pb-3">
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

      <div className="grid grid-cols-2 border-t border-white/10">
        <div className="border-r border-white/10 px-5 py-3">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
            Payment Success
          </p>

          <p className="mt-1 text-sm font-medium text-white">
            {(data.payment_success_rate * 100).toFixed(2)}%
          </p>
        </div>

        <div className="px-5 py-3">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
            View → Payment
          </p>

          <p className="mt-1 text-sm font-medium text-white">
            {(
              (data.successful_payments / data.total_product_views) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>
      </div>
    </section>
  );
}
