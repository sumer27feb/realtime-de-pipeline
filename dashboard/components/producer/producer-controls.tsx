"use client";

import { CircleStop, Play } from "lucide-react";

interface ProducerControlsProps {
  running: boolean;
  eventsPerSecond: number;
  publishToKafka: boolean;
  loading: boolean;
  onRateChange: (value: number) => void;
  onModeChange: (kafka: boolean) => void;
  onStart: () => void;
  onStop: () => void;
}

export function ProducerControls({
  running,
  eventsPerSecond,
  publishToKafka,
  loading,
  onRateChange,
  onModeChange,
  onStart,
  onStop,
}: ProducerControlsProps) {
  return (
    <section className="flex min-h-0 flex-col justify-between bg-[#111113] p-6 sm:p-7">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Producer
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  running
                    ? "bg-[#d7a84a] shadow-[0_0_12px_rgba(215,168,74,.65)]"
                    : "bg-white/20"
                }`}
              />

              <span className="text-xl font-medium tracking-[-0.04em]">
                {running ? "Running" : "Stopped"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
              Mode
            </div>

            <div className="mt-2 text-xs uppercase tracking-[0.12em] text-[#d7a84a]">
              {publishToKafka ? "Kafka" : "Local"}
            </div>
          </div>
        </div>

        <div className="mt-9">
          <div className="flex items-end justify-between">
            <div className="text-xs text-white/40">Generation rate</div>

            <div className="font-mono text-3xl tracking-[-0.06em] text-[#d7a84a]">
              {eventsPerSecond}
              <span className="ml-2 text-xs tracking-normal text-white/30">
                / sec
              </span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={50}
            value={eventsPerSecond}
            disabled={running || loading}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="mt-5 w-full accent-[#d7a84a]"
          />

          <div className="mt-1 flex justify-between text-[9px] text-white/20">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-2 text-[9px] uppercase tracking-[0.16em] text-white/25">
            Publishing
          </div>

          <div className="flex gap-2">
            <ModeButton
              active={!publishToKafka}
              disabled={running || loading}
              onClick={() => onModeChange(false)}
            >
              Local
            </ModeButton>

            <ModeButton
              active={publishToKafka}
              disabled={running || loading}
              onClick={() => onModeChange(true)}
            >
              Kafka
            </ModeButton>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={running ? onStop : onStart}
        className="mt-8 flex h-12 items-center justify-between bg-[#d7a84a] px-5 text-sm font-semibold text-[#111113] transition hover:bg-[#e8c66f] disabled:opacity-50"
      >
        <span>
          {loading
            ? running
              ? "Stopping..."
              : "Starting..."
            : running
              ? "Stop producer"
              : "Start producer"}
        </span>

        {running ? (
          <CircleStop className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>
    </section>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-10 flex-1 border text-[10px] uppercase tracking-[0.15em] transition ${
        active
          ? "border-[#d7a84a] bg-[#d7a84a]/10 text-[#d7a84a]"
          : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/60"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}
