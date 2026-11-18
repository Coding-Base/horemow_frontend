import type { ReactNode } from "react";

export default function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand-blue">
      {children}
    </p>
  );
}
