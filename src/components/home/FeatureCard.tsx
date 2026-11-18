import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  to: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "beige" | "dark";
  action: string;
};

const tones = {
  blue: "bg-[#e5ebf0] text-[#152a3a]",
  beige: "bg-[#eae2d4] text-[#2a281f]",
  dark: "bg-[#142a40] text-white",
};

export default function FeatureCard({
  to,
  index,
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
  action,
}: Props) {
  return (
    <Link
      className={`group flex min-h-[285px] flex-col items-start rounded-2xl p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl ${tones[tone]}`}
      style={{
        transformStyle: "preserve-3d",
      }}
      to={to}
    >
      <span className="grid size-12 place-items-center rounded-xl border border-current/20 bg-white/40 text-brand-blue shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Icon aria-hidden="true" size={22} />
      </span>
      <span className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {index} / {eyebrow}
      </span>
      <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight">{title}</h3>
      <p className="mt-2 max-w-xs text-xs leading-6 opacity-85 sm:text-[13px]">{description}</p>
      <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-brand-blue group-hover:underline">
        {action} <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={16} />
      </span>
    </Link>
  );
}
