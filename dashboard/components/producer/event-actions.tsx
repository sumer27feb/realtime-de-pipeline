"use client";

import {
  CreditCard,
  Eye,
  Shuffle,
  ShoppingCart,
  UserRound,
} from "lucide-react";

interface EventActionsProps {
  loading: boolean;
  onUser: () => void;
  onView: () => void;
  onOrder: () => void;
  onPayment: () => void;
  onRandom: () => void;
}

export function EventActions({
  loading,
  onUser,
  onView,
  onOrder,
  onPayment,
  onRandom,
}: EventActionsProps) {
  return (
    <section className="bg-[#111113] p-6 sm:p-7">
      <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
        Generate event
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Action
          icon={<UserRound />}
          label="User"
          onClick={onUser}
          disabled={loading}
        />
        <Action
          icon={<Eye />}
          label="Product view"
          onClick={onView}
          disabled={loading}
        />
        <Action
          icon={<ShoppingCart />}
          label="Order"
          onClick={onOrder}
          disabled={loading}
        />
        <Action
          icon={<CreditCard />}
          label="Payment"
          onClick={onPayment}
          disabled={loading}
        />
      </div>

      <button
        disabled={loading}
        onClick={onRandom}
        className="mt-2 flex h-11 w-full items-center justify-between border border-[#d7a84a]/25 bg-[#d7a84a]/[0.045] px-4 text-xs text-[#d7a84a] transition hover:border-[#d7a84a]/60 hover:bg-[#d7a84a]/[0.09] disabled:opacity-30"
      >
        Generate random event
        <Shuffle className="h-4 w-4" />
      </button>
    </section>
  );
}

function Action({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="group flex h-11 items-center justify-between border border-white/10 px-4 text-xs text-white/55 transition hover:border-[#d7a84a]/40 hover:bg-[#d7a84a]/[0.035] hover:text-white disabled:opacity-30"
    >
      {label}

      <span className="text-white/25 transition group-hover:text-[#d7a84a]">
        {icon}
      </span>
    </button>
  );
}
