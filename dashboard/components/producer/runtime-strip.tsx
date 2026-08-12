interface RuntimeStripProps {
  users: string;
  views: string;
  orders: string;
  payments: string;
  failures: string;
}

export function RuntimeStrip({
  users,
  views,
  orders,
  payments,
  failures,
}: RuntimeStripProps) {
  const metrics = [
    ["Users", users],
    ["Views", views],
    ["Orders", orders],
    ["Payments", payments],
    ["Failures", failures],
  ];

  return (
    <section className="grid grid-cols-2 border border-white/10 bg-[#111113] sm:grid-cols-5">
      {metrics.map(([label, value], index) => (
        <div
          key={label}
          className={`px-5 py-4 ${
            index !== metrics.length - 1
              ? "border-b border-white/10 sm:border-b-0 sm:border-r"
              : ""
          }`}
        >
          <div className="text-[8px] uppercase tracking-[0.18em] text-white/25">
            {label}
          </div>

          <div
            className={`mt-1 font-mono text-lg ${
              label === "Failures" && value !== "0"
                ? "text-[#d7a84a]"
                : "text-[#e8e3da]"
            }`}
          >
            {value}
          </div>
        </div>
      ))}
    </section>
  );
}
