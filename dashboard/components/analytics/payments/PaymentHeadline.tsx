"use client";

import ReactECharts from "echarts-for-react";

import type { PaymentPerformance } from "@/lib/api/metrics";

interface PaymentHeadlineProps {
  data: PaymentPerformance[];
}

export function PaymentHeadline({ data }: PaymentHeadlineProps) {
  const totalAttempts = data.reduce(
    (sum, item) => sum + item.total_attempts,
    0,
  );

  const successfulAttempts = data.reduce(
    (sum, item) => sum + item.successful_attempts,
    0,
  );

  const failedAttempts = data.reduce(
    (sum, item) => sum + item.failed_attempts,
    0,
  );

  const pendingAttempts = data.reduce(
    (sum, item) => sum + item.pending_attempts,
    0,
  );

  const totalAmount = data.reduce(
    (sum, item) => sum + item.total_payment_amount,
    0,
  );

  const successfulAmount = data.reduce(
    (sum, item) => sum + item.successful_payment_amount,
    0,
  );

  const successRate =
    totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

  const failureRate =
    totalAttempts > 0 ? (failedAttempts / totalAttempts) * 100 : 0;

  const pendingRate =
    totalAttempts > 0 ? (pendingAttempts / totalAttempts) * 100 : 0;

  const option = {
    animation: true,
    animationDuration: 1000,

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
          width: 9,

          itemStyle: {
            color: "#4ade80",
          },
        },

        axisLine: {
          roundCap: true,

          lineStyle: {
            width: 9,

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

          fontSize: 24,
          fontWeight: 500,

          formatter: (value: number | string) => `${Number(value).toFixed(1)}%`,
        },

        title: {
          show: true,

          offsetCenter: [0, "35%"],

          color: "rgba(255,255,255,0.3)",
          fontSize: 8,
        },

        data: [
          {
            value: successRate,
            name: "SUCCESS RATE",
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
              Payments
            </p>

            <h2 className="mt-1 text-lg font-medium tracking-[-0.04em] text-[#f4f1ea]">
              Payment health
            </h2>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
              Channels
            </p>

            <p className="mt-1 font-mono text-sm text-[#62a8ff]">
              {data.length}
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
          <Metric label="Attempts" value={totalAttempts} />

          <Metric
            label="Successful"
            value={successfulAttempts}
            accent="#4ade80"
          />

          <Metric label="Failed" value={failedAttempts} accent="#f87171" />

          <Metric label="Pending" value={pendingAttempts} accent="#d7a84a" />

          <div className="col-span-2 border-t border-white/10 p-5 sm:p-6">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
              Payment volume
            </p>

            <p className="mt-2 font-mono text-xl text-[#f4f1ea]">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="col-span-2 border-t border-white/10 p-5 sm:p-6 sm:border-l">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
              Successful volume
            </p>

            <p className="mt-2 font-mono text-xl text-[#4ade80]">
              {formatCurrency(successfulAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/10">
        <Rate label="Success" value={successRate} color="#4ade80" />

        <Rate label="Failure" value={failureRate} color="#f87171" />

        <Rate label="Pending" value={pendingRate} color="#d7a84a" />
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
  value: number;
  accent?: string;
}) {
  return (
    <div className="min-h-[105px] border-b border-white/10 p-5 sm:p-6">
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <p
        className="mt-3 font-mono text-xl tracking-[-0.04em]"
        style={{
          color: accent ?? "#f4f1ea",
        }}
      >
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function Rate({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 text-center sm:p-5">
      <div
        className="mx-auto mb-2 h-1 w-6"
        style={{ backgroundColor: color }}
      />

      <p className="text-[8px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm" style={{ color }}>
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}
