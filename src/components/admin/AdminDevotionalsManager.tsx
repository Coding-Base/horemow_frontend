import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getDevotionalsContent,
  saveDevotionalsContent,
  useDevotionalsContent,
  type DevotionalEntry,
} from "../../lib/contentStore";
import { useDebounce } from "../../lib/useDebounce";

const ITEMS_PER_PAGE = 5;

export default function AdminDevotionalsManager() {
  const devotionals = useDevotionalsContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Pagination
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevotionalId, setEditingDevotionalId] = useState<string | null>(null);

  // Form Fields
  const [dateKey, setDateKey] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Pastor Paul Rika");
  const [scriptureRef, setScriptureRef] = useState("Hebrews 12:14");
  const [scriptureVerse, setScriptureVerse] = useState("Follow peace with all men, and holiness, without which no man shall see the Lord.");
  const [reflection, setReflection] = useState("");
  const [prayer, setPrayer] = useState("");
  const [actionPoint, setActionPoint] = useState("");

  const filteredDevotionals = useMemo(() => {
    return devotionals.filter((d) => {
      const q = debouncedSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.scriptureReference.toLowerCase().includes(q) ||
        d.scriptureVerse.toLowerCase().includes(q) ||
        d.reflection.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.dateKey.toLowerCase().includes(q)
      );
    });
  }, [devotionals, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredDevotionals.length / ITEMS_PER_PAGE));
  const paginatedDevotionals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDevotionals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDevotionals, currentPage]);

  const openCreateModal = () => {
    setEditingDevotionalId(null);
    setDateKey(new Date().toISOString().split("T")[0]);
    setTitle("");
    setAuthor("Pastor Paul Rika");
    setScriptureRef("Hebrews 12:14");
    setScriptureVerse("Follow peace with all men, and holiness, without which no man shall see the Lord.");
    setReflection("");
    setPrayer("Lord, guide my thoughts and actions today. Keep my heart pure and undefiled in all my ways.");
    setActionPoint("Meditate on this scripture and guard your mouth and actions throughout the day.");
    setIsModalOpen(true);
  };

  const openEditModal = (d: DevotionalEntry) => {
    setEditingDevotionalId(d.id);
    setDateKey(d.dateKey);
    setTitle(d.title);
    setAuthor(d.author);
    setScriptureRef(d.scriptureReference);
    setScriptureVerse(d.scriptureVerse);
    setReflection(d.reflection);
    setPrayer(d.prayer);
    setActionPoint(d.actionPoint || "");
    setIsModalOpen(true);
  };

  const handleSaveDevotional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reflection.trim()) {
      setStatus({ type: "error", text: "Please provide a devotional title and reflection text." });
      return;
    }

    const currentAll = getDevotionalsContent();

    if (editingDevotionalId) {
      const updated = currentAll.map((d) => {
        if (d.id === editingDevotionalId) {
          return {
            ...d,
            dateKey: dateKey.trim(),
            title: title.trim(),
            author: author.trim(),
            scriptureReference: scriptureRef.trim(),
            scriptureVerse: scriptureVerse.trim(),
            reflection: reflection.trim(),
            prayer: prayer.trim(),
            actionPoint: actionPoint.trim(),
          };
        }
        return d;
      });
      saveDevotionalsContent(updated);
      setStatus({ type: "success", text: `Devotional "${title}" updated successfully.` });
    } else {
      const newEntry: DevotionalEntry = {
        id: `dev-${Date.now()}`,
        dateKey: dateKey.trim(),
        title: title.trim(),
        author: author.trim(),
        scriptureReference: scriptureRef.trim(),
        scriptureVerse: scriptureVerse.trim(),
        reflection: reflection.trim(),
        prayer: prayer.trim() || "Lord, sanctify my soul in truth.",
        actionPoint: actionPoint.trim(),
      };
      saveDevotionalsContent([newEntry, ...currentAll]);
      setStatus({ type: "success", text: `Daily devotional "${title}" published.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, devTitle: string) => {
    if (window.confirm(`Are you sure you want to delete devotional "${devTitle}"?`)) {
      const updated = getDevotionalsContent().filter((d) => d.id !== id);
      saveDevotionalsContent(updated);
      setStatus({ type: "success", text: "Devotional removed." });
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

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <BookOpen size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Daily Devotionals Manager</h2>
            <p className="text-xs text-slate-500">
              Publish and schedule daily spiritual reflections, memory verses, prayers, and faith actions.
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
          Write Daily Devotional
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <TextField
          fullWidth
          InputProps={{
            startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
          }}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search devotionals by title, scripture reference, or reflection text..."
          size="small"
          value={searchInput}
        />
      </div>

      {/* Devotionals Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Devotionals Archive ({filteredDevotionals.length} entries)</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedDevotionals.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No devotionals matched</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or create a new entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedDevotionals.map((d) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={d.id}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                      {d.dateKey === "today" ? "Today's Message" : d.dateKey}
                    </span>
                    <span className="text-xs font-bold text-brand-green">{d.scriptureReference}</span>
                    <span className="text-xs text-slate-400">· by {d.author}</span>
                  </div>

                  <h4 className="font-bold text-ink text-sm sm:text-base">{d.title}</h4>

                  <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border-l-2 border-brand-blue">
                    "{d.scriptureVerse}"
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2">{d.reflection}</p>

                  {d.actionPoint && (
                    <div className="text-[11px] font-semibold text-brand-blue flex items-center gap-1 pt-1">
                      <Sparkles size={12} /> Action: {d.actionPoint}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(d)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(d.id, d.title)}
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

      {/* DEVOTIONAL EDITOR MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingDevotionalId ? "Edit Daily Devotional" : "Write Daily Devotional"}
        </DialogTitle>
        <form onSubmit={handleSaveDevotional}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Devotional Title *"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Walking in Undefiled Truth"
                required
                size="small"
                value={title}
              />
              <TextField
                fullWidth
                helperText="YYYY-MM-DD or 'today'"
                label="Date Key *"
                onChange={(e) => setDateKey(e.target.value)}
                required
                size="small"
                value={dateKey}
              />
              <TextField
                fullWidth
                label="Author *"
                onChange={(e) => setAuthor(e.target.value)}
                required
                size="small"
                value={author}
              />
              <TextField
                fullWidth
                helperText="e.g. Hebrews 12:14 or Psalm 119:105"
                label="Scripture Reference *"
                onChange={(e) => setScriptureRef(e.target.value)}
                required
                size="small"
                value={scriptureRef}
              />
            </div>

            <TextField
              fullWidth
              helperText="The exact biblical verse quotation for today's meditation"
              label="Scripture Verse Quote *"
              multiline
              onChange={(e) => setScriptureVerse(e.target.value)}
              required
              rows={2}
              size="small"
              value={scriptureVerse}
            />

            <TextField
              fullWidth
              label="Reflection / Exhortation Message *"
              multiline
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write the spiritual teaching, breakdown of the verse, and practical counsel..."
              required
              rows={6}
              size="small"
              value={reflection}
            />

            <TextField
              fullWidth
              label="Daily Prayer Point"
              multiline
              onChange={(e) => setPrayer(e.target.value)}
              placeholder="Lord, grant me grace to walk in holiness and keep my conscience undefiled..."
              rows={2}
              size="small"
              value={prayer}
            />

            <TextField
              fullWidth
              helperText="Practical instruction for the day (e.g. Restitution, forgiving an offender, sharing a tract)"
              label="Action Point / Thought for the Day"
              onChange={(e) => setActionPoint(e.target.value)}
              placeholder="e.g. Make amends where necessary and maintain holy peace with all men."
              size="small"
              value={actionPoint}
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
              {editingDevotionalId ? "Save Devotional Changes" : "Publish Devotional"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
