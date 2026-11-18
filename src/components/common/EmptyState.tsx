import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="grid min-h-60 justify-items-center content-center border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
      <Icon aria-hidden="true" size={26} />
      <h2 className="mt-4 text-xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-6">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
