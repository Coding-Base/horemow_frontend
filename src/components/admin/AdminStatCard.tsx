import type { LucideIcon } from "lucide-react";

export default function AdminStatCard({
  label,
  icon: Icon,
}: {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-semibold">{label}</span>
        <Icon size={17} />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-300">—</p>
      <p className="mt-1 text-[10px] text-slate-500">Connect admin API to load</p>
    </article>
  );
}
