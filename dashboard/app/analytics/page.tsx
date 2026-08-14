"use client";

import { useState } from "react";

import { OverviewDashboard } from "@/components/analytics/OverviewDashboard";
import { ActivityDashboard } from "@/components/analytics/ActivityDashboard";
import { ConversionDashboard } from "@/components/analytics/ConversionDashboard";
import { PaymentPerformanceDashboard } from "@/components/analytics/PaymentDashboard";
import { ProductPerformanceDashboard } from "@/components/analytics/ProductDashboard";

const models = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "activity",
    label: "Event Activity",
  },
  {
    id: "conversion",
    label: "Conversion Funnel",
  },
  {
    id: "payments",
    label: "Payment Performance",
  },
  {
    id: "products",
    label: "Product Performance",
  },
] as const;

type ModelId = (typeof models)[number]["id"];

export default function AnalyticsPage() {
  const [selectedModel, setSelectedModel] = useState<ModelId>("overview");

  return (
    <main className="min-h-dvh bg-[#05080d] text-white">
      {/* Persistent analytics navigation */}
      <header className="border-b border-white/10">
        <div className="flex h-16 items-center px-6">
          {/* Brand */}
          <div className="mr-12 shrink-0 text-lg font-semibold tracking-[-0.03em]">
            E-Commerce <span className="text-[#62a8ff]">Pulse</span>
          </div>

          {/* Model navigation */}
          <nav className="flex h-full items-center gap-8">
            {models.map((model) => {
              const active = selectedModel === model.id;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative flex h-full items-center text-sm transition-colors ${
                    active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {model.label}

                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#62a8ff]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Global navigation */}
          <div className="ml-auto flex items-center gap-7 text-sm">
            <a
              href="/"
              className="text-white/70 transition-colors hover:text-white"
            >
              Home
            </a>

            <a
              href="/producer"
              className="text-white/70 transition-colors hover:text-white"
            >
              Producer
            </a>
          </div>
        </div>
      </header>

      {/* Selected analytics model */}
      <section className="px-8 py-6">
        {selectedModel === "overview" && <OverviewDashboard />}

        {selectedModel === "activity" && <ActivityDashboard />}

        {selectedModel === "conversion" && <ConversionDashboard />}

        {selectedModel === "payments" && <PaymentPerformanceDashboard />}

        {selectedModel === "products" && <ProductPerformanceDashboard />}
      </section>
    </main>
  );
}

function ModelPlaceholder({ model }: { model: ModelId }) {
  const title = models.find((item) => item.id === model)?.label;

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-[#62a8ff]/60">
          Analytics Model
        </div>

        <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em]">
          {title}
        </h1>

        <p className="mt-3 text-sm text-white/40">
          Dashboard content will appear here.
        </p>
      </div>
    </div>
  );
}
