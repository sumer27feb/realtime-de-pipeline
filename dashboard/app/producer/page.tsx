"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  clearState,
  exportState,
  generateOrder,
  generatePayment,
  generateProductView,
  generateRandom,
  generateUser,
  getProducerStatus,
  startProducer,
  stopProducer,
  type ProducerStatus,
} from "@/lib/api/producer";

import { ProducerHeader } from "@/components/producer/producer-header";
import { ProducerControls } from "@/components/producer/producer-controls";
import { EventActions } from "@/components/producer/event-actions";
import { RuntimeStrip } from "@/components/producer/runtime-strip";

export default function ProducerPage() {
  const [status, setStatus] = useState<ProducerStatus | null>(null);
  const [rate, setRate] = useState(10);
  const [kafka, setKafka] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getProducerStatus());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Producer API unavailable");
    }
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, 2000);

    return () => clearInterval(interval);
  }, [refresh]);

  async function run(action: () => Promise<unknown>) {
    try {
      setLoading(true);
      setError(null);
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadState() {
    try {
      setLoading(true);

      const blob = await exportState();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "ecommerce_state.csv";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  const running = status?.is_generating ?? false;

  /*
   * These four names may need adjustment once we see the exact
   * get_state_summary() response.
   */
  const value = (key: string) => {
    const result = status?.[key];

    return typeof result === "number" ? result.toLocaleString() : "—";
  };

  return (
    <main className="min-h-dvh bg-[#0b0b0c] text-[#f4f1ea]">
      <div className="mx-auto flex min-h-dvh max-w-[1500px] flex-col px-5 sm:px-8 lg:px-12">
        <ProducerHeader />

        <div className="flex flex-1 flex-col py-6">
          {/* Heading */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#d7a84a]">
                Event engine
              </div>

              <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
                Producer
              </h1>
            </div>

            {error && (
              <div className="hidden max-w-sm truncate text-right text-[10px] text-[#d7a84a]/80 sm:block">
                {error}
              </div>
            )}
          </div>

          {/* Main console */}
          <div className="grid flex-1 gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid min-h-0 grid-rows-[1fr_auto] gap-px bg-white/10">
              <ProducerControls
                running={running}
                eventsPerSecond={status?.events_per_second ?? rate}
                publishToKafka={kafka}
                loading={loading}
                onRateChange={setRate}
                onModeChange={setKafka}
                onStart={() => run(() => startProducer(rate, kafka))}
                onStop={() => run(stopProducer)}
              />

              <RuntimeStrip
                users={value("users")}
                views={value("product_views")}
                orders={value("orders")}
                payments={value("payments")}
                failures={status?.publish_failures?.toLocaleString() ?? "0"}
              />
            </div>

            <div className="grid min-h-0 grid-rows-[1fr_auto] gap-px bg-white/10">
              <EventActions
                loading={loading}
                onUser={() => run(generateUser)}
                onView={() => run(generateProductView)}
                onOrder={() => run(generateOrder)}
                onPayment={() => run(generatePayment)}
                onRandom={() => run(generateRandom)}
              />

              <section className="bg-[#111113] p-6 sm:p-7">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                  State
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    disabled={loading || running}
                    onClick={downloadState}
                    className="h-10 flex-1 border border-white/10 text-[10px] uppercase tracking-[0.12em] text-white/45 transition hover:border-white/25 hover:text-white disabled:opacity-25"
                  >
                    Export
                  </button>

                  <button
                    disabled={loading || running}
                    onClick={() => run(clearState)}
                    className="h-10 flex-1 border border-red-400/15 text-[10px] uppercase tracking-[0.12em] text-red-300/60 transition hover:border-red-400/35 hover:text-red-300 disabled:opacity-25"
                  >
                    Clear
                  </button>
                </div>

                {status?.last_error && (
                  <p className="mt-3 truncate text-[10px] text-[#d7a84a]/70">
                    {status.last_error}
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
