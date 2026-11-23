import { useState } from "react";
import { ArrowUpRight, Megaphone, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdsContent } from "../../lib/contentStore";

export default function TopAdBanner() {
  const ads = useAdsContent();
  const [dismissedAds, setDismissedAds] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem("horemow_dismissed_ads");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const activeBannerAd = ads.find(
    (ad) =>
      ad.isActive &&
      (ad.placement === "top_banner" || ad.placement === "both") &&
      !dismissedAds.includes(ad.id)
  );

  const handleDismiss = (id: string) => {
    const updated = [...dismissedAds, id];
    setDismissedAds(updated);
    try {
      sessionStorage.setItem("horemow_dismissed_ads", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  if (!activeBannerAd) return null;

  const isExternal = activeBannerAd.targetUrl.startsWith("http");

  return (
    <aside
      aria-label="Promotional Announcement"
      className="relative z-40 border-b border-[#e5be64]/30 bg-[#0e2238] px-4 py-2.5 text-white shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#d9ba70]/20 text-[#d9ba70]">
            <Megaphone size={14} />
          </span>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
            {activeBannerAd.badge && (
              <span className="rounded bg-[#d9ba70]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d9ba70]">
                {activeBannerAd.badge}
              </span>
            )}
            <strong className="truncate font-semibold text-white">
              {activeBannerAd.title}
            </strong>
            <span className="hidden text-slate-300 md:inline">
              — {activeBannerAd.description}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isExternal ? (
            <a
              className="inline-flex items-center gap-1 rounded bg-[#d9ba70] px-3 py-1 text-xs font-bold text-[#0e2238] transition hover:bg-[#e8cca2]"
              href={activeBannerAd.targetUrl}
              rel="noreferrer"
              target="_blank"
            >
              {activeBannerAd.ctaText} <ArrowUpRight size={13} />
            </a>
          ) : (
            <Link
              className="inline-flex items-center gap-1 rounded bg-[#d9ba70] px-3 py-1 text-xs font-bold text-[#0e2238] transition hover:bg-[#e8cca2]"
              to={activeBannerAd.targetUrl}
            >
              {activeBannerAd.ctaText} <ArrowUpRight size={13} />
            </Link>
          )}

          <button
            aria-label="Dismiss banner"
            className="rounded p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            onClick={() => handleDismiss(activeBannerAd.id)}
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
