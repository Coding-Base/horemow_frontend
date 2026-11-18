import { Search } from "lucide-react";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchField({ label, placeholder, value, onChange }: Props) {
  return (
    <label className="flex min-h-12 w-full items-center gap-3 border border-slate-300 bg-white px-3 text-slate-500 focus-within:border-brand-blue">
      <Search aria-hidden="true" size={18} />
      <input
        aria-label={label}
        className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
