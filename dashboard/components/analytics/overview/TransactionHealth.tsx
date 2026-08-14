"use client";

import ReactECharts from "echarts-for-react";
import type { EcommerceOverview } from "@/lib/api/metrics";

interface TransactionHealthProps {
  data: EcommerceOverview;
}

export function TransactionHealth({ data }: TransactionHealthProps) {
  const attemptsPerOrder =
    data.total_orders > 0 ? data.total_payment_attempts / data.total_orders : 0;

  const unsuccessfulPayments = Math.max(
    data.total_payment_attempts - data.successful_payments,
    0,
  );

  const successPercent = data.payment_success_rate * 100;

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
      formatter: (params: { name: string; value: number }) => {
        return `
          <div style="font-size:12px">
            <div style="font-weight:600;margin-bottom:4px">
              ${params.name}
            </div>
            <div>${params.value.toLocaleString("en-IN")}</div>
          </div>
        `;
      },
    },

    series: [
      {
        type: "pie",

        radius: ["68%", "82%"],
        center: ["50%", "50%"],

        avoidLabelOverlap: false,

        label: {
          show: true,
          position: "center",

          formatter: () =>
            `{value|${successPercent.toFixed(1)}%}\n{label|SUCCESS}`,

          rich: {
            value: {
              fontSize: 27,
              fontWeight: 500,
              color: "#f4f1ea",
              lineHeight: 34,
            },

            label: {
              fontSize: 8,
              fontWeight: 500,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: 2,
            },
          },
        },

        labelLine: {
          show: false,
        },

        data: [
          {
            name: "Successful",
            value: data.successful_payments,
            itemStyle: {
              color: "#62a8ff",
            },
          },
          {
            name: "Unsuccessful",
            value: unsuccessfulPayments,
            itemStyle: {
              color: "rgba(255,255,255,0.07)",
            },
          },
        ],

        itemStyle: {
          borderColor: "#0d1118",
          borderWidth: 3,
        },

        emphasis: {
          scale: true,
          scaleSize: 4,
        },
      },
    ],
  };

  return (
    <section className="min-h-0 border border-white/10 bg-[#0d1118]">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
          Transaction Health
        </p>

        <h2 className="mt-1 text-base font-medium tracking-[-0.02em] text-white">
          Payment reliability
        </h2>
      </div>

      <div className="grid min-h-[260px] grid-cols-1 sm:grid-cols-[0.9fr_1.1fr]">
        {/* Success visualization */}
        <div className="flex min-h-[240px] items-center justify-center p-4">
          <ReactECharts
            option={option}
            style={{
              width: "100%",
              height: "240px",
            }}
            opts={{
              renderer: "svg",
            }}
          />
        </div>

        {/* Transaction metrics */}
        <div className="grid grid-cols-2 content-center border-t border-white/10 sm:border-l sm:border-t-0">
          <TransactionMetric
            label="Payment Attempts"
            value={data.total_payment_attempts.toLocaleString("en-IN")}
          />

          <TransactionMetric
            label="Successful"
            value={data.successful_payments.toLocaleString("en-IN")}
            accent
          />

          <TransactionMetric
            label="Attempts / Order"
            value={attemptsPerOrder.toFixed(2)}
          />

          <TransactionMetric
            label="Avg Order Value"
            value={`₹${data.average_order_value.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}`}
          />
        </div>
      </div>
    </section>
  );
}

function TransactionMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-b border-r border-white/10 px-5 py-5 last:border-b-0">
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-medium tracking-[-0.04em] ${
          accent ? "text-[#62a8ff]" : "text-[#f4f1ea]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
