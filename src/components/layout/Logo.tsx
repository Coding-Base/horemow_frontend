import { Link } from "react-router-dom";
import horemowLogo from "../../assets/horemowlogo.jfif";

export default function Logo({
  inverse = false,
  size = "md",
}: {
  inverse?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  }[size];

  return (
    <Link aria-label="HOREMOW home" className="inline-flex min-w-max items-center gap-2.5 group" to="/">
      <img
        alt="HOREMOW Official Logo"
        className={`${sizeClasses} rounded-full object-cover shadow-sm ring-2 ${
          inverse ? "ring-white/25" : "ring-brand-blue/15"
        } transition-transform duration-200 group-hover:scale-105`}
        src={horemowLogo}
      />
      <span className="flex flex-col gap-0.5">
        <strong className={`text-sm tracking-[0.08em] font-bold ${inverse ? "text-white" : "text-ink"}`}>
          HOREMOW
        </strong>
        <span className={`text-[9px] font-medium leading-none ${inverse ? "text-slate-300" : "text-slate-500"}`}>
          Holiness Revival Movement Worldwide
        </span>
      </span>
    </Link>
  );
}
