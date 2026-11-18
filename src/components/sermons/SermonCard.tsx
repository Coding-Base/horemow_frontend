import { useState } from "react";
import { Clock3, Headphones, Play, Send, User, ChevronUp, ExternalLink, X } from "lucide-react";
import { Button } from "@mui/material";
import type { Sermon } from "../../data/content";

export default function SermonCard({
  sermon,
  index,
}: {
  sermon: Sermon;
  index: number;
}) {
  const [activeMedia, setActiveMedia] = useState<"none" | "audio" | "video">("none");

  // Helper to get embeddable iframe URL if YouTube
  const getEmbedUrl = (rawUrl?: string | null): string => {
    if (!rawUrl) return "";
    if (rawUrl.includes("youtube.com/embed/")) return rawUrl;
    if (rawUrl.includes("youtube.com/watch?v=")) {
      const videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (rawUrl.includes("youtu.be/")) {
      const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(sermon.videoUrl);

  return (
    <article className="border-b border-slate-200 py-6 transition hover:bg-slate-50/50">
      <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center">
        {/* Sermon Thumbnail / Cover */}
        <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-[140px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-sm">
          <img
            alt={sermon.title}
            className="size-full object-cover"
            src={
              sermon.thumbnailUrl ||
              "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg"
            }
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
            0{index + 1}
          </span>
          {sermon.videoUrl && (
            <button
              aria-label="Play video"
              className="absolute inset-0 grid place-items-center bg-black/30 hover:bg-black/50 transition text-white"
              onClick={() => setActiveMedia(activeMedia === "video" ? "none" : "video")}
              type="button"
            >
              <span className="grid size-9 place-items-center rounded-full bg-brand-blue text-white shadow-md">
                <Play size={14} fill="currentColor" />
              </span>
            </button>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="rounded-full bg-soft-blue px-2.5 py-0.5 font-bold text-brand-blue">
              {sermon.category}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <User size={12} className="text-slate-400" /> {sermon.speaker}
            </span>
            {sermon.datePreached && (
              <>
                <span>·</span>
                <span>{sermon.datePreached}</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg font-bold leading-snug text-ink">
            {sermon.title}
          </h3>

          <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 max-w-2xl">
            {sermon.summary}
          </p>

          <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} /> {sermon.duration}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:justify-center">
          <div className="flex items-center gap-2">
            {sermon.audioUrl && (
              <Button
                onClick={() => setActiveMedia(activeMedia === "audio" ? "none" : "audio")}
                size="small"
                startIcon={<Headphones size={14} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "11px",
                  borderRadius: "6px",
                  borderColor: "#1A4B8C",
                  color: "#1A4B8C",
                }}
                variant={activeMedia === "audio" ? "contained" : "outlined"}
              >
                {activeMedia === "audio" ? "Close Audio" : "Listen"}
              </Button>
            )}

            {sermon.videoUrl && (
              <Button
                onClick={() => setActiveMedia(activeMedia === "video" ? "none" : "video")}
                size="small"
                startIcon={<Play size={13} fill="currentColor" />}
                sx={{
                  backgroundColor: activeMedia === "video" ? "#143A6D" : "#1A4B8C",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "11px",
                  borderRadius: "6px",
                  "&:hover": { backgroundColor: "#143A6D" },
                }}
                variant="contained"
              >
                {activeMedia === "video" ? "Hide Video" : "Watch Video"}
              </Button>
            )}
          </div>

          {sermon.telegramUrl && (
            <a
              className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 transition border border-sky-200 shadow-xs"
              href={sermon.telegramUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Send size={12} />
              <span>Telegram Audio</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* EMBEDDED MEDIA PLAYERS (WHEN EXPANDED) */}
      {activeMedia === "video" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-black p-2 sm:p-4 shadow-inner">
          <div className="flex items-center justify-between pb-2 px-2 text-white text-xs font-semibold">
            <span>Video Stream · {sermon.title}</span>
            <button
              className="flex items-center gap-1 text-slate-300 hover:text-white"
              onClick={() => setActiveMedia("none")}
              type="button"
            >
              <X size={15} /> Close
            </button>
          </div>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
            {embedUrl.includes("youtube") || embedUrl.includes("vimeo") ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
                src={embedUrl}
                title={sermon.title}
              />
            ) : (
              <video
                className="size-full object-contain"
                controls
                poster={sermon.thumbnailUrl || undefined}
                src={sermon.videoUrl || undefined}
              >
                Your browser does not support HTML5 video streaming.
              </video>
            )}
          </div>
        </div>
      )}

      {activeMedia === "audio" && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-soft-blue/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand-blue">
            <span className="flex items-center gap-1.5">
              <Headphones size={14} /> Playing Sermon Audio · {sermon.title}
            </span>
            <button
              className="text-slate-500 hover:text-brand-blue"
              onClick={() => setActiveMedia("none")}
              type="button"
            >
              <ChevronUp size={15} />
            </button>
          </div>
          <audio
            autoPlay
            className="w-full mt-2"
            controls
            src={sermon.audioUrl || undefined}
          >
            Your browser does not support HTML5 audio playback.
          </audio>
          {sermon.telegramUrl && (
            <div className="text-[11px] text-slate-600 pt-1">
              Want offline listening?{" "}
              <a
                className="font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                href={sermon.telegramUrl}
                rel="noreferrer"
                target="_blank"
              >
                Download directly from the Telegram Audio Directory <Send size={10} />
              </a>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
