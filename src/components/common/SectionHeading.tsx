import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.06em] sm:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
