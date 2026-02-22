"use client";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, accent = "var(--accent-gold)", icon }: Props) {
  return (
    <div
      className="card-shine rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Glow dot */}
      <div
        className="absolute top-4 right-4 w-2 h-2 rounded-full"
        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
      />

      {icon && (
        <div
          className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
      )}

      <div
        className="font-display mb-1 stat-animate"
        style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: 700, lineHeight: 1 }}
      >
        {value}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>{label}</div>
      {sub && (
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
