"use client";

import type { EcommerceOverview } from "@/lib/api/metrics";

interface OverviewKpiStripProps {
  data: EcommerceOverview;
}

export function OverviewKpiStrip({ data }: OverviewKpiStripProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard label="Total Users" value={data.total_users.toLocaleString()} />

      <KpiCard
        label="Product Views"
        value={data.total_product_views.toLocaleString()}
      />

      <KpiCard label="Orders" value={data.total_orders.toLocaleString()} />

      <KpiCard
        label="Successful Revenue"
        value={`₹${data.successful_revenue.toLocaleString("en-IN")}`}
      />

      <KpiCard
        label="Payment Success"
        value={`${(data.payment_success_rate * 100).toFixed(2)}%`}
      />
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative overflow-hidden border border-white/10 bg-[#0d1118] px-5 py-4 transition-colors duration-200 hover:border-[#62a8ff]/30">
      <div className="absolute inset-y-0 left-0 w-[2px] bg-[#62a8ff]/60 transition-all duration-200 group-hover:bg-[#62a8ff]" />

      <div className="pl-2">
        <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
          {label}
        </p>

        <p className="mt-3 truncate text-2xl font-medium tracking-[-0.045em] text-[#f1f3f6] sm:text-[1.7rem]">
          {value}
        </p>
      </div>
    </div>
  );
}
