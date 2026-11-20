import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar as CalendarIcon,
  CalendarDays,
  Share2,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import PageIntro from "../components/common/PageIntro";
import { shareDevotional } from "../lib/share";
import { fetchTodayDevotional, fetchDevotional, fetchCalendar, type DevotionalEntry, type CalendarEntry } from "../lib/devotionalApi";
import DevotionalCardPreview, { DEVOTIONAL_TEMPLATES } from "../components/admin/DevotionalCardPreview";

export default function DevotionalPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [devotional, setDevotional] = useState<DevotionalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [userTemplateOverride, setUserTemplateOverride] = useState<string | null>(null);

  // Calendar Dialog state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(() => new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState<number>(() => new Date().getMonth());
  const [monthEntries, setMonthEntries] = useState<CalendarEntry[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const selectedDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const todayStr = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const isToday = selectedDateStr === todayStr;

  const dateLabel = selectedDate.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load Devotional for Selected Date (Today first on page load)
  const loadDevotionalForDate = useCallback(async (dateStr: string, isCurrentDay: boolean) => {
    setLoading(true);
    setShareMessage("");

    try {
      if (isCurrentDay) {
        const todayData = await fetchTodayDevotional();
        if (todayData) {
          setDevotional(todayData);
          setLoading(false);
          return;
        }
      }

      const specificData = await fetchDevotional(dateStr);
      setDevotional(specificData);
    } catch (err) {
      console.error("Error loading devotional:", err);
      setDevotional(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevotionalForDate(selectedDateStr, isToday);
  }, [selectedDateStr, isToday, loadDevotionalForDate]);

  // Navigate Previous / Next Day
  const moveDay = (offset: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const jumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Load calendar indicators for month in dialog
  const loadMonthData = useCallback(async (year: number, month: number) => {
    setLoadingMonth(true);
    try {
      const entries = await fetchCalendar(year, month + 1);
      setMonthEntries(entries);
    } catch (err) {
      console.error(err);
      setMonthEntries([]);
    } finally {
      setLoadingMonth(false);
    }
  }, []);

  const openCalendarDialog = () => {
    setPickerYear(selectedDate.getFullYear());
    setPickerMonth(selectedDate.getMonth());
    loadMonthData(selectedDate.getFullYear(), selectedDate.getMonth());
    setIsCalendarOpen(true);
  };

  const handleMonthChange = (offset: number) => {
    let nextMonth = pickerMonth + offset;
    let nextYear = pickerYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setPickerMonth(nextMonth);
    setPickerYear(nextYear);
    loadMonthData(nextYear, nextMonth);
  };

  const handleYearSelect = (year: number) => {
    setPickerYear(year);
    loadMonthData(year, pickerMonth);
  };

  const handleSelectDayFromCalendar = (dayNumber: number) => {
    const newDate = new Date(pickerYear, pickerMonth, dayNumber);
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  };

  const handleShare = async () => {
    if (!devotional) return;
    try {
      await shareDevotional(
        window.location.href,
        `${devotional.title} - HOREMOW Daily Devotional (${devotional.date})`
      );
      setShareMessage("Share opened.");
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Calendar days grid computation for dialog
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();

    const days: Array<{
      dayNum: number;
      dateKey: string;
      hasDevotional: boolean;
      status?: string;
    }> = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: 0, dateKey: "", hasDevotional: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${pickerYear}-${String(pickerMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const found = monthEntries.find((e) => e.date === dateKey);
      days.push({
        dayNum: d,
        dateKey,
        hasDevotional: Boolean(found),
        status: found?.status,
      });
    }

    return days;
  }, [pickerYear, pickerMonth, monthEntries]);

  // Year options list from 2024 to 2030
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <>
      <PageIntro
        compact
        description="Daily scripture meditation, spiritual exhortation and prayer to anchor your life in holiness."
        eyebrow="Daily Holiness Walk"
        title="Daily Devotional."
      />

      <section className="min-h-[70vh] bg-gradient-to-b from-white to-slate-50 py-8">
        <div className="mx-auto w-[min(1060px,calc(100%-2.25rem))] space-y-6">

          {/* ======================================================== */}
          {/* PROMINENT NAVIGATION & DATE CONTROLS BAR */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Previous Day Button */}
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition shadow-sm active:scale-95"
                onClick={() => moveDay(-1)}
                type="button"
              >
                <ArrowLeft size={16} />
                <span>Previous Day</span>
              </button>

              {/* Center Date Display + Quick Date Pickers */}
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-ink">
                    <CalendarDays className="text-brand-blue" size={18} />
                    {dateLabel}
                  </span>

                  {isToday ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      TODAY
                    </span>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 rounded-full bg-brand-blue px-3 py-0.5 text-[11px] font-bold text-white hover:bg-[#143A6D] transition shadow-sm"
                      onClick={jumpToToday}
                      type="button"
                    >
                      <RotateCcw size={11} /> Back to Today
                    </button>
                  )}
                </div>

                {/* Direct Jump to Any Year / Calendar Button */}
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blue/30 bg-soft-blue px-3 py-1 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition shadow-sm"
                    onClick={openCalendarDialog}
                    type="button"
                  >
                    <CalendarIcon size={14} /> Open Calendar / Jump to Any Year
                  </button>

                  {/* Native Date Picker Shortcut */}
                  <input
                    aria-label="Jump to specific date"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer hover:border-slate-300"
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(new Date(e.target.value + "T00:00:00"));
                      }
                    }}
                    type="date"
                    value={selectedDateStr}
                  />
                </div>
              </div>

              {/* Next Day Button */}
              <button
                className="inline-flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition shadow-sm active:scale-95"
                onClick={() => moveDay(1)}
                type="button"
              >
                <span>Next Day</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Reading Atmosphere Themes & Social Sharing Bar */}
          {devotional && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Sparkles className="text-amber-500" size={15} />
                <span className="font-semibold">Reading Atmosphere:</span>
                <div className="flex items-center gap-1.5">
                  {Object.values(DEVOTIONAL_TEMPLATES).map((tpl) => (
                    <button
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        (userTemplateOverride || devotional.card_template || "classic") === tpl.id
                          ? "bg-brand-blue text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      key={tpl.id}
                      onClick={() => setUserTemplateOverride(tpl.id)}
                      type="button"
                    >
                      {tpl.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-blue shadow-sm hover:bg-slate-50 transition"
                onClick={handleShare}
                type="button"
              >
                {copied ? <Check className="text-emerald-600" size={14} /> : <Share2 size={14} />}
                <span>{copied ? "Link Copied!" : "Share Devotional"}</span>
              </button>
            </div>
          )}

          {/* Main Devotional Card Rendering */}
          {loading ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <CircularProgress size={36} sx={{ color: "#1A4B8C" }} />
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Fetching spiritual meditation for {dateLabel}...
              </p>
            </div>
          ) : devotional ? (
            <div>
              <DevotionalCardPreview
                devotional={devotional}
                selectedTemplate={userTemplateOverride || devotional.card_template || "classic"}
              />
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BookOpen className="text-slate-300" size={54} />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  No Devotional Scheduled for {dateLabel}
                </h3>
                <p className="max-w-md text-xs text-slate-500 leading-relaxed">
                  Daily devotionals are published every morning according to the church calendar.
                  Use the navigation buttons or calendar jump to select another day.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  className="rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white hover:bg-[#143A6D] transition shadow-sm"
                  onClick={jumpToToday}
                  type="button"
                >
                  Return to Today's Devotional
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  onClick={openCalendarDialog}
                  type="button"
                >
                  Browse Calendar
                </button>
              </div>
            </div>
          )}

          {shareMessage && (
            <p className="text-center text-xs font-bold text-brand-blue" role="status">
              {shareMessage}
            </p>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE CALENDAR JUMP DIALOG */}
      {/* ======================================================== */}
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsCalendarOpen(false)}
        open={isCalendarOpen}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid #f1f5f9" }}>
          Browse Devotionals by Calendar & Year
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <div className="space-y-4">
            {/* Year & Month Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* Year Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Year:</span>
                <select
                  aria-label="Select year"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-ink cursor-pointer focus:border-brand-blue"
                  onChange={(e) => handleYearSelect(Number(e.target.value))}
                  value={pickerYear}
                >
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Stepper */}
              <div className="flex items-center gap-2">
                <button
                  className="size-8 grid place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleMonthChange(-1)}
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-28 text-center text-xs font-bold text-ink">
                  {new Date(pickerYear, pickerMonth, 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
                </span>
                <button
                  className="size-8 grid place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleMonthChange(1)}
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            {loadingMonth ? (
              <div className="p-12 text-center">
                <CircularProgress size={28} sx={{ color: "#1A4B8C" }} />
                <p className="mt-2 text-xs text-slate-500">Loading month schedule...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <div className="py-1 text-[11px] font-bold text-slate-400" key={dayName}>
                    {dayName}
                  </div>
                ))}

                {calendarDays.map((cd, idx) => {
                  if (cd.dayNum === 0) {
                    return <div className="h-10" key={`empty-${idx}`} />;
                  }

                  const isSelected = cd.dateKey === selectedDateStr;
                  const isCurrentDay = cd.dateKey === todayStr;

                  return (
                    <button
                      className={`h-10 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center relative ${
                        isSelected
                          ? "bg-brand-blue text-white shadow-md ring-2 ring-brand-blue/30"
                          : isCurrentDay
                          ? "bg-soft-blue text-brand-blue border border-brand-blue/40"
                          : cd.hasDevotional
                          ? "bg-slate-50 text-slate-800 hover:bg-slate-100"
                          : "text-slate-400 hover:bg-slate-50"
                      }`}
                      key={cd.dateKey}
                      onClick={() => handleSelectDayFromCalendar(cd.dayNum)}
                      type="button"
                    >
                      <span>{cd.dayNum}</span>
                      {cd.hasDevotional && !isSelected && (
                        <span
                          className={`size-1.5 rounded-full mt-0.5 ${
                            cd.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Published devotional
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500" /> Scheduled (Draft)
              </span>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsCalendarOpen(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
