import { AudioLines, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactContent } from "../../lib/contentStore";
import Logo from "./Logo";

export default function SiteFooter() {
  const location = useContactContent();

  return (
    <footer className="bg-[#10283e] pt-14 text-white">
      <div className="mx-auto grid w-[min(1200px,calc(100%-2.25rem))] gap-9 pb-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.7fr_1.2fr]">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-xs text-xs leading-6 text-slate-300">
            Promoting truth, holiness and righteousness in churches and nations
            around the world.
          </p>
          <p className="mt-5 font-serif text-sm leading-6">
            “Without holiness no man shall see the Lord.”
            <span className="mt-2 block font-sans text-[9px] uppercase tracking-widest text-slate-400">
              Hebrews 12:14
            </span>
          </p>
        </div>
        <FooterLinks
          title="Explore"
          items={[
            ["About HOREMOW", "/about"],
            ["Sermons", "/sermons"],
            ["Daily devotional", "/devotional"],
            ["Events & Conferences", "/events"],
            ["Conference Gallery", "/gallery"],
          ]}
        />
        <FooterLinks
          title="Connect"
          items={[
            ["Overseers Directory", "/directory"],
            ["Find a fellowship", "/locations"],
            ["Holiness Bookstore", "/bookstore"],
            ["Broadcasts & Media", "/broadcasts"],
            ["Contact Headquarters", "/contact"],
          ]}
        />
        <div className="flex flex-col items-start gap-3">
          <h2 className="mb-1 text-xs font-bold">International Headquarters</h2>
          <p className="flex gap-2 text-[11px] leading-5 text-slate-300">
            <MapPin className="mt-0.5 shrink-0" size={15} /> {location.address}
          </p>
          <a className="flex gap-2 text-[11px] text-slate-300 hover:text-white" href={`mailto:${location.email}`}>
            <Mail size={15} /> {location.email}
          </a>
          <a className="flex gap-2 text-[11px] text-slate-300 hover:text-white" href={`tel:${location.phone.replaceAll(" ", "")}`}>
            <AudioLines size={15} /> {location.phone}
          </a>
        </div>
      </div>
      <div className="mx-auto flex min-h-14 w-[min(1200px,calc(100%-2.25rem))] flex-col justify-center gap-1 border-t border-white/15 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} HOREMOW. All rights reserved.</span>
        <span>Preparing the Bride in truth and holiness</span>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="mb-1 text-xs font-bold">{title}</h2>
      {items.map(([label, path]) => (
        <Link className="text-[11px] text-slate-300 hover:text-white" key={path} to={path}>
          {label}
        </Link>
      ))}
    </div>
  );
}
