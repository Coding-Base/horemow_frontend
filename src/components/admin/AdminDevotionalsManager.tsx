import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Upload,
  Calendar as CalendarIcon,
  Settings,
  Sparkles,
  Eye,
  EyeOff,
  Key,
  Cpu,
  FileText,
  Layers,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  fetchDevotionals,
  fetchCalendar,
  fetchBatches,
  fetchBatchDetail,
  uploadDevotionalPdf,
  confirmBatch,
  deleteBatch,
  createDevotional,
  updateDevotional,
  deleteDevotional,
  fetchAutoPublishSettings,
  updateAutoPublishSettings,
  type DevotionalEntry,
  type DevotionalBatch,
  type CalendarEntry,
  type AutoPublishSettings,
} from "../../lib/devotionalApi";
import { useDebounce } from "../../lib/useDebounce";
import DevotionalCardPreview, { DEVOTIONAL_TEMPLATES } from "./DevotionalCardPreview";

export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  badge: string;
  badgeColor: string;
  description: string;
  keyLabel: string;
  keyPlaceholder: string;
}

export const POPULAR_AI_MODELS: AIModelOption[] = [
  {
    id: "gemini-3.1-flash-lite-preview",
    name: "Google Gemini 3.1 Flash-Lite",
    provider: "Google DeepMind",
    badge: "Recommended Default",
    badgeColor: "bg-blue-100 text-brand-blue border-blue-200",
    description: "Ultra-fast, 99%+ OCR accuracy, highly cost-effective for full books",
    keyLabel: "Google Gemini API Key",
    keyPlaceholder: "AIzaSy...",
  },
  {
    id: "gemini-3-flash-preview",
    name: "Google Gemini 3 Flash",
    provider: "Google DeepMind",
    badge: "Next-Gen Vision",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "Advanced multimodal reasoning for dense scripture layouts",
    keyLabel: "Google Gemini API Key",
    keyPlaceholder: "AIzaSy...",
  },
  {
    id: "gemini-2.5-pro",
    name: "Google Gemini 2.5 Pro",
    provider: "Google DeepMind",
    badge: "Maximum Accuracy",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Flagship intelligence for degraded or curved book scans",
    keyLabel: "Google Gemini API Key",
    keyPlaceholder: "AIzaSy...",
  },
  {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    badge: "Industry Benchmark",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Leading multimodal intelligence for complex document parsing",
    keyLabel: "OpenAI API Key",
    keyPlaceholder: "sk-proj-...",
  },
  {
    id: "gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    provider: "OpenAI",
    badge: "Fast & Lightweight",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    description: "Affordable, high-speed vision OCR with structured JSON output",
    keyLabel: "OpenAI API Key",
    keyPlaceholder: "sk-proj-...",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Anthropic Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "Superior Layout",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Top-tier text recognition, archaic terminology and layout comprehension",
    keyLabel: "Anthropic Claude API Key",
    keyPlaceholder: "sk-ant-...",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Anthropic Claude 3.5 Haiku",
    provider: "Anthropic",
    badge: "Rapid Speed",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Fast and lightweight text OCR from Anthropic",
    keyLabel: "Anthropic Claude API Key",
    keyPlaceholder: "sk-ant-...",
  },
  {
    id: "meta-llama/llama-3.2-90b-vision-instruct",
    name: "Meta Llama 3.2 Vision (90B)",
    provider: "Meta AI / OpenRouter",
    badge: "Open Weights Flagship",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Premier open-weight vision model for hybrid or private deployment",
    keyLabel: "OpenRouter / Groq API Key",
    keyPlaceholder: "sk-or-...",
  },
  {
    id: "mistralai/pixtral-large-2411",
    name: "Mistral Pixtral Large",
    provider: "Mistral AI",
    badge: "Publication Specialist",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
    description: "Trained on complex multilingual book spreads and typography",
    keyLabel: "Mistral / OpenRouter API Key",
    keyPlaceholder: "...",
  },
  {
    id: "qwen/qwen-2.5-vl-72b-instruct",
    name: "Alibaba Qwen 2.5 VL (72B)",
    provider: "Alibaba / OpenRouter",
    badge: "OCR Champion",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Leaderboard topper for fine-print document OCR and verse tables",
    keyLabel: "OpenRouter / Qwen API Key",
    keyPlaceholder: "sk-or-...",
  },
];

