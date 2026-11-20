import React from "react";
import { BookOpen, Calendar, Heart, Music, Sparkles, BookMarked, Quote } from "lucide-react";
import type { DevotionalEntry } from "../../lib/devotionalApi";

export interface CardStyleConfig {
  id: string;
  name: string;
  description: string;
  containerClass: string;
  headerClass: string;
  dateBadgeClass: string;
  titleClass: string;
  scriptureBoxClass: string;
  quoteClass: string;
  bodyClass: string;
  prayerBoxClass: string;
  accentBarClass: string;
  footerClass: string;
}

export const DEVOTIONAL_TEMPLATES: Record<string, CardStyleConfig> = {
  classic: {
    id: "classic",
    name: "Classic HOREMOW",
    description: "Deep Navy & Gold Sacred Theme",
    containerClass: "bg-white border-slate-200 text-slate-800 shadow-xl",
    headerClass: "bg-gradient-to-r from-[#183d5f] to-[#102438] text-white",
    dateBadgeClass: "bg-white/15 text-[#e5be64] border border-white/20",
    titleClass: "font-serif text-ink",
    scriptureBoxClass: "bg-slate-50 border-brand-blue/30 text-slate-700",
    quoteClass: "bg-[#f4f6f1] border-brand-green text-slate-800",
    bodyClass: "text-slate-700 leading-relaxed font-sans",
    prayerBoxClass: "bg-soft-blue border-brand-blue/20 text-brand-blue",
    accentBarClass: "bg-brand-blue",
    footerClass: "bg-slate-50 border-slate-100 text-slate-500",
  },
  parchment: {
    id: "parchment",
    name: "Sacred Parchment",
    description: "Warm Cream, Sepia & Sacred Script",
    containerClass: "bg-[#faf6ee] border-[#e2d5bd] text-[#3c2f1f] shadow-lg",
    headerClass: "bg-gradient-to-r from-[#4a3520] to-[#2c1d10] text-[#f7eedc]",
    dateBadgeClass: "bg-[#6d5132]/60 text-[#e9c68a] border border-[#e9c68a]/30",
    titleClass: "font-serif text-[#2a1e12]",
    scriptureBoxClass: "bg-[#f1e9d7] border-[#cbb998] text-[#423422]",
    quoteClass: "bg-[#ede2cb] border-[#8b6534] text-[#2c1d10] font-serif italic",
    bodyClass: "text-[#3f3120] leading-relaxed font-serif",
    prayerBoxClass: "bg-[#ebdcc0] border-[#bda67f] text-[#463116]",
    accentBarClass: "bg-[#8b6534]",
    footerClass: "bg-[#f3ead8] border-[#e2d5bd] text-[#6d5a42]",
  },
  modern: {
    id: "modern",
    name: "Clean Modern",
    description: "Minimalist White with Emerald Accent",
    containerClass: "bg-white border-slate-200 text-slate-900 shadow-md",
    headerClass: "bg-gradient-to-r from-slate-900 to-slate-800 text-white",
    dateBadgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    titleClass: "font-sans font-extrabold text-slate-900 tracking-tight",
    scriptureBoxClass: "bg-slate-50 border-slate-200 text-slate-700",
    quoteClass: "bg-emerald-50/70 border-emerald-600 text-slate-900",
    bodyClass: "text-slate-600 leading-relaxed font-sans",
    prayerBoxClass: "bg-slate-100 border-slate-200 text-slate-800",
    accentBarClass: "bg-emerald-600",
    footerClass: "bg-white border-slate-100 text-slate-400",
  },
  royal: {
    id: "royal",
    name: "Royal Purple & Gold",
    description: "Regal Majesty and Purity",
    containerClass: "bg-white border-purple-200 text-slate-900 shadow-xl",
    headerClass: "bg-gradient-to-r from-[#2c1145] to-[#170626] text-white",
    dateBadgeClass: "bg-amber-400/20 text-amber-300 border border-amber-400/40",
    titleClass: "font-serif text-[#2c1145]",
    scriptureBoxClass: "bg-purple-50/50 border-purple-200 text-purple-950",
    quoteClass: "bg-[#f9f3ff] border-[#8b35c7] text-[#2c1145]",
    bodyClass: "text-slate-700 leading-relaxed font-serif",
    prayerBoxClass: "bg-amber-50 border-amber-200 text-amber-900",
    accentBarClass: "bg-[#8b35c7]",
    footerClass: "bg-purple-50/30 border-purple-100 text-purple-800",
  },
  sunrise: {
    id: "sunrise",
    name: "Dawn of Truth",
    description: "Uplifting Morning Amber Gradient",
    containerClass: "bg-white border-amber-200 text-slate-800 shadow-xl",
    headerClass: "bg-gradient-to-r from-[#b3411b] via-[#cf6721] to-[#dd8c2a] text-white",
    dateBadgeClass: "bg-white/20 text-white border border-white/30",
    titleClass: "font-serif text-slate-900",
    scriptureBoxClass: "bg-orange-50/60 border-orange-200 text-slate-800",
    quoteClass: "bg-[#fff8f0] border-[#cf6721] text-slate-900",
    bodyClass: "text-slate-700 leading-relaxed font-sans",
    prayerBoxClass: "bg-amber-50 border-amber-200 text-amber-900",
    accentBarClass: "bg-[#cf6721]",
    footerClass: "bg-orange-50/30 border-orange-100 text-orange-950",
  },
};

