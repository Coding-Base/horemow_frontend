import React, { useState, useMemo } from "react";
import {
  BookMarked,
  Plus,
  Trash2,
  Edit3,
  Search,
  Upload,
  Send,
  BookOpen,
  Globe2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileDown,
  X,
  Eye,
} from "lucide-react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getPublicationsContent,
  savePublicationsContent,
  usePublicationsContent,
} from "../../lib/contentStore";
import type { Publication } from "../../data/content";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";
import { showToast } from "../../lib/soundToast";
import {
  uploadBookPdf,
  createPublicationApi,
  updatePublicationApi,
  deletePublicationApi,
} from "../../lib/publicationApi";
import BookReaderModal from "../books/BookReaderModal";

const BOOK_CATEGORIES = [
  "Holiness & Christian Living",
  "Marriage & Family",
  "Prayer & Faith",
  "End-Time & Heaven",
  "Ministry & Church Leadership",
  "Evangelism & Missions",
  "Tracts & Booklets",
];

const ITEMS_PER_PAGE = 5;

export default function AdminBookstoreManager() {
  const books = usePublicationsContent();

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [previewingBook, setPreviewingBook] = useState<Publication | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Pastor Paul Rika");
  const [category, setCategory] = useState(BOOK_CATEGORIES[0]);
  const [language, setLanguage] = useState("English, French, Hausa");
  const [format, setFormat] = useState("PDF & Paperback (200+ Pages)");
  const [price, setPrice] = useState("Free Download / Ministry Gift");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");

  // Upload States
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfMeta, setPdfMeta] = useState<{ name?: string; size?: string; pages?: number } | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "ALL" || b.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [books, debouncedSearch, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const openCreateModal = () => {
    setEditingBookId(null);
    setTitle("");
    setAuthor("Pastor Paul Rika");
    setCategory(BOOK_CATEGORIES[0]);
    setLanguage("English, French, Hausa");
    setFormat("PDF & Paperback (200+ Pages)");
    setPrice("Free Download / Ministry Gift");
    setDescription("");
    setCoverUrl("");
    setFileUrl("");
    setTelegramUrl("");
    setPdfMeta(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Publication) => {
    setEditingBookId(book.id || book.title);
    setTitle(book.title);
    setAuthor(book.author || "Pastor Paul Rika");
    setCategory(book.category);
    setLanguage(book.language);
    setFormat(book.format || "PDF");
    setPrice(book.price || "Free");
    setDescription(book.description);
    setCoverUrl(book.coverUrl || "");
    setFileUrl(book.fileUrl || "");
    setTelegramUrl(book.telegramUrl || "");
    setPdfMeta(book.fileUrl ? { name: book.title + ".pdf" } : null);
    setIsModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingCover(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        setCoverUrl(dataUrl);
        showToast("Book cover uploaded successfully!", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load cover image";
        showToast(msg, "error");
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      const result = await uploadBookPdf(file);
      setFileUrl(result.publicUrl);
      const sizeMb = (result.fileSize / (1024 * 1024)).toFixed(1);
      setPdfMeta({
        name: result.fileName,
        size: `${sizeMb} MB`,
        pages: result.pageCount,
      });

      if (result.pageCount && result.pageCount > 0) {
        setFormat(`PDF (${result.pageCount} Pages) & Paperback`);
      }

      showToast(`Book PDF "${result.fileName}" uploaded to Supabase Storage!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload PDF";
      showToast(msg, "error");
    } finally {
      setIsUploadingPdf(false);
      e.target.value = "";
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Please provide both book title and synopsis.", "error");
      return;
    }

    setIsSaving(true);
    const currentAll = getPublicationsContent();

    try {
      if (editingBookId) {
        const payload: Partial<Publication> = {
          title: title.trim(),
          author: author.trim(),
          category,
          language: language.trim(),
          format: format.trim(),
          price: price.trim(),
          description: description.trim(),
          coverUrl: coverUrl.trim(),
          fileUrl: fileUrl.trim(),
          telegramUrl: telegramUrl.trim(),
        };

        try {
          await updatePublicationApi(editingBookId, payload);
        } catch (apiErr) {
          console.warn("Backend update failed, updating local state:", apiErr);
        }

        const updated = currentAll.map((b) => {
          if (b.id === editingBookId || b.title === editingBookId) {
            return {
              ...b,
              ...payload,
              coverUrl: payload.coverUrl || b.coverUrl,
              fileUrl: payload.fileUrl || b.fileUrl,
              telegramUrl: payload.telegramUrl || b.telegramUrl,
            };
          }
          return b;
        });
        savePublicationsContent(updated);
        showToast(`Book "${title}" updated successfully!`, "success");
      } else {
        const payload: Partial<Publication> = {
          title: title.trim(),
          author: author.trim(),
          category,
          language: language.trim(),
          format: format.trim(),
          price: price.trim(),
          description: description.trim(),
          coverUrl:
            coverUrl.trim() ||
            "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg",
          fileUrl: fileUrl.trim() || "https://horemow.org/books/sample.pdf",
          telegramUrl: telegramUrl.trim() || "https://t.me/horemowbooks",
        };

        let newBook: Publication = {
          id: `pub-${Date.now()}`,
          ...payload,
        } as Publication;

        try {
          const apiCreated = await createPublicationApi(payload);
          if (apiCreated?.id) {
            newBook = apiCreated;
          }
        } catch (apiErr) {
          console.warn("Backend creation failed, saving to local cache:", apiErr);
        }

        savePublicationsContent([newBook, ...currentAll]);
        showToast(`Book "${title}" published and added to catalog!`, "success");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save publication";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (idOrTitle: string) => {
    if (window.confirm(`Are you sure you want to remove "${idOrTitle}" from the bookstore?`)) {
      try {
        await deletePublicationApi(idOrTitle);
      } catch (err) {
        console.warn("Backend delete error:", err);
      }
      const updated = getPublicationsContent().filter(
        (b) => b.id !== idOrTitle && b.title !== idOrTitle
      );
      savePublicationsContent(updated);
      showToast("Book deleted from bookstore catalog.", "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <BookMarked size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Publications & Bookstore Manager</h2>
            <p className="text-xs text-slate-500">
              Manage holy books, tracts, study manuals, PDF downloads, and Telegram book directories.
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
          Add New Publication
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
            placeholder="Search books by title, author, category, or synopsis..."
            size="small"
            value={searchInput}
          />
        </div>

        <div className="sm:col-span-4">
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              value={selectedCategory}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {BOOK_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Books Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Bookstore Catalog ({filteredBooks.length} books)</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedBooks.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No books found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or add a new publication.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedBooks.map((book) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={book.id || book.title}
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 sm:size-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm">
                    <img
                      alt={book.title}
                      className="size-full object-cover"
                      src={
                        book.coverUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg"
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                        {book.category}
                      </span>
                      <span className="text-xs text-brand-green font-semibold">
                        by {book.author || "Pastor Paul Rika"}
                      </span>
                      {book.format && (
                        <span className="text-xs text-slate-400">· {book.format}</span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{book.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{book.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Globe2 size={12} className="text-slate-400" /> {book.language}
                      </span>
                      {book.fileUrl && (
                        <a
                          className="font-bold text-brand-blue hover:underline flex items-center gap-1"
                          href={book.fileUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <FileText size={12} /> Book PDF Link
                        </a>
                      )}
                      {book.telegramUrl && (
                        <a
                          className="font-bold text-sky-600 hover:underline flex items-center gap-1"
                          href={book.telegramUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Send size={12} /> Telegram Directory
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => setPreviewingBook(book)}
                    size="small"
                    startIcon={<Eye size={14} />}
                    sx={{ textTransform: "none", fontWeight: 700, color: "#1E7B34", borderColor: "#1E7B34" }}
                    variant="outlined"
                  >
                    Read Online
                  </Button>
                  <Button
                    onClick={() => openEditModal(book)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(book.id || book.title)}
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

      {/* BOOK EDITOR MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingBookId ? "Edit Publication / Book" : "Add New Publication / Book"}
        </DialogTitle>
        <form onSubmit={handleSaveBook}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Book Title *"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Divine Call for Holy Women"
                required
                size="small"
                value={title}
              />
              <TextField
                fullWidth
                label="Author *"
                onChange={(e) => setAuthor(e.target.value)}
                required
                size="small"
                value={author}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Category *</InputLabel>
                <Select
                  label="Category *"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  {BOOK_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                helperText="Comma separated (e.g. English, French, Hausa)"
                label="Available Languages"
                onChange={(e) => setLanguage(e.target.value)}
                size="small"
                value={language}
              />
              <TextField
                fullWidth
                helperText="e.g. PDF (240 Pages) & Paperback"
                label="Book Format / Edition"
                onChange={(e) => setFormat(e.target.value)}
                size="small"
                value={format}
              />
              <TextField
                fullWidth
                helperText="e.g. Free Download / Ministry Gift"
                label="Availability / Price"
                onChange={(e) => setPrice(e.target.value)}
                size="small"
                value={price}
              />
            </div>

            {/* Book Cover Image Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-2 block">
                Book Cover / Thumbnail Image
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Cover Image URL or Cloudinary Link"
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={coverUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Upload Cover
                      </>
                    )}
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingCover}
                      onChange={handleCoverUpload}
                      type="file"
                    />
                  </label>
                  {coverUrl && (
                    <img
                      alt="Cover Preview"
                      className="size-10 rounded object-cover border border-slate-200"
                      src={coverUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Book File / PDF Upload to Supabase Storage */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <FileText className="text-brand-blue" size={15} /> Book File / PDF (Supabase Cloud Storage)
                </span>
                {fileUrl && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} /> PDF Attached
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    helperText="Public Supabase CDN or direct document URL"
                    label="Book PDF URL"
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://carwmjftjgfwvjxgrxcz.supabase.co/storage/v1/object/public/publications/..."
                    size="small"
                    value={fileUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex flex-col gap-1.5">
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-blue bg-brand-blue/10 px-3 py-2 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white shadow-sm transition">
                    {isUploadingPdf ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Uploading to Supabase...
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Upload Book PDF
                      </>
                    )}
                    <input
                      accept="application/pdf,.pdf"
                      className="hidden"
                      disabled={isUploadingPdf}
                      onChange={handlePdfUpload}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              {fileUrl && (
                <div className="mt-2.5 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 truncate">
                    <FileDown size={14} className="text-brand-blue shrink-0" />
                    <span className="truncate font-semibold">{pdfMeta?.name || "Attached Book Document"}</span>
                    {pdfMeta?.size && <span className="text-[11px] text-slate-400 font-mono">({pdfMeta.size})</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <a
                      className="inline-flex items-center gap-1 font-bold text-brand-blue hover:underline"
                      href={fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={12} /> Test View
                    </a>
                    <button
                      className="text-slate-400 hover:text-red-500 transition"
                      onClick={() => {
                        setFileUrl("");
                        setPdfMeta(null);
                      }}
                      title="Remove PDF"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <TextField
              fullWidth
              helperText="Telegram channel / book post link (optional)"
              label="Telegram Book Link"
              onChange={(e) => setTelegramUrl(e.target.value)}
              placeholder="https://t.me/horemowbooks/..."
              size="small"
              value={telegramUrl}
            />

            <TextField
              fullWidth
              helperText="Summary writeup highlighting the theme and importance of this publication."
              label="Short Writeup / Synopsis *"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A profound biblical guide for Christian believers seeking genuine sanctification..."
              required
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
              disabled={isSaving}
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
              {isSaving ? "Saving..." : editingBookId ? "Save Book Changes" : "Publish Book"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <BookReaderModal
        book={previewingBook}
        isOpen={Boolean(previewingBook)}
        onClose={() => setPreviewingBook(null)}
      />
    </div>
  );
}