export default function AdminDevotionalsManager() {
  const [activeTab, setActiveTab] = useState<"archive" | "upload" | "calendar" | "settings">("archive");
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // -------------------------------------------------------------
  // TAB 1: ARCHIVE STATE
  // -------------------------------------------------------------
  const [devotionals, setDevotionals] = useState<DevotionalEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // -------------------------------------------------------------
  // EDIT / CREATE MODAL STATE
  // -------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevotionalId, setEditingDevotionalId] = useState<string | null>(null);
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);
  const [previewDevotional, setPreviewDevotional] = useState<DevotionalEntry | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<DevotionalEntry>>({
    date: new Date().toISOString().split("T")[0],
    title: "",
    author_attribution: "Pastor Paul Rika",
    text_reference: "REVELATION 17:1-9",
    text_body: "",
    key_verse_reference: "1 JOHN 2:15",
    key_verse_text: "Love not the world, neither the things that in the world. If any man love the world, the love of the Father is not in him.",
    reflection_body: "",
    thought_for_day: "Purge yourself thoroughly to be a vessel unto honour.",
    song_for_day: "Have you being to Jesus for the cleansing power…",
    bible_reading_for_day: "Acts 18-19",
    card_template: "classic",
    card_bg_color: "",
    card_accent_color: "",
    status: "DRAFT",
  });

  // -------------------------------------------------------------
  // TAB 2: BULK UPLOAD STATE
  // -------------------------------------------------------------
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadTargetYear, setUploadTargetYear] = useState<number>(2026);
  const [uploadStartPage, setUploadStartPage] = useState<number>(1);
  const [uploadEndPage, setUploadEndPage] = useState<number>(184);
  const [batches, setBatches] = useState<DevotionalBatch[]>([]);
  const [activeBatch, setActiveBatch] = useState<DevotionalBatch | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [confirmingBatch, setConfirmingBatch] = useState(false);
  const [replaceConflicts, setReplaceConflicts] = useState(true);

  // -------------------------------------------------------------
  // TAB 3: CALENDAR STATE
  // -------------------------------------------------------------
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // -------------------------------------------------------------
  // TAB 4: SETTINGS STATE
  // -------------------------------------------------------------
  const [autoSettings, setAutoSettings] = useState<AutoPublishSettings>({
    publish_time: "05:00:00",
    timezone_name: "Africa/Lagos",
    is_enabled: true,
    default_template: "classic",
    default_author: "Pastor Paul Rika",
    ocr_model: "gemini-3.1-flash-lite-preview",
    ocr_api_key: "",
    gemini_api_key: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Confirmation Modal State (replaces window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void> | void;
    danger?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    onConfirm: () => {},
    danger: true,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const notify = (type: "success" | "error" | "info", text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 5000);
  };

  // -------------------------------------------------------------
  // DATA LOADERS
  // -------------------------------------------------------------
  const loadDevotionals = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetchDevotionals({
        page: currentPage,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setDevotionals(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      notify("error", "Could not connect to backend devotionals API.");
    } finally {
      setLoadingList(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const list = await fetchBatches();
      setBatches(list);
      if (list.length > 0 && !activeBatch) {
        // If the latest batch is in review or parsing, load its details
        const latest = await fetchBatchDetail(list[0].id);
        setActiveBatch(latest);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBatches(false);
    }
  }, [activeBatch]);

  const loadCalendarData = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth() + 1;
      const data = await fetchCalendar(year, month);
      setCalendarEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCalendar(false);
    }
  }, [calendarDate]);

  const loadSettingsData = useCallback(async () => {
    try {
      const data = await fetchAutoPublishSettings();
      setAutoSettings(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "archive") loadDevotionals();
    if (activeTab === "upload") loadBatches();
    if (activeTab === "calendar") loadCalendarData();
    if (activeTab === "settings") loadSettingsData();
  }, [activeTab, loadDevotionals, loadBatches, loadCalendarData, loadSettingsData]);

  // Polling active batch if it is UPLOADING or PARSING
  useEffect(() => {
    if (!activeBatch || (activeBatch.status !== "PARSING" && activeBatch.status !== "UPLOADING")) {
      return;
    }
    const timer = setInterval(async () => {
      try {
        const refreshed = await fetchBatchDetail(activeBatch.id);
        setActiveBatch(refreshed);
        if (refreshed.status === "REVIEW") {
          notify("success", `Batch parsed successfully: ${refreshed.parsed_entries} devotionals extracted.`);
          loadBatches();
        } else if (refreshed.status === "FAILED") {
          notify("error", `Parsing failed: ${refreshed.error_log}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [activeBatch, loadBatches]);

  // -------------------------------------------------------------
  // HANDLERS: CRUD
  // -------------------------------------------------------------
  const handleOpenCreateModal = (presetDate?: string) => {
    setEditingDevotionalId(null);
    setFormData({
      date: presetDate || new Date().toISOString().split("T")[0],
      title: "",
      author_attribution: autoSettings.default_author || "Pastor Paul Rika",
      text_reference: "REVELATION 17:1-9",
      text_body: "",
      key_verse_reference: "1 JOHN 2:15",
      key_verse_text: "Love not the world, neither the things that in the world. If any man love the world, the love of the Father is not in him.",
      reflection_body: "",
      thought_for_day: "Purge yourself thoroughly to be a vessel unto honour.",
      song_for_day: "Have you being to Jesus for the cleansing power…",
      bible_reading_for_day: "Acts 18-19",
      card_template: autoSettings.default_template || "classic",
      card_bg_color: "",
      card_accent_color: "",
      status: "DRAFT",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dev: DevotionalEntry) => {
    setEditingDevotionalId(dev.id);
    setFormData({
      ...dev,
    });
    setIsModalOpen(true);
  };

  const handleSaveDevotional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.reflection_body?.trim()) {
      notify("error", "Please provide at least a title and reflection body.");
      return;
    }

    try {
      if (editingDevotionalId) {
        await updateDevotional(editingDevotionalId, formData);
        notify("success", `Devotional "${formData.title}" updated.`);
      } else {
        await createDevotional(formData);
        notify("success", `Devotional "${formData.title}" created.`);
      }
      setIsModalOpen(false);
      loadDevotionals();
      if (activeTab === "calendar") loadCalendarData();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Save failed.");
    }
  };

  const handleDelete = (dev: DevotionalEntry) => {
    setConfirmDialog({
      open: true,
      title: "Delete Daily Devotional?",
      description: `Are you sure you want to delete the devotional for ${dev.date}: "${dev.title}"? This action cannot be undone.`,
      confirmLabel: "Delete Devotional",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteDevotional(dev.date);
          notify("success", "Devotional deleted successfully.");
          loadDevotionals();
          if (activeTab === "calendar") loadCalendarData();
        } catch (err) {
          notify("error", "Failed to delete devotional.");
        }
      },
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: BULK UPLOAD
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        notify("error", "Please upload a PDF (.pdf) file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      notify("error", "Please choose a PDF file first.");
      return;
    }

    setUploading(true);
    try {
      const batch = await uploadDevotionalPdf(
        selectedFile,
        autoSettings.default_author,
        autoSettings.default_template,
        uploadTargetYear,
        uploadStartPage,
        uploadEndPage
      );
      notify("info", `File "${selectedFile.name}" uploaded. Processing daily entries...`);
      setSelectedFile(null);
      setActiveBatch(batch);
      loadBatches();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmBatch = async (batchId: string) => {
    setConfirmingBatch(true);
    try {
      const res = await confirmBatch(batchId, replaceConflicts);
      notify("success", res.message || "Batch imported into drafts!");
      const refreshed = await fetchBatchDetail(batchId);
      setActiveBatch(refreshed);
      loadBatches();
      loadDevotionals();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setConfirmingBatch(false);
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Devotional Batch?",
      description: "Are you sure you want to delete this batch and all its parsed entries? This action cannot be undone.",
      confirmLabel: "Delete Batch",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteBatch(batchId);
          notify("success", "Batch deleted successfully.");
          if (activeBatch?.id === batchId) setActiveBatch(null);
          loadBatches();
        } catch (err) {
          notify("error", "Failed to delete batch.");
        }
      },
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: SETTINGS
  // -------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await updateAutoPublishSettings(autoSettings);
      setAutoSettings(updated);
      notify("success", "Auto-publish settings saved successfully.");
    } catch (err) {
      notify("error", "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // -------------------------------------------------------------
  // CALENDAR COMPUTATION
  // -------------------------------------------------------------
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateKey: string;
      entry?: CalendarEntry;
    }> = [];

    // Empty lead days
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: 0, dateKey: "" });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const entry = calendarEntries.find((e) => e.date === dateKey);
      days.push({ dayNumber: d, dateKey, entry });
    }

    return days;
  }, [calendarDate, calendarEntries]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="space-y-6">
      {/* Floating Toast Notification */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={4000}
        onClose={() => setStatus(null)}
        open={Boolean(status)}
        sx={{ mt: 7, zIndex: 9999 }}
      >
        {status ? (
          <Alert
            elevation={6}
            icon={status.type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
            onClose={() => setStatus(null)}
            severity={status.type === "info" ? "info" : status.type}
            sx={{
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              fontWeight: 600,
              fontSize: "13px",
              minWidth: "280px",
            }}
            variant="filled"
          >
            {status.text}
          </Alert>
        ) : undefined}
      </Snackbar>

      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold shadow-sm">
            <BookOpen size={22} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-ink">Daily Devotionals Manager</h2>
            <p className="text-xs text-slate-500">
              Bulk document ingestion, multi-template card designer, and automated daily scheduling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenCreateModal()}
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
      </div>

      {/* Tabs Navigation */}
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <Tabs
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "13px" },
            "& .Mui-selected": { color: "#1A4B8C" },
            "& .MuiTabs-indicator": { backgroundColor: "#1A4B8C", height: 3 },
          }}
          value={activeTab}
        >
          <Tab
            icon={<Layers size={16} />}
            iconPosition="start"
            label={`Devotionals Archive (${totalCount})`}
            value="archive"
          />
          <Tab
            icon={<Upload size={16} />}
            iconPosition="start"
            label="Bulk PDF Upload & Ingestion"
            value="upload"
          />
          <Tab
            icon={<CalendarIcon size={16} />}
            iconPosition="start"
            label="Calendar View"
            value="calendar"
          />
          <Tab
            icon={<Settings size={16} />}
            iconPosition="start"
            label="Auto-Publish Settings"
            value="settings"
          />
        </Tabs>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: ARCHIVE LIST */}
      {/* ============================================================= */}
      {activeTab === "archive" && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <TextField
              fullWidth
              InputProps={{
                startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
              }}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search devotionals by title, scripture reference, reflection text..."
              size="small"
              value={searchInput}
            />

            <div className="flex items-center gap-2">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={statusFilter}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="DRAFT">Draft (Scheduled)</MenuItem>
                </Select>
              </FormControl>

              <Button
                onClick={loadDevotionals}
                size="small"
                startIcon={<RefreshCw size={14} />}
                sx={{ textTransform: "none", color: "#1A4B8C" }}
                variant="outlined"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Devotionals Table / List */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
              <span>Devotionals Archive</span>
              <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
            </div>

            {loadingList ? (
              <div className="p-16 text-center">
                <CircularProgress size={32} sx={{ color: "#1A4B8C" }} />
                <p className="mt-2 text-xs text-slate-500">Loading devotionals from database...</p>
              </div>
            ) : devotionals.length === 0 ? (
              <div className="p-16 text-center">
                <BookOpen className="mx-auto text-slate-300" size={44} />
                <h4 className="mt-3 text-base font-bold text-slate-700">No devotionals found</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a PDF in the Bulk Upload tab or click "Write Daily Devotional".
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {devotionals.map((d) => (
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                    key={d.id}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[11px] font-bold text-brand-blue">
                          {d.date}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            d.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {d.status === "PUBLISHED" ? "Published" : "Draft (Scheduled)"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Template: {d.card_template || "classic"}
                        </span>

                        <span className="text-xs font-bold text-brand-green">
                          {d.text_reference || d.scripture_reading}
                        </span>
                        <span className="text-xs text-slate-400">· by {d.author_attribution}</span>
                      </div>

                      <h4 className="font-bold text-ink text-sm sm:text-base">{d.title}</h4>

                      {(d.key_verse_text || d.memory_verse_text) && (
                        <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border-l-2 border-brand-blue line-clamp-1">
                          "{d.key_verse_text || d.memory_verse_text}"
                        </p>
                      )}

                      <p className="text-xs text-slate-500 line-clamp-2">{d.reflection_body}</p>

                      {d.thought_for_day && (
                        <div className="text-[11px] font-semibold text-brand-blue flex items-center gap-1 pt-0.5">
                          <Sparkles size={12} /> Thought: {d.thought_for_day}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        onClick={() => {
                          setPreviewDevotional(d);
                          setModalPreviewOpen(true);
                        }}
                        size="small"
                        startIcon={<Eye size={14} />}
                        sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                      >
                        Preview Card
                      </Button>
                      <Button
                        onClick={() => handleOpenEditModal(d)}
                        size="small"
                        startIcon={<Edit3 size={14} />}
                        sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                        variant="outlined"
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleDelete(d)}
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

            {/* Pagination Controls */}
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
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: BULK PDF UPLOAD & REVIEW */}
      {/* ============================================================= */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* Upload Zone Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-ink">Upload Bi-Annual / Annual Devotional Document</h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload the 6-month or full-year devotional PDF. The system will automatically parse every single day,
              extract all scripture texts, key verses, reflection paragraphs, thoughts for the day, songs, and Bible readings.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleUploadSubmit}>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition hover:bg-slate-50">
                <FileText className="text-brand-blue mb-2" size={36} />
                <label className="cursor-pointer text-sm font-bold text-brand-blue hover:underline">
                  <span>{selectedFile ? selectedFile.name : "Click to select a PDF file"}</span>
                  <input
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    type="file"
                  />
                </label>
                <p className="mt-1 text-xs text-slate-400">PDF documents up to 500MB (Scanned print books or digital text)</p>
                {selectedFile && (
                  <span className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>

              {/* Ingestion Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <FormControl fullWidth size="small">
                  <InputLabel>Target Publication Year</InputLabel>
                  <Select
                    label="Target Publication Year"
                    onChange={(e) => setUploadTargetYear(Number(e.target.value))}
                    value={uploadTargetYear}
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                      <MenuItem key={yr} value={yr}>
                        {yr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  helperText="Default 1 (start of devotionals)"
                  label="Book Start Page"
                  onChange={(e) => setUploadStartPage(Math.max(1, Number(e.target.value) || 1))}
                  size="small"
                  type="number"
                  value={uploadStartPage}
                />

                <TextField
                  fullWidth
                  helperText="Default 184 (excludes back-matter)"
                  label="Book End Page"
                  onChange={(e) => setUploadEndPage(Math.max(1, Number(e.target.value) || 184))}
                  size="small"
                  type="number"
                  value={uploadEndPage}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Preliminary preface, table of contents, and branch directories are automatically detected and excluded.
                </span>
                <Button
                  disabled={!selectedFile || uploading}
                  startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                  sx={{
                    backgroundColor: "#1A4B8C",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    "&:hover": { backgroundColor: "#143A6D" },
                  }}
                  type="submit"
                  variant="contained"
                >
                  {uploading ? "Uploading & Starting Ingestion..." : "Start Document Ingestion"}
                </Button>
              </div>
            </form>
          </div>

          {/* Active Batch Ingestion Status / Review Grid */}
          {activeBatch && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">Batch Details: {activeBatch.file_name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        activeBatch.status === "REVIEW"
                          ? "bg-purple-100 text-purple-800"
                          : activeBatch.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : activeBatch.status === "PARSING"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {activeBatch.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Target Year: {activeBatch.target_year || uploadTargetYear} · Date Range: {activeBatch.date_range_start || "Pending"} to {activeBatch.date_range_end || "Pending"} ·{" "}
                    Total Extracted: {activeBatch.parsed_entries} daily devotionals
                  </p>
                </div>

                {activeBatch.status === "REVIEW" && (
                  <div className="flex items-center gap-3">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={replaceConflicts}
                          onChange={(e) => setReplaceConflicts(e.target.checked)}
                          size="small"
                        />
                      }
                      label={<span className="text-xs font-semibold text-slate-700">Overwrite conflicts</span>}
                    />

                    <Button
                      disabled={confirmingBatch}
                      onClick={() => handleConfirmBatch(activeBatch.id)}
                      startIcon={confirmingBatch ? <CircularProgress size={16} /> : <Check size={16} />}
                      sx={{
                        backgroundColor: "#166534",
                        color: "#ffffff",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 3,
                        py: 1,
                        "&:hover": { backgroundColor: "#14532d" },
                      }}
                      variant="contained"
                    >
                      {confirmingBatch ? "Importing..." : "Approve & Import Into Drafts"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Status Notice & Live Progress Bar */}
              {activeBatch.status === "PARSING" && (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <CircularProgress size={16} sx={{ color: "#b45309" }} />
                      Extracting publication pages with Gemini Vision OCR...
                    </span>
                    <span>
                      {activeBatch.processed_pages && activeBatch.total_pages
                        ? `${activeBatch.processed_pages} / ${activeBatch.total_pages} pages (${Math.round((activeBatch.processed_pages / activeBatch.total_pages) * 100)}%)`
                        : `${activeBatch.parsed_entries} devotionals extracted`}
                    </span>
                  </div>
                  {activeBatch.total_pages && activeBatch.total_pages > 0 && (
                    <LinearProgress
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(180, 83, 9, 0.2)",
                        "& .MuiLinearProgress-bar": { backgroundColor: "#b45309", borderRadius: 4 },
                      }}
                      value={Math.min(100, Math.round(((activeBatch.processed_pages || 0) / activeBatch.total_pages) * 100))}
                      variant="determinate"
                    />
                  )}
                  <p className="text-[11px] text-amber-700">
                    Pages are analyzed in the background. Extracted days will appear in the review list below as they complete.
                  </p>
                </div>
              )}

              {activeBatch.status === "FAILED" && (
                <Alert severity="error">
                  Parsing error: {activeBatch.error_log || "Could not parse document."}
                </Alert>
              )}

              {activeBatch.status === "CONFIRMED" && (
                <Alert severity="success">
                  This batch has been confirmed and all {activeBatch.parsed_entries} devotionals have been successfully imported into the system.
                  They will automatically publish on their respective calendar dates according to your schedule.
                </Alert>
              )}

              {/* Parsed Entries Review Table */}
              {activeBatch.entries && activeBatch.entries.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-700">
                      Extracted Daily Devotionals ({activeBatch.entries.length} items)
                    </h4>
                    <span className="text-xs text-slate-400">Review before confirming</span>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                    {activeBatch.entries.map((entry) => (
                      <div
                        className={`p-4 transition hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          entry.has_parsing_issues ? "bg-amber-50/40" : ""
                        }`}
                        key={entry.id}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-brand-blue bg-soft-blue px-2 py-0.5 rounded">
                              {entry.date}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{entry.title}</span>
                            {entry.has_parsing_issues && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                <AlertTriangle size={12} /> {entry.parsing_notes || "Review required"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            <strong>Text:</strong> {entry.text_reference} · <strong>Key Verse:</strong> {entry.key_verse_reference}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1 italic">
                            "{entry.key_verse_text}"
                          </p>
                        </div>

                        <div className="shrink-0">
                          <Button
                            onClick={() => {
                              setPreviewDevotional({
                                id: entry.id,
                                date: entry.date,
                                title: entry.title,
                                slug: `${entry.date}-preview`,
                                status: "DRAFT",
                                text_reference: entry.text_reference,
                                text_body: entry.text_body,
                                key_verse_reference: entry.key_verse_reference,
                                key_verse_text: entry.key_verse_text,
                                reflection_body: entry.reflection_body,
                                thought_for_day: entry.thought_for_day,
                                song_for_day: entry.song_for_day,
                                bible_reading_for_day: entry.bible_reading_for_day,
                                author_attribution: entry.author_attribution,
                                card_template: autoSettings.default_template,
                              });
                              setModalPreviewOpen(true);
                            }}
                            size="small"
                            startIcon={<Eye size={14} />}
                            sx={{ textTransform: "none", color: "#1A4B8C" }}
                          >
                            Inspect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historical Batches List */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-ink mb-4">Ingestion History</h3>
            {loadingBatches ? (
              <div className="p-8 text-center"><CircularProgress size={24} /></div>
            ) : batches.length === 0 ? (
              <p className="text-xs text-slate-500">No batches uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <div className="py-3.5 flex items-center justify-between gap-3" key={b.id}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ink">{b.file_name}</span>
                        <span className="text-[10px] rounded px-2 py-0.5 font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {b.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {b.parsed_entries} entries · {new Date(b.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={async () => {
                          const detailed = await fetchBatchDetail(b.id);
                          setActiveBatch(detailed);
                        }}
                        size="small"
                        sx={{ textTransform: "none", color: "#1A4B8C" }}
                      >
                        View
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleDeleteBatch(b.id)}
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: CALENDAR VIEW */}
      {/* ============================================================= */}
      {activeTab === "calendar" && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Month Header & Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                }}
                size="small"
                startIcon={<ChevronLeft size={16} />}
                sx={{ textTransform: "none" }}
              >
                Previous
              </Button>
              <h3 className="text-lg font-bold text-ink">
                {calendarDate.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
              </h3>
              <Button
                onClick={() => {
                  setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                }}
                size="small"
                sx={{ textTransform: "none" }}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="size-2.5 rounded-full bg-emerald-500" /> Published
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                <span className="size-2.5 rounded-full bg-amber-500" /> Scheduled (Draft)
              </span>
              <Button
                onClick={() => setCalendarDate(new Date())}
                size="small"
                sx={{ textTransform: "none", color: "#1A4B8C", fontWeight: 700 }}
              >
                Jump to Today
              </Button>
            </div>
          </div>

          {/* 7-column Calendar Grid */}
          {loadingCalendar ? (
            <div className="p-16 text-center">
              <CircularProgress size={32} sx={{ color: "#1A4B8C" }} />
              <p className="mt-2 text-xs text-slate-500">Loading month schedule...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px rounded-xl border border-slate-200 bg-slate-200 overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div className="bg-slate-50 py-2 text-center text-xs font-bold text-slate-600" key={dayName}>
                {dayName}
              </div>
            ))}

            {calendarDays.map((cd, idx) => {
              if (cd.dayNumber === 0) {
                return <div className="min-h-24 bg-slate-50/40 p-2" key={`empty-${idx}`} />;
              }

              const hasEntry = Boolean(cd.entry);
              const isToday =
                new Date().toISOString().split("T")[0] === cd.dateKey;

              return (
                <div
                  className={`min-h-24 p-2 transition flex flex-col justify-between bg-white hover:bg-slate-50 cursor-pointer ${
                    isToday ? "ring-2 ring-brand-blue ring-inset" : ""
                  }`}
                  key={cd.dateKey}
                  onClick={async () => {
                    if (cd.entry) {
                      const fullDev = devotionals.find((d) => d.date === cd.dateKey);
                      if (fullDev) {
                        handleOpenEditModal(fullDev);
                      } else {
                        // Create pre-filled with date
                        handleOpenCreateModal(cd.dateKey);
                      }
                    } else {
                      handleOpenCreateModal(cd.dateKey);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`size-6 grid place-items-center rounded-full text-xs font-bold ${
                        isToday ? "bg-brand-blue text-white" : "text-slate-700"
                      }`}
                    >
                      {cd.dayNumber}
                    </span>

                    {hasEntry && (
                      <span
                        className={`size-2.5 rounded-full ${
                          cd.entry?.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        title={cd.entry?.status}
                      />
                    )}
                  </div>

                  {cd.entry ? (
                    <div className="mt-1">
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                        {cd.entry.title}
                      </p>
                      <span className="mt-1 block text-[9px] uppercase font-semibold text-slate-400">
                        {cd.entry.card_template || "classic"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 italic self-center">
                      + Add
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: AUTO-PUBLISH SETTINGS */}
      {/* ============================================================= */}
      {activeTab === "settings" && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-ink">Devotional Scheduling & Auto-Publish Settings</h3>
          <p className="mt-1 text-xs text-slate-500">
            Configure the automated system to publish daily devotionals for users at your preferred local time.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSaveSettings}>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSettings.is_enabled}
                    onChange={(e) => setAutoSettings({ ...autoSettings, is_enabled: e.target.checked })}
                  />
                }
                label={
                  <div>
                    <span className="block text-sm font-bold text-ink">Enable Automated Daily Publishing</span>
                    <span className="block text-xs text-slate-500">
                      When enabled, drafts matching today's date will automatically transition to PUBLISHED at the set time.
                    </span>
                  </div>
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                fullWidth
                helperText="24-hour format (e.g. 05:00 for 5:00 AM)"
                label="Daily Auto-Publish Time"
                onChange={(e) => setAutoSettings({ ...autoSettings, publish_time: e.target.value })}
                required
                size="small"
                type="time"
                value={autoSettings.publish_time.slice(0, 5)}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Timezone</InputLabel>
                <Select
                  label="Timezone"
                  onChange={(e) => setAutoSettings({ ...autoSettings, timezone_name: e.target.value })}
                  value={autoSettings.timezone_name}
                >
                  <MenuItem value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</MenuItem>
                  <MenuItem value="UTC">UTC (GMT)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (BST / GMT)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST / EDT)</MenuItem>
                  <MenuItem value="America/Chicago">America/Chicago (CST / CDT)</MenuItem>
                  <MenuItem value="Africa/Accra">Africa/Accra (GMT)</MenuItem>
                  <MenuItem value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormControl fullWidth size="small">
                <InputLabel>Default Card Template</InputLabel>
                <Select
                  label="Default Card Template"
                  onChange={(e) => setAutoSettings({ ...autoSettings, default_template: e.target.value })}
                  value={autoSettings.default_template}
                >
                  {Object.values(DEVOTIONAL_TEMPLATES).map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.name} — {tpl.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Default Author Attribution"
                onChange={(e) => setAutoSettings({ ...autoSettings, default_author: e.target.value })}
                required
                size="small"
                value={autoSettings.default_author}
              />
            </div>

            {/* ===================================================== */}
            {/* AI VISION OCR MODEL CONFIGURATION (TOP 10 MODELS) */}
            {/* ===================================================== */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-soft-blue text-brand-blue">
                  <Cpu size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-ink">
                    Multimodal AI Vision & OCR Engine
                  </h4>
                  <p className="text-xs text-slate-500">
                    Choose which AI model processes scanned devotional book publications (Gemini is the recommended default).
                  </p>
                </div>
              </div>

              {/* Classic Well-Styled Dropdown */}
              <FormControl fullWidth size="small">
                <InputLabel id="ai-model-select-label">AI Vision Model</InputLabel>
                <Select
                  label="AI Vision Model"
                  labelId="ai-model-select-label"
                  onChange={(e) =>
                    setAutoSettings({
                      ...autoSettings,
                      ocr_model: e.target.value,
                    })
                  }
                  renderValue={(value) => {
                    const selected = POPULAR_AI_MODELS.find((m) => m.id === value) || POPULAR_AI_MODELS[0];
                    return (
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="font-bold text-slate-800 text-xs">
                          {selected.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selected.badgeColor}`}>
                          {selected.badge}
                        </span>
                      </div>
                    );
                  }}
                  value={autoSettings.ocr_model || "gemini-3.1-flash-lite-preview"}
                >
                  {POPULAR_AI_MODELS.map((model) => (
                    <MenuItem
                      key={model.id}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: "1px solid #f1f5f9",
                        "&:last-child": { borderBottom: "none" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.5,
                      }}
                      value={model.id}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-ink">{model.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({model.provider})</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {model.description}
                      </p>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Dynamic API Key Input based on Selected Model */}
              {(() => {
                const selected =
                  POPULAR_AI_MODELS.find((m) => m.id === (autoSettings.ocr_model || "gemini-3.1-flash-lite-preview")) ||
                  POPULAR_AI_MODELS[0];
                return (
                  <TextField
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowApiKey(!showApiKey)}
                            size="small"
                          >
                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      startAdornment: (
                        <InputAdornment position="start">
                          <Key className="text-slate-400" size={16} />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    helperText={
                      <span>
                        Key for <strong>{selected.provider}</strong>. If left blank, the system automatically uses the key configured in the server's <code>.env</code>.
                      </span>
                    }
                    label={selected.keyLabel}
                    onChange={(e) =>
                      setAutoSettings({
                        ...autoSettings,
                        ocr_api_key: e.target.value,
                        gemini_api_key: selected.id.startsWith("gemini") ? e.target.value : autoSettings.gemini_api_key,
                      })
                    }
                    placeholder={selected.keyPlaceholder}
                    size="small"
                    type={showApiKey ? "text" : "password"}
                    value={autoSettings.ocr_api_key || (selected.id.startsWith("gemini") ? autoSettings.gemini_api_key : "") || ""}
                  />
                );
              })()}
            </div>

            <div className="pt-3">
              <Button
                disabled={savingSettings}
                startIcon={savingSettings ? <CircularProgress size={16} /> : <Check size={16} />}
                sx={{
                  backgroundColor: "#1A4B8C",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  py: 1,
                  "&:hover": { backgroundColor: "#143A6D" },
                }}
                type="submit"
                variant="contained"
              >
                {savingSettings ? "Saving Settings..." : "Save Auto-Publish Settings"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================= */}
      {/* SPLIT-SCREEN DEVOTIONAL EDITOR & DESIGNER MODAL */}
      {/* ============================================================= */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid #f1f5f9" }}>
          {editingDevotionalId ? "Edit Daily Devotional & Card Design" : "Write Daily Devotional"}
        </DialogTitle>

        <form onSubmit={handleSaveDevotional}>
          <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column: Form Controls */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Devotional Content & Scripture
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    fullWidth
                    label="Devotional Title / Topic *"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. TOTAL DELIVERANCE FROM UNGODLY DRESSING"
                    required
                    size="small"
                    value={formData.title}
                  />

                  <TextField
                    fullWidth
                    helperText="YYYY-MM-DD"
                    label="Date *"
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    size="small"
                    type="date"
                    value={formData.date}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    fullWidth
                    label="Author Attribution *"
                    onChange={(e) => setFormData({ ...formData, author_attribution: e.target.value })}
                    required
                    size="small"
                    value={formData.author_attribution}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      value={formData.status}
                    >
                      <MenuItem value="DRAFT">Draft (Scheduled)</MenuItem>
                      <MenuItem value="PUBLISHED">Published</MenuItem>
                      <MenuItem value="ARCHIVED">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    fullWidth
                    helperText="e.g. REVELATION 17:1-9"
                    label="Scripture Text Reference"
                    onChange={(e) => setFormData({ ...formData, text_reference: e.target.value })}
                    size="small"
                    value={formData.text_reference}
                  />

                  <TextField
                    fullWidth
                    helperText="e.g. 1 JOHN 2:15"
                    label="Key Verse Reference"
                    onChange={(e) => setFormData({ ...formData, key_verse_reference: e.target.value })}
                    size="small"
                    value={formData.key_verse_reference}
                  />
                </div>

                <TextField
                  fullWidth
                  helperText="The quotation text for the key verse"
                  label="Key Verse Text Quote"
                  multiline
                  onChange={(e) => setFormData({ ...formData, key_verse_text: e.target.value })}
                  rows={2}
                  size="small"
                  value={formData.key_verse_text}
                />

                <TextField
                  fullWidth
                  helperText="The numbered bible verses for today's reading passage"
                  label="Scripture Passage Verses (Text Body)"
                  multiline
                  onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
                  placeholder="1. And there came one of the seven angels...&#10;2. With whom the kings of the earth..."
                  rows={3}
                  size="small"
                  value={formData.text_body}
                />

                <TextField
                  fullWidth
                  helperText="The core spiritual message and breakdown"
                  label="Reflection / Exhortation Message *"
                  multiline
                  onChange={(e) => setFormData({ ...formData, reflection_body: e.target.value })}
                  placeholder="The spirit behind ungodly dressing is very strong..."
                  required
                  rows={5}
                  size="small"
                  value={formData.reflection_body}
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField
                    fullWidth
                    label="Thought for the Day"
                    onChange={(e) => setFormData({ ...formData, thought_for_day: e.target.value })}
                    placeholder="Purge yourself thoroughly..."
                    size="small"
                    value={formData.thought_for_day}
                  />

                  <TextField
                    fullWidth
                    label="Song for the Day"
                    onChange={(e) => setFormData({ ...formData, song_for_day: e.target.value })}
                    placeholder="Have you being to Jesus..."
                    size="small"
                    value={formData.song_for_day}
                  />

                  <TextField
                    fullWidth
                    label="Bible in One Year"
                    onChange={(e) => setFormData({ ...formData, bible_reading_for_day: e.target.value })}
                    placeholder="Acts 18-19"
                    size="small"
                    value={formData.bible_reading_for_day}
                  />
                </div>

                {/* Card Design Template & Color Customization */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Card Template & Styling
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(DEVOTIONAL_TEMPLATES).map((tpl) => (
                      <button
                        className={`p-2.5 rounded-lg border text-left text-xs transition ${
                          formData.card_template === tpl.id
                            ? "border-brand-blue bg-white shadow-sm ring-1 ring-brand-blue"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                        key={tpl.id}
                        onClick={() => setFormData({ ...formData, card_template: tpl.id })}
                        type="button"
                      >
                        <strong className="block font-bold text-slate-800">{tpl.name}</strong>
                        <span className="text-[10px] text-slate-500 block truncate">{tpl.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    <TextField
                      fullWidth
                      helperText="Hex color e.g. #FAF6EE (optional override)"
                      label="Custom Background Color"
                      onChange={(e) => setFormData({ ...formData, card_bg_color: e.target.value })}
                      size="small"
                      value={formData.card_bg_color}
                    />

                    <TextField
                      fullWidth
                      helperText="Hex color e.g. #1A4B8C (optional override)"
                      label="Custom Accent Color"
                      onChange={(e) => setFormData({ ...formData, card_accent_color: e.target.value })}
                      size="small"
                      value={formData.card_accent_color}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={14} /> Live Devotional Card Preview
                  </h4>
                  <span className="text-[11px] text-brand-blue font-semibold">
                    Template: {formData.card_template || "classic"}
                  </span>
                </div>

                <div className="sticky top-4 max-h-[750px] overflow-y-auto pr-2">
                  <DevotionalCardPreview
                    customAccentColor={formData.card_accent_color}
                    customBgColor={formData.card_bg_color}
                    devotional={formData}
                    selectedTemplate={formData.card_template}
                  />
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: "1px solid #f1f5f9" }}>
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
              {editingDevotionalId ? "Save Devotional Changes" : "Save & Add to Schedule"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ============================================================= */}
      {/* QUICK PREVIEW MODAL */}
      {/* ============================================================= */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setModalPreviewOpen(false)}
        open={modalPreviewOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {previewDevotional?.title || "Devotional Preview"}
        </DialogTitle>
        <DialogContent dividers>
          {previewDevotional && (
            <DevotionalCardPreview devotional={previewDevotional} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalPreviewOpen(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================= */}
      {/* BEAUTIFUL CONFIRMATION DIALOG (replaces window.confirm) */}
      {/* ============================================================= */}
      <Dialog
        PaperProps={{
          sx: { borderRadius: "16px", p: 1, maxWidth: "440px", width: "100%" },
        }}
        onClose={() => !confirmLoading && setConfirmDialog((prev) => ({ ...prev, open: false }))}
        open={confirmDialog.open}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <div className="grid size-10 place-items-center rounded-full bg-red-100 text-red-600 shrink-0">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{confirmDialog.title}</h3>
          </div>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.description}</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            disabled={confirmLoading}
            onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              borderRadius: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={confirmLoading}
            onClick={async () => {
              setConfirmLoading(true);
              try {
                await confirmDialog.onConfirm();
              } finally {
                setConfirmLoading(false);
                setConfirmDialog((prev) => ({ ...prev, open: false }));
              }
            }}
            startIcon={confirmLoading ? <CircularProgress size={16} /> : <Trash2 size={16} />}
            sx={{
              backgroundColor: confirmDialog.danger ? "#dc2626" : "#1A4B8C",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              "&:hover": {
                backgroundColor: confirmDialog.danger ? "#b91c1c" : "#143A6D",
              },
            }}
            variant="contained"
          >
            {confirmLoading ? "Deleting..." : confirmDialog.confirmLabel || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
