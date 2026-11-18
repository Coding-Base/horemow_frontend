import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  children: ReactNode;
  to: string;
  light?: boolean;
};

export default function ArrowLink({ children, to, light = false }: Props) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded px-5 text-[13px] font-bold transition hover:-translate-y-0.5 ${
        light
          ? "bg-white text-[#173b63] hover:bg-slate-100"
          : "bg-brand-blue text-white hover:bg-[#123b70]"
      }`}
      to={to}
    >
      {children} <ArrowRight aria-hidden="true" size={17} />
    </Link>
  );
}
