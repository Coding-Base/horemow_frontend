import React, { useState, useMemo, useRef } from "react";
import {
  Mic2,
  Video,
  Plus,
  Trash2,
  Edit3,
  Search,
  Upload,
  Send,
  Play,
  Volume2,
  User,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import {
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
import { showToast } from "../../lib/soundToast";

const ITEMS_PER_PAGE = 5;

function formatSecondsToDuration(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);
  if (hours > 0) {
    return `${hours} hr ${minutes.toString().padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return `${minutes} min${seconds > 0 ? ` ${seconds} sec` : ""}`;
  }
  return `${seconds} sec`;
}

function detectMediaDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const isVideo = file.type.startsWith("video/");
    const element = document.createElement(isVideo ? "video" : "audio");
    const objectUrl = URL.createObjectURL(file);
    element.src = objectUrl;
    element.preload = "metadata";

    element.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      if (Number.isFinite(element.duration) && element.duration > 0) {
        resolve(formatSecondsToDuration(element.duration));
      } else {
        resolve("1 hr 30 min");
      }
    };

    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("1 hr 30 min");
    };
  });
}

function detectUrlDuration(url: string): Promise<string> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = "metadata";

    const timeout = setTimeout(() => {
      resolve("1 hr 30 min");
    }, 4000);

    audio.onloadedmetadata = () => {
      clearTimeout(timeout);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(formatSecondsToDuration(audio.duration));
      } else {
        resolve("1 hr 30 min");
      }
    };

    audio.onerror = () => {
      clearTimeout(timeout);
      resolve("1 hr 30 min");
    };
  });
}

export default function AdminSermonsManager() {
  const sermonsList = useSermonsContent();

  // Search & Filters
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermonId, setEditingSermonId] = useState<string | null>(null);

  // Direct In-Admin Media Preview State
  const [previewMedia, setPreviewMedia] = useState<{
    type: "audio" | "video";
    title: string;
    speaker: string;
    url: string;
    thumbnailUrl?: string;
  } | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("Pastor Paul Rika");
  const [category, setCategory] = useState<SermonCategory>("Holiness");
  const [duration, setDuration] = useState("1 hr 30 min");
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [datePreached, setDatePreached] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
        setIsUploadingThumb(true);
        const dataUrl = await fileToDataUrl(file, "horemow_sermons");
        setThumbnailUrl(dataUrl);
        showToast("Thumbnail photo uploaded successfully!", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        showToast(msg, "error");
      } finally {
        setIsUploadingThumb(false);
      }
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingAudio(true);
        setIsDetectingDuration(true);

        // Auto-detect duration from audio file metadata
        const detected = await detectMediaDuration(file);
        setDuration(detected);

        // Upload audio file
        const dataUrl = await fileToDataUrl(file, "horemow_audio");
        setAudioUrl(dataUrl);
        showToast(`Audio uploaded & duration auto-detected: ${detected}`, "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Audio upload failed";
        showToast(msg, "error");
      } finally {
        setIsUploadingAudio(false);
        setIsDetectingDuration(false);
      }
    }
  };

  const handleDetectDurationFromUrl = async () => {
    if (!audioUrl.trim()) {
      showToast("Please enter an Audio MP3 URL first to detect its duration.", "error");
      return;
    }
    try {
      setIsDetectingDuration(true);
      const detected = await detectUrlDuration(audioUrl.trim());
      setDuration(detected);
      showToast(`Duration auto-detected: ${detected}`, "success");
    } catch {
      showToast("Could not auto-detect duration from audio URL. Please enter manually.", "error");
    } finally {
      setIsDetectingDuration(false);
    }
  };

  const handleSaveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please provide a sermon message title.", "error");
      return;
    }

    const currentAll = getSermonsContent();
    const defaultCover = "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg";
    const resolvedThumb = thumbnailUrl.trim() || defaultCover;

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
            thumbnailUrl: resolvedThumb,
            audioUrl: audioUrl.trim() || null,
            telegramUrl: telegramUrl.trim() || null,
            videoUrl: videoUrl.trim() || null,
          };
        }
        return s;
      });
      saveSermonsContent(updated);
      showToast(`Sermon "${title}" updated successfully!`, "success");
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
        thumbnailUrl: resolvedThumb,
        audioUrl: audioUrl.trim() || null,
        telegramUrl: telegramUrl.trim() || null,
        videoUrl: videoUrl.trim() || null,
      };
      saveSermonsContent([newSermon, ...currentAll]);
      showToast(`Sermon "${title}" published to catalog!`, "success");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, sermonTitle: string) => {
    if (window.confirm(`Are you sure you want to delete sermon "${sermonTitle}"?`)) {
      const updated = getSermonsContent().filter((s) => s.id !== id);
      saveSermonsContent(updated);
      showToast("Sermon removed from archive.", "success");
    }
  };

  // Helper to format YouTube embed URL
  const getEmbedUrl = (rawUrl?: string | null): string => {
    if (!rawUrl) return "";
    if (rawUrl.includes("youtube.com/embed/")) return rawUrl;
    if (rawUrl.includes("youtube.com/watch?v=")) {
      const videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (rawUrl.includes("youtu.be/")) {
      const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return rawUrl;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <Mic2 size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Audio & Video Sermons Manager</h2>
            <p className="text-xs text-slate-500">
              Manage sermon recordings, listen to audio, preview video streams, and publish worldwide.
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
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={s.id}
              >
                <div className="flex items-start gap-4">
                  <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-900 shadow-sm">
                    <img
                      alt={s.title}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg";
                      }}
                      src={
                        s.thumbnailUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg"
                      }
                    />
                    {s.videoUrl && (
                      <span className="absolute bottom-1 right-1 grid size-6 place-items-center rounded-full bg-red-600 text-white shadow">
                        <Play size={11} fill="currentColor" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                        {s.category}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Clock size={12} /> {s.duration}
                      </span>
                      {s.datePreached && (
                        <span className="text-xs text-slate-400">· {s.datePreached}</span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base font-serif">{s.title}</h4>
                    <p className="text-xs text-brand-green font-semibold flex items-center gap-1">
                      <User size={12} /> {s.speaker}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{s.summary}</p>

                    {/* Media Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      {s.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                          <Video size={11} /> Video Available
                        </span>
                      )}
                      {s.audioUrl && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue border border-blue-200">
                          <Volume2 size={11} /> Audio Available
                        </span>
                      )}
                      {s.telegramUrl && (
                        <a
                          className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 hover:underline"
                          href={s.telegramUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Send size={11} /> Telegram Download <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct In-Admin Media Preview & Management Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                  {s.audioUrl && (
                    <Button
                      onClick={() =>
                        setPreviewMedia({
                          type: "audio",
                          title: s.title,
                          speaker: s.speaker,
                          url: s.audioUrl!,
                          thumbnailUrl: s.thumbnailUrl || undefined,
                        })
                      }
                      size="small"
                      startIcon={<Volume2 size={14} />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#1A4B8C",
                        color: "#1A4B8C",
                        borderRadius: "8px",
                      }}
                      variant="outlined"
                    >
                      Listen Audio
                    </Button>
                  )}

                  {s.videoUrl && (
                    <Button
                      onClick={() =>
                        setPreviewMedia({
                          type: "video",
                          title: s.title,
                          speaker: s.speaker,
                          url: s.videoUrl!,
                          thumbnailUrl: s.thumbnailUrl || undefined,
                        })
                      }
                      size="small"
                      startIcon={<Play size={14} fill="currentColor" />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        backgroundColor: "#c53030",
                        color: "#ffffff",
                        borderRadius: "8px",
                        "&:hover": { backgroundColor: "#9b2c2c" },
                      }}
                      variant="contained"
                    >
                      Watch Video
                    </Button>
                  )}

                  <Button
                    onClick={() => openEditModal(s)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="text"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(s.id, s.title)}
                    size="small"
                    startIcon={<Trash2 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    variant="text"
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

      {/* DIRECT IN-ADMIN MEDIA PLAYER PREVIEW MODAL */}
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setPreviewMedia(null)}
        open={Boolean(previewMedia)}
      >
        {previewMedia && (
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  {previewMedia.type === "video" ? <Video size={13} /> : <Volume2 size={13} />}
                  Direct Admin {previewMedia.type === "video" ? "Video Playback" : "Audio Playback"}
                </span>
                <h3 className="text-base font-bold text-white mt-1 font-serif">
                  {previewMedia.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium">{previewMedia.speaker}</p>
              </div>
              <button
                aria-label="Close player"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                onClick={() => setPreviewMedia(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              {previewMedia.type === "video" ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full border-0"
                    src={getEmbedUrl(previewMedia.url)}
                    title={previewMedia.title}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {previewMedia.thumbnailUrl && (
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-800 shadow">
                      <img
                        alt={previewMedia.title}
                        className="size-full object-cover"
                        src={previewMedia.thumbnailUrl}
                      />
                    </div>
                  )}
                  <audio
                    autoPlay
                    className="w-full"
                    controls
                    src={previewMedia.url}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setPreviewMedia(null)}
                sx={{ color: "#ffffff", textTransform: "none", fontWeight: 600 }}
              >
                Close Player
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* SERMON CREATE / EDIT MODAL */}
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
              <div className="grid grid-cols-2 gap-2 items-center">
                <TextField
                  fullWidth
                  helperText={isDetectingDuration ? "Auto-detecting from media..." : "Auto-detected on audio/video select"}
                  label="Duration (Auto-detected)"
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

            {/* Dedicated File Select & Upload for Sermon Thumbnail */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-bold text-ink mb-1 block">
                Sermon Cover / Thumbnail Image (File Select & Upload)
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Select an image file from your device. It will immediately show across the public website and sermon cards.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative size-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden grid place-items-center shadow-inner">
                  {thumbnailUrl ? (
                    <img
                      alt="Thumbnail preview"
                      className="size-full object-cover"
                      src={thumbnailUrl}
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 text-center px-1">
                      No Thumbnail
                    </span>
                  )}
                  {isUploadingThumb && (
                    <div className="absolute inset-0 bg-black/50 grid place-items-center text-white">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingThumb}
                    onChange={handleThumbnailUpload}
                    ref={thumbInputRef}
                    type="file"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      disabled={isUploadingThumb}
                      onClick={() => thumbInputRef.current?.click()}
                      size="small"
                      startIcon={<Upload size={14} />}
                      variant="outlined"
                    >
                      {isUploadingThumb
                        ? "Uploading Thumbnail..."
                        : thumbnailUrl
                        ? "Select Different Image"
                        : "Select Thumbnail File"}
                    </Button>
                    {thumbnailUrl && (
                      <Button
                        color="error"
                        disabled={isUploadingThumb}
                        onClick={() => setThumbnailUrl("")}
                        size="small"
                        variant="text"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <TextField
                    fullWidth
                    label="Or paste Image URL directly"
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={thumbnailUrl}
                  />
                </div>
              </div>
            </div>

            {/* Audio & Telegram Section with File Upload & Duration Auto-detection */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
              <div className="text-xs font-bold text-brand-blue flex items-center justify-between">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Volume2 size={15} /> Audio Configuration & Auto-Duration
                </span>
                {audioUrl && (
                  <button
                    className="text-[11px] font-bold text-brand-blue hover:underline flex items-center gap-1"
                    onClick={handleDetectDurationFromUrl}
                    type="button"
                  >
                    <Sparkles size={12} /> Auto-detect length from URL
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 items-start">
                <div className="space-y-2">
                  <TextField
                    fullWidth
                    helperText="Direct MP3 URL or select an audio file below"
                    label="Audio Stream / MP3 URL"
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://.../sermon.mp3"
                    size="small"
                    value={audioUrl}
                  />
                  <div>
                    <input
                      accept="audio/*"
                      className="hidden"
                      disabled={isUploadingAudio}
                      onChange={handleAudioUpload}
                      ref={audioInputRef}
                      type="file"
                    />
                    <Button
                      disabled={isUploadingAudio}
                      onClick={() => audioInputRef.current?.click()}
                      size="small"
                      startIcon={<Upload size={14} />}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                      variant="outlined"
                    >
                      {isUploadingAudio ? "Uploading Audio & Detecting Length..." : "Upload Audio File (Auto-detects Duration)"}
                    </Button>
                  </div>
                </div>

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
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 space-y-3">
              <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Video size={15} /> Video Embed Configuration
              </div>
              <TextField
                fullWidth
                helperText="YouTube URL (watch or embed link) or direct video stream for the public sermon page"
                label="Embeddable Video URL"
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
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
