import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Sermons", "/sermons"],
  ["Devotional", "/devotional"],
  ["Events", "/events"],
  ["Locations", "/locations"],
  ["Directory", "/directory"],
];
const moreLinks = [
  ["Bookstore", "/bookstore"],
  ["Gallery", "/gallery"],
  ["Blog", "/blog"],
  ["Broadcasts", "/broadcasts"],
  ["Contact", "/contact"],
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLocation = useLocation();

  useEffect(() => setMenuOpen(false), [currentLocation.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50" data-testid="public-header">
        <header className="relative border-b border-black/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-[70px] w-[min(1200px,calc(100%-2.25rem))] items-center justify-between gap-5">
            <Logo />
            <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
              {links.map(([label, path]) => (
                <NavLink
                  className={({ isActive }) =>
                    `py-2 text-xs font-semibold transition hover:text-brand-blue ${
                      isActive ? "text-brand-blue" : "text-slate-700"
                    }`
                  }
                  end={path === "/"}
                  key={path}
                  to={path}
                >
                  {label}
                </NavLink>
              ))}
              <div className="relative">
                <button
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1 py-2 text-xs font-semibold text-slate-700 hover:text-brand-blue"
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  More <ChevronDown size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full grid w-48 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                    {moreLinks.map(([label, path]) => (
                      <Link
                        className="rounded px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-brand-blue"
                        key={path}
                        onClick={() => setMenuOpen(false)}
                        to={path}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                aria-label="Browse sermons"
                className="grid size-10 place-items-center rounded-full border border-slate-200 hover:text-brand-blue"
                to="/sermons"
              >
                <Search size={18} />
              </Link>
              <Link
                className="hidden min-h-10 items-center gap-2 rounded bg-brand-blue px-4 text-xs font-bold text-white hover:bg-[#123b70] sm:inline-flex"
                to="/give"
              >
                Give <ArrowUpRight size={15} />
              </Link>
              <button
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="grid size-10 place-items-center rounded-full border border-slate-200 lg:hidden"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="grid border-t border-slate-100 bg-white px-5 pb-4 lg:hidden"
            >
              {[...links, ...moreLinks, ["Give", "/give"]].map(([label, path]) => (
                <NavLink
                  className={({ isActive }) =>
                    `flex min-h-12 items-center justify-between border-b border-slate-100 text-sm font-semibold ${
                      isActive ? "text-brand-blue" : "text-slate-700"
                    }`
                  }
                  end={path === "/"}
                  key={path}
                  onClick={() => setMenuOpen(false)}
                  to={path}
                >
                  {label} <ArrowUpRight size={15} />
                </NavLink>
              ))}
            </nav>
          )}
        </header>
      </div>
      <div aria-hidden="true" className="h-[70px]" />
    </>
  );
}