interface DevotionalCardPreviewProps {
  devotional: Partial<DevotionalEntry>;
  selectedTemplate?: string;
  customBgColor?: string;
  customAccentColor?: string;
  compact?: boolean;
}

export default function DevotionalCardPreview({
  devotional,
  selectedTemplate = "classic",
  customBgColor,
  customAccentColor,
  compact = false,
}: DevotionalCardPreviewProps) {
  const templateKey = (devotional.card_template || selectedTemplate || "classic").toLowerCase();
  const theme = DEVOTIONAL_TEMPLATES[templateKey] || DEVOTIONAL_TEMPLATES.classic;

  const displayDate = devotional.date ? new Date(devotional.date + "T00:00:00") : new Date();
  const dateFormatted = displayDate.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const customStyle: React.CSSProperties = {};
  if (customBgColor || devotional.card_bg_color) {
    customStyle.backgroundColor = customBgColor || devotional.card_bg_color;
  }
  if (devotional.card_bg_image) {
    customStyle.backgroundImage = `url(${devotional.card_bg_image})`;
    customStyle.backgroundSize = "cover";
    customStyle.backgroundPosition = "center";
  }

  const customAccentStyle: React.CSSProperties = {};
  if (customAccentColor || devotional.card_accent_color) {
    customAccentStyle.borderColor = customAccentColor || devotional.card_accent_color;
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${theme.containerClass}`}
      style={customStyle}
    >
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 ${theme.headerClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.dateBadgeClass}`}>
            <Calendar size={13} /> {dateFormatted}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
            HOREMOW DAILY DEVOTIONAL
          </span>
        </div>

        <h3 className={`mt-3 text-xl sm:text-2xl font-bold leading-snug tracking-tight text-white`}>
          {devotional.title || "Unto Holiness of Life"}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-xs opacity-90">
          <span>By {devotional.author_attribution || "Pastor Paul Rika"}</span>
          <span>·</span>
          <span>International Director</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-5 sm:p-7 space-y-5 ${compact ? "text-xs" : "text-sm"}`}>
        {/* Scripture Reading & Verses */}
        {(devotional.text_reference || devotional.scripture_reading) && (
          <div className={`rounded-xl border p-4 ${theme.scriptureBoxClass}`} style={customAccentStyle}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <BookOpen size={15} /> Scripture Reading: {devotional.text_reference || devotional.scripture_reading}
              </span>
            </div>
            {devotional.text_body && !compact && (
              <div className="mt-2 text-xs leading-relaxed opacity-90 max-h-48 overflow-y-auto whitespace-pre-line pr-2 border-t border-black/5 pt-2">
                {devotional.text_body}
              </div>
            )}
          </div>
        )}

        {/* Key Verse Quote */}
        {(devotional.key_verse_text || devotional.memory_verse_text) && (
          <div
            className={`rounded-r-xl border-l-4 p-4 ${theme.quoteClass}`}
            style={customAccentStyle}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider opacity-85 mb-1.5">
              <Quote size={13} /> Key Verse · {devotional.key_verse_reference || devotional.memory_verse_reference || "Scripture"}
            </div>
            <p className="font-serif italic text-sm sm:text-base leading-relaxed">
              "{devotional.key_verse_text || devotional.memory_verse_text}"
            </p>
          </div>
        )}

        {/* Reflection Message */}
        {devotional.reflection_body && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookMarked size={14} /> Message & Reflection
            </h4>
            <div className={`whitespace-pre-line ${theme.bodyClass} ${compact ? "line-clamp-4" : ""}`}>
              {devotional.reflection_body}
            </div>
          </div>
        )}

        {/* Action Point / Thought for the Day */}
        {(devotional.thought_for_day || devotional.action_point) && (
          <div className="rounded-xl bg-amber-50/80 border border-amber-200/70 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="shrink-0 text-amber-600 mt-0.5" size={16} />
            <div>
              <strong className="block font-bold">Thought for the day:</strong>
              <p className="mt-0.5">{devotional.thought_for_day || devotional.action_point}</p>
            </div>
          </div>
        )}

        {/* Prayer Box */}
        {devotional.prayer_points && devotional.prayer_points.length > 0 && (
          <div className={`rounded-xl border p-4 ${theme.prayerBoxClass}`}>
            <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider mb-2">
              <Heart size={14} /> Daily Prayer & Consecration
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {devotional.prayer_points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Song and Bible Reading Footer Strip */}
        {(devotional.song_for_day || devotional.bible_reading_for_day) && (
          <div className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${theme.footerClass}`}>
            {devotional.song_for_day && (
              <span className="flex items-center gap-1.5 truncate">
                <Music className="shrink-0" size={14} />
                <strong>Song:</strong> {devotional.song_for_day}
              </span>
            )}
            {devotional.bible_reading_for_day && (
              <span className="flex items-center gap-1.5 shrink-0">
                <BookOpen className="shrink-0" size={14} />
                <strong>Bible in 1 Year:</strong> {devotional.bible_reading_for_day}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
