import { useEffect, useState } from "react";
import { ArrowUpRight, Newspaper, X } from "lucide-react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import {
  getHomepageAnnouncement,
  type HomepageAnnouncement,
  useHomepageAnnouncement,
  useAdsContent,
} from "../../lib/contentStore";
import {
  fetchHomepageAnnouncement,
  isHomepageAnnouncementApiConfigured,
} from "../../lib/homepageAnnouncementApi";

const DISMISSED_ANNOUNCEMENT_KEY = "horemow_dismissed_homepage_announcement";

function getActionUrl(value: string): string | null {
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export default function HomepageAnnouncementModal() {
  const localAnnouncement = useHomepageAnnouncement();
  const ads = useAdsContent();
  const [announcement, setAnnouncement] = useState<HomepageAnnouncement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check if an active ad exists for modal placement
  const activeAd = ads.find(
    (a) => a.isActive && (a.placement === "modal" || a.placement === "both")
  );

  const activeAnnouncement: HomepageAnnouncement | null = activeAd
    ? {
        enabled: true,
        title: activeAd.title,
        message: activeAd.description,
        eyebrow: activeAd.badge || "Ministry Announcement",
        imageUrl: activeAd.imageUrl || "",
        actionLabel: activeAd.ctaText || "Learn More",
        actionUrl: activeAd.targetUrl,
        updatedAt: activeAd.createdAt || activeAd.id,
      }
    : isHomepageAnnouncementApiConfigured
    ? announcement
    : localAnnouncement;

  useEffect(() => {
    if (!isHomepageAnnouncementApiConfigured) {
      setAnnouncement(getHomepageAnnouncement());
      return;
    }

    const controller = new AbortController();
    void fetchHomepageAnnouncement(controller.signal)
      .then((value) => {
        if (value && value.enabled && value.title.trim() && value.message.trim()) {
          setAnnouncement(value);
        } else {
          setAnnouncement(null);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Could not load the homepage announcement.", error);
        setAnnouncement(null);
      });
    return () => controller.abort();
  }, []);

  const version = activeAnnouncement?.updatedAt
    || `${activeAnnouncement?.title ?? ""}\u0000${activeAnnouncement?.message ?? ""}`;

  useEffect(() => {
    if (
      !activeAnnouncement ||
      !activeAnnouncement.enabled ||
      !activeAnnouncement.title.trim() ||
      !activeAnnouncement.message.trim()
    ) {
      setIsOpen(false);
      return;
    }

    try {
      setIsOpen(sessionStorage.getItem(DISMISSED_ANNOUNCEMENT_KEY) !== version);
    } catch (error) {
      console.error("Could not check the dismissed homepage announcement.", error);
      setIsOpen(true);
    }
  }, [activeAnnouncement, version]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_ANNOUNCEMENT_KEY, version);
    } catch (error) {
      console.error("Could not save the dismissed homepage announcement.", error);
    }
    setIsOpen(false);
  };

  if (!activeAnnouncement) return null;

  const actionUrl = getActionUrl(activeAnnouncement.actionUrl);
  const isInternalLink = actionUrl?.startsWith("/") ?? false;

  return (
    <Dialog
      aria-describedby="homepage-announcement-message"
      aria-labelledby="homepage-announcement-title"
      fullWidth
      maxWidth="sm"
      onClose={dismiss}
      open={isOpen}
      PaperProps={{
        sx: {
          overflow: "hidden",
          borderRadius: { xs: "18px", sm: "24px" },
          boxShadow: "0 28px 90px rgba(2, 12, 27, .38)",
        },
      }}
    >
      <div className="relative min-h-36 overflow-hidden bg-[#0b2037] sm:min-h-48">
        {activeAnnouncement.imageUrl ? (
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            src={activeAnnouncement.imageUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(229,190,100,.42),transparent_38%),linear-gradient(125deg,#0b2037,#174b79)]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#071523]/90 via-[#071523]/15 to-[#071523]/20"
        />
        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/25 bg-[#071523]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white backdrop-blur sm:bottom-6 sm:left-7">
          <Newspaper aria-hidden="true" size={14} />
          {activeAnnouncement.eyebrow || "Latest update"}
        </div>
        <IconButton
          aria-label="Close announcement"
          onClick={dismiss}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "white",
            backgroundColor: "rgba(7, 21, 35, .58)",
            "&:hover": { backgroundColor: "rgba(7, 21, 35, .82)" },
          }}
        >
          <X size={19} />
        </IconButton>
      </div>

      <DialogTitle
        component="h2"
        id="homepage-announcement-title"
        sx={{
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 2.5, sm: 3.5 },
          pb: 1,
          color: "#111820",
          fontSize: { xs: "1.5rem", sm: "2rem" },
          fontWeight: 800,
          letterSpacing: "-.045em",
          lineHeight: 1.15,
        }}
      >
        {activeAnnouncement.title}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pb: 1 }}>
        <p
          className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base"
          id="homepage-announcement-message"
        >
          {activeAnnouncement.message}
        </p>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 2.5, sm: 4 },
          pt: 2,
          pb: { xs: 2.5, sm: 4 },
        }}
      >
        <button
          className="min-h-11 rounded-lg px-2 text-sm font-semibold text-slate-500 transition hover:text-ink"
          onClick={dismiss}
          type="button"
        >
          Close
        </button>
        {actionUrl && activeAnnouncement.actionLabel.trim() && (
          <Button
            component={isInternalLink ? Link : "a"}
            href={isInternalLink ? undefined : actionUrl}
            rel={isInternalLink ? undefined : "noopener noreferrer"}
            target={isInternalLink ? undefined : "_blank"}
            to={isInternalLink ? actionUrl : undefined}
            onClick={dismiss}
            endIcon={<ArrowUpRight size={16} />}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: "9px",
              backgroundColor: "#1a4b8c",
              color: "white",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { backgroundColor: "#143a6d" },
            }}
            variant="contained"
          >
            {activeAnnouncement.actionLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
