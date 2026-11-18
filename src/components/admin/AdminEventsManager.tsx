import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  Alert,
  Button,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getEventsContent,
  saveEventsContent,
  useEventsContent,
  type MinistryEvent,
} from "../../lib/contentStore";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const ITEMS_PER_PAGE = 5;

export default function AdminEventsManager() {
  const events = useEventsContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("HOREMOW International Camp Ground, Kuje-Gwagwalada Road, Abuja, Nigeria");
  const [category, setCategory] = useState<MinistryEvent["category"]>("Upcoming");
  const [themeVerse, setThemeVerse] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [description, setDescription] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        (ev.themeVerse && ev.themeVerse.toLowerCase().includes(q));

      const matchesCat = categoryFilter === "ALL" || ev.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [events, debouncedSearch, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle("");
    setDate("");
    setTime("8:00 AM – 8:00 PM WAT Daily");
    setLocation("HOREMOW International Camp Ground, Kuje-Gwagwalada Road, Abuja, Nigeria");
    setCategory("Upcoming");
    setThemeVerse("");
    setRegistrationUrl("");
    setFlyerUrl("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (ev: MinistryEvent) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDate(ev.date);
    setTime(ev.time);
    setLocation(ev.location);
    setCategory(ev.category);
    setThemeVerse(ev.themeVerse || "");
    setRegistrationUrl(ev.registrationUrl || "");
    setFlyerUrl(ev.flyerUrl || "");
    setDescription(ev.description);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setFlyerUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      setStatus({ type: "error", text: "Please provide both an event title and dates." });
      return;
    }

    const currentAll = getEventsContent();

    if (editingEventId) {
      const updated = currentAll.map((ev) => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            title: title.trim(),
            date: date.trim(),
            time: time.trim() || "8:00 AM WAT",
            location: location.trim(),
            category,
            themeVerse: themeVerse.trim(),
            registrationUrl: registrationUrl.trim(),
            flyerUrl: flyerUrl.trim() || ev.flyerUrl,
            description: description.trim() || `${title} gathering.`,
          };
        }
        return ev;
      });
      saveEventsContent(updated);
      setStatus({ type: "success", text: `Event "${title}" updated successfully.` });
    } else {
      const newEvent: MinistryEvent = {
        id: `event-${Date.now()}`,
        title: title.trim(),
        date: date.trim(),
        time: time.trim() || "8:00 AM WAT",
        location: location.trim(),
        category,
        themeVerse: themeVerse.trim(),
        registrationUrl: registrationUrl.trim(),
        flyerUrl:
          flyerUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
        description: description.trim() || `${title} gathering.`,
      };
      saveEventsContent([newEvent, ...currentAll]);
      setStatus({ type: "success", text: `Event "${title}" added to calendar.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to remove event "${eventTitle}"?`)) {
      const updated = getEventsContent().filter((ev) => ev.id !== id);
      saveEventsContent(updated);
      setStatus({ type: "success", text: "Event removed successfully." });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {status && (
        <Alert
          icon={status.type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
          severity={status.type}
        >
          {status.text}
        </Alert>
      )}

      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <CalendarDays size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Conferences & Events Manager</h2>
            <p className="text-xs text-slate-500">
              Manage international camp meetings, national retreats, minister summits, and youth congresses.
            </p>
          </div>
        </div>

        <Button
          onClick={openCreateModal}
          startIcon={<Plus size={16} />}
          sx={{
            backgroundColor: "#1A4B8C",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            py: 1,
            "&:hover": { backgroundColor: "#143A6D" },
          }}
          variant="contained"
        >
          Schedule New Event
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-12 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="sm:col-span-8">
          <TextField
            fullWidth
            InputProps={{
              startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
            }}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search events by title, venue, scripture theme, or details..."
            size="small"
            value={searchInput}
          />
        </div>

        <div className="sm:col-span-4">
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={categoryFilter}
            >
              <MenuItem value="ALL">All Events ({events.length})</MenuItem>
              <MenuItem value="Upcoming">Upcoming Conferences</MenuItem>
              <MenuItem value="Past">Past / Archived Events</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Events List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Events Schedule ({filteredEvents.length} total)</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No events matched</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search query or schedule a new event.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedEvents.map((ev) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={ev.id}
              >
                <div className="flex items-start gap-4">
                  {ev.flyerUrl && (
                    <img
                      alt={ev.title}
                      className="size-16 sm:size-20 rounded-lg object-cover border border-slate-200 shrink-0"
                      src={ev.flyerUrl}
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ev.category === "Upcoming"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ev.category}
                      </span>
                      <span className="text-xs font-bold text-brand-blue">{ev.date}</span>
                      <span className="text-xs text-slate-400">· {ev.time}</span>
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{ev.title}</h4>

                    {ev.themeVerse && (
                      <p className="text-xs italic text-brand-green font-medium flex items-center gap-1">
                        <BookOpen size={12} /> {ev.themeVerse}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" /> {ev.location}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 pt-1">{ev.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(ev)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(ev.id, ev.title)}
                    size="small"
                    startIcon={<Trash2 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              size="small"
              startIcon={<ChevronLeft size={16} />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  className={`size-7 rounded text-xs font-bold transition ${
                    currentPage === idx + 1
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  type="button"
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              size="small"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* EVENT FORM MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingEventId ? "Edit Ministry Conference / Event" : "Schedule New Ministry Conference"}
        </DialogTitle>
        <form onSubmit={handleSaveEvent}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Conference Title *"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. International Holiness & Revival Conference"
                required
                size="small"
                value={title}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Event Status</InputLabel>
                <Select
                  label="Event Status"
                  onChange={(e) => setCategory(e.target.value as MinistryEvent["category"])}
                  value={category}
                >
                  <MenuItem value="Upcoming">Upcoming (Active Registration)</MenuItem>
                  <MenuItem value="Past">Past / Archived</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                helperText="e.g. July 24 – 28, 2026"
                label="Event Date(s) *"
                onChange={(e) => setDate(e.target.value)}
                required
                size="small"
                value={date}
              />
              <TextField
                fullWidth
                helperText="e.g. 8:00 AM – 8:00 PM WAT Daily"
                label="Daily Time / Sessions"
                onChange={(e) => setTime(e.target.value)}
                size="small"
                value={time}
              />
            </div>

            <TextField
              fullWidth
              label="Venue / Location Address *"
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. HOREMOW International Camp Ground, Kuje-Gwagwalada Road, Abuja, Nigeria"
              required
              size="small"
              value={location}
            />

            <TextField
              fullWidth
              helperText="e.g. Hebrews 12:14 - Follow peace with all men, and holiness..."
              label="Conference Theme Scripture Verse"
              onChange={(e) => setThemeVerse(e.target.value)}
              size="small"
              value={themeVerse}
            />

            {/* Flyer Image Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-2 block">Event Banner / Flyer Image</span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Flyer Image URL"
                    onChange={(e) => setFlyerUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={flyerUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    <Upload size={14} /> Upload Flyer
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                      type="file"
                    />
                  </label>
                  {flyerUrl && (
                    <img
                      alt="Flyer Preview"
                      className="size-10 rounded object-cover border border-slate-200"
                      src={flyerUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            <TextField
              fullWidth
              helperText="Optional external registration link for delegates"
              label="Registration URL (Optional)"
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://forms.google.com/... or https://horemow.org/register"
              size="small"
              value={registrationUrl}
            />

            <TextField
              fullWidth
              label="Program Overview & Information"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Information regarding accommodation, feeding, international delegates, and schedule..."
              rows={4}
              size="small"
              value={description}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              sx={{
                backgroundColor: "#1A4B8C",
                color: "#ffffff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": { backgroundColor: "#143A6D" },
              }}
              type="submit"
              variant="contained"
            >
              {editingEventId ? "Save Event Changes" : "Publish Event"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
