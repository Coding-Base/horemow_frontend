import React, { useState, useMemo } from "react";
import {
  Mic2,
  Video,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  Send,
  Play,
  Volume2,
  User,
  ChevronLeft,
  ChevronRight,
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
  getSermonsContent,
  saveSermonsContent,
  useSermonsContent,
} from "../../lib/contentStore";
import { sermonCategories, type Sermon, type SermonCategory } from "../../data/content";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const ITEMS_PER_PAGE = 5;

export default function AdminSermonsManager() {
  const sermonsList = useSermonsContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filters
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermonId, setEditingSermonId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("Pastor Paul Rika");
  const [category, setCategory] = useState<SermonCategory>("Holiness");
  const [duration, setDuration] = useState("1 hr 30 min");
  const [datePreached, setDatePreached] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const filteredSermons = useMemo(() => {
    return sermonsList.filter((s) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q));

      const matchesCat = categoryFilter === "ALL" || s.category === categoryFilter;

      let matchesMedia = true;
      if (mediaTypeFilter === "VIDEO") matchesMedia = Boolean(s.videoUrl);
      if (mediaTypeFilter === "AUDIO") matchesMedia = Boolean(s.audioUrl || s.telegramUrl);

      return matchesSearch && matchesCat && matchesMedia;
    });
  }, [sermonsList, debouncedSearch, categoryFilter, mediaTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSermons.length / ITEMS_PER_PAGE));
  const paginatedSermons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSermons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSermons, currentPage]);

  const openCreateModal = () => {
    setEditingSermonId(null);
    setTitle("");
    setSpeaker("Pastor Paul Rika");
    setCategory("Holiness");
    setDuration("1 hr 30 min");
    setDatePreached(new Date().toISOString().split("T")[0]);
    setSummary("");
    setDescription("");
    setThumbnailUrl("");
    setAudioUrl("");
    setTelegramUrl("");
    setVideoUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (s: Sermon) => {
    setEditingSermonId(s.id);
    setTitle(s.title);
    setSpeaker(s.speaker);
    setCategory(s.category);
    setDuration(s.duration);
    setDatePreached(s.datePreached || new Date().toISOString().split("T")[0]);
    setSummary(s.summary);
    setDescription(s.description || s.summary);
    setThumbnailUrl(s.thumbnailUrl || "");
    setAudioUrl(s.audioUrl || "");
    setTelegramUrl(s.telegramUrl || "");
    setVideoUrl(s.videoUrl || "");
    setIsModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setThumbnailUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleSaveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatus({ type: "error", text: "Please provide a sermon message title." });
      return;
    }

    const currentAll = getSermonsContent();

    if (editingSermonId) {
      const updated = currentAll.map((s) => {
        if (s.id === editingSermonId) {
          return {
            ...s,
            title: title.trim(),
            speaker: speaker.trim(),
            category,
            duration: duration.trim() || "1 hr 30 min",
            datePreached: datePreached.trim(),
            summary: summary.trim() || `${title} taught by ${speaker}.`,
            description: description.trim() || summary.trim(),
            thumbnailUrl: thumbnailUrl.trim() || s.thumbnailUrl,
            audioUrl: audioUrl.trim() || null,
            telegramUrl: telegramUrl.trim() || null,
            videoUrl: videoUrl.trim() || null,
          };
        }
        return s;
      });
      saveSermonsContent(updated);
      setStatus({ type: "success", text: `Sermon "${title}" updated successfully.` });
    } else {
      const newSermon: Sermon = {
        id: `sermon-${Date.now()}`,
        title: title.trim(),
        speaker: speaker.trim(),
        category,
        duration: duration.trim() || "1 hr 30 min",
        datePreached: datePreached.trim(),
        summary: summary.trim() || `${title} taught by ${speaker}.`,
        description: description.trim() || summary.trim(),
        thumbnailUrl:
          thumbnailUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg",
        audioUrl: audioUrl.trim() || null,
        telegramUrl: telegramUrl.trim() || null,
        videoUrl: videoUrl.trim() || null,
      };
      saveSermonsContent([newSermon, ...currentAll]);
      setStatus({ type: "success", text: `Sermon "${title}" published to catalog.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, sermonTitle: string) => {
    if (window.confirm(`Are you sure you want to delete sermon "${sermonTitle}"?`)) {
      const updated = getSermonsContent().filter((s) => s.id !== id);
      saveSermonsContent(updated);
      setStatus({ type: "success", text: "Sermon removed." });
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
            <Mic2 size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Audio & Video Sermons Manager</h2>
            <p className="text-xs text-slate-500">
              Manage sermon recordings, Telegram audio directories, and YouTube/video streaming embeds.
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
          Publish New Sermon
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="grid gap-3 sm:grid-cols-12 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="sm:col-span-6">
          <TextField
            fullWidth
            InputProps={{
              startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
            }}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search sermons by title, preacher, summary or theme..."
            size="small"
            value={searchInput}
          />
        </div>

        <div className="sm:col-span-3">
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={categoryFilter}
            >
              <MenuItem value="ALL">All Topics</MenuItem>
              {sermonCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="sm:col-span-3">
          <FormControl fullWidth size="small">
            <InputLabel>Media Format</InputLabel>
            <Select
              label="Media Format"
              onChange={(e) => {
                setMediaTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={mediaTypeFilter}
            >
              <MenuItem value="ALL">All Media</MenuItem>
              <MenuItem value="VIDEO">Video Embeds</MenuItem>
              <MenuItem value="AUDIO">Audio & Telegram</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Sermons Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Sermons Catalog ({filteredSermons.length} messages)</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedSermons.length === 0 ? (
          <div className="p-12 text-center">
            <Mic2 className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No sermons found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or upload a new sermon.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedSermons.map((s) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={s.id}
              >
                <div className="flex items-start gap-4">
                  <div className="relative size-16 sm:size-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      alt={s.title}
                      className="size-full object-cover"
                      src={
                        s.thumbnailUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg"
                      }
                    />
                    {s.videoUrl && (
                      <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-red-600 text-white">
                        <Play size={10} fill="currentColor" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                        {s.category}
                      </span>
                      <span className="text-xs text-slate-400">· {s.duration}</span>
                      {s.datePreached && (
                        <span className="text-xs text-slate-400">· {s.datePreached}</span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{s.title}</h4>
                    <p className="text-xs text-brand-green font-semibold flex items-center gap-1">
                      <User size={12} /> {s.speaker}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{s.summary}</p>

                    {/* Media Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {s.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                          <Video size={11} /> Video Embed
                        </span>
                      )}
                      {s.audioUrl && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue border border-blue-200">
                          <Volume2 size={11} /> Audio Stream
                        </span>
                      )}
                      {s.telegramUrl && (
                        <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                          <Send size={11} /> Telegram Directory
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(s)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(s.id, s.title)}
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

      {/* SERMON EDITOR MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingSermonId ? "Edit Sermon / Message" : "Publish New Sermon / Message"}
        </DialogTitle>
        <form onSubmit={handleSaveSermon}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Sermon Title *"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The State of Christian Leaders"
                required
                size="small"
                value={title}
              />
              <TextField
                fullWidth
                label="Preacher / Speaker *"
                onChange={(e) => setSpeaker(e.target.value)}
                required
                size="small"
                value={speaker}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Category / Topic</InputLabel>
                <Select
                  label="Category / Topic"
                  onChange={(e) => setCategory(e.target.value as SermonCategory)}
                  value={category}
                >
                  {sermonCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  fullWidth
                  label="Duration"
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="1 hr 30 min"
                  size="small"
                  value={duration}
                />
                <TextField
                  fullWidth
                  helperText="Date Preached"
                  label="Date"
                  onChange={(e) => setDatePreached(e.target.value)}
                  size="small"
                  type="date"
                  value={datePreached}
                />
              </div>
            </div>

            {/* Thumbnail Image Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-2 block">
                Sermon Cover / Thumbnail Image (for Audio & Video preview)
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Image URL or Cloudinary Link"
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={thumbnailUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    <Upload size={14} /> Upload Thumbnail
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      type="file"
                    />
                  </label>
                  {thumbnailUrl && (
                    <img
                      alt="Thumbnail"
                      className="size-10 rounded object-cover border border-slate-200"
                      src={thumbnailUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Audio & Telegram Section */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-3">
              <div className="text-xs font-bold text-brand-blue flex items-center gap-1.5 uppercase tracking-wider">
                <Volume2 size={15} /> Audio Configuration & Telegram Directory Link
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  helperText="MP3 direct link or cloud audio stream"
                  label="Audio Stream / MP3 URL"
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://.../sermon.mp3"
                  size="small"
                  value={audioUrl}
                />
                <TextField
                  fullWidth
                  helperText="Direct Telegram message or channel download link"
                  label="Telegram Audio Directory Link"
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/horemowchannel/..."
                  size="small"
                  value={telegramUrl}
                />
              </div>
            </div>

            {/* Video Embed Section */}
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 space-y-3">
              <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Video size={15} /> Video Embed Configuration
              </div>
              <TextField
                fullWidth
                helperText="YouTube embed URL (e.g. https://www.youtube.com/embed/...) or video stream URL that will be embedded on the public sermon page"
                label="Embeddable Video URL"
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                size="small"
                value={videoUrl}
              />
            </div>

            <TextField
              fullWidth
              label="Short Message Summary / Scripture Reference"
              multiline
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Clearing our past through honest confession and restitution..."
              rows={2}
              size="small"
              value={summary}
            />

            <TextField
              fullWidth
              label="Detailed Message Notes / Main Points"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline sermon points, Bible readings, and practical applications..."
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
              {editingSermonId ? "Save Sermon Changes" : "Publish Message"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
