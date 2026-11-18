import React, { useState, useMemo } from "react";
import {
  ImagePlus,
  Trash2,
  Check,
  AlertCircle,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
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
  getGalleryContent,
  saveGalleryContent,
  useGalleryContent,
} from "../../lib/contentStore";
import type { ConferenceImage } from "../../data/mediaAssets";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const ITEMS_PER_PAGE = 8;
const CATEGORIES: ConferenceImage["category"][] = [
  "Conferences",
  "Crusades",
  "Worship",
  "Ministers",
];

export default function AdminGalleryManager() {
  const images = useGalleryContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Form Fields
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ConferenceImage["category"]>("Conferences");
  const [description, setDescription] = useState("");

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Modal State
  const [editingPhoto, setEditingPhoto] = useState<ConferenceImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<ConferenceImage["category"]>("Conferences");
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        img.title.toLowerCase().includes(q) ||
        img.category.toLowerCase().includes(q) ||
        img.description.toLowerCase().includes(q);

      const matchesCat = categoryFilter === "ALL" || img.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [images, debouncedSearch, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / ITEMS_PER_PAGE));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load image";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setEditUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load image";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setStatus({ type: "error", text: "Please provide both a photograph title and image." });
      return;
    }

    const newItem: ConferenceImage = {
      id: `gallery-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      category,
      description: description.trim() || `${title} from HOREMOW ministry.`,
    };

    const updated = [newItem, ...getGalleryContent()];
    saveGalleryContent(updated);
    setTitle("");
    setUrl("");
    setDescription("");
    setStatus({ type: "success", text: "Photograph added to 3D and public gallery!" });
    setTimeout(() => setStatus(null), 4000);
  };

  const openEditModal = (photo: ConferenceImage) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCategory(photo.category);
    setEditUrl(photo.url);
    setEditDescription(photo.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editTitle.trim() || !editUrl.trim()) {
      setStatus({ type: "error", text: "Please provide title and image URL." });
      return;
    }

    const currentAll = getGalleryContent();
    const updated = currentAll.map((img) => {
      if (img.id === editingPhoto.id) {
        return {
          ...img,
          title: editTitle.trim(),
          category: editCategory,
          url: editUrl.trim(),
          description: editDescription.trim(),
        };
      }
      return img;
    });

    saveGalleryContent(updated);
    setEditingPhoto(null);
    setStatus({ type: "success", text: `Photograph "${editTitle}" updated successfully!` });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, imgTitle: string) => {
    if (window.confirm(`Are you sure you want to delete photograph "${imgTitle}"?`)) {
      const updated = getGalleryContent().filter((img) => img.id !== id);
      saveGalleryContent(updated);
      setStatus({ type: "success", text: "Photograph removed from gallery." });
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

      {/* Add New Photograph Form */}
      <form
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        onSubmit={handleAddImage}
      >
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-brand-blue">
            <ImagePlus size={18} /> Add New Gallery Photograph
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Upload images from device or paste Cloudinary/HTTPS links. New photographs synchronize with the 3D gallery and public gallery immediately.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            fullWidth
            label="Photograph Title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 2026 International Ministers Convocation"
            required
            size="small"
            value={title}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              onChange={(e) => setCategory(e.target.value as ConferenceImage["category"])}
              value={category}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Direct Image File Upload & URL */}
        <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50 space-y-3">
          <span className="text-xs font-bold text-ink block">Photograph File or URL *</span>
          <div className="grid gap-3 sm:grid-cols-12 items-center">
            <div className="sm:col-span-8">
              <TextField
                fullWidth
                label="Direct Image URL (Cloudinary / HTTPS)"
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                size="small"
                value={url}
              />
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition">
                <Upload size={14} className="text-brand-blue" />
                <span>Upload File</span>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  type="file"
                />
              </label>
              {url && (
                <img
                  alt="Preview"
                  className="size-10 rounded object-cover border border-slate-200"
                  src={url}
                />
              )}
            </div>
          </div>
        </div>

        <TextField
          fullWidth
          label="Description / Caption"
          multiline
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Context, country, or conference details..."
          rows={2}
          size="small"
          value={description}
        />

        <div className="flex justify-end pt-1">
          <Button
            startIcon={<Plus size={16} />}
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
            Add to Gallery
          </Button>
        </div>
      </form>

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
            placeholder="Search gallery photographs by title or description..."
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
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={categoryFilter}
            >
              <MenuItem value="ALL">All Categories ({images.length})</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Gallery Photo Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <span>Current Photographs ({filteredImages.length}) — Click any card to edit</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedImages.length === 0 ? (
          <div className="p-12 text-center">
            <ImagePlus className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No photographs found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or upload a new photo.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-4">
            {paginatedImages.map((img) => (
              <div
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition cursor-pointer hover:border-brand-blue"
                key={img.id}
                onClick={() => openEditModal(img)}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                  <img
                    alt={img.title}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    src={img.url}
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    {img.category}
                  </span>

                  {/* Top Action Buttons: Edit & Delete */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      aria-label="Edit image"
                      className="grid size-7 place-items-center rounded-full bg-white/90 text-brand-blue shadow-sm hover:bg-white hover:scale-110 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(img);
                      }}
                      title="Edit Photograph"
                      type="button"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      aria-label="Delete image"
                      className="grid size-7 place-items-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(img.id, img.title);
                      }}
                      title="Delete Photograph"
                      type="button"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-ink line-clamp-1 group-hover:text-brand-blue transition">
                      {img.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-brand-blue flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      Edit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{img.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-2 pt-4 mt-4">
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

      {/* EDIT PHOTOGRAPH MODAL */}
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setEditingPhoto(null)}
        open={Boolean(editingPhoto)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Gallery Photograph</DialogTitle>
        <form onSubmit={handleSaveEdit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              fullWidth
              label="Photograph Title *"
              onChange={(e) => setEditTitle(e.target.value)}
              required
              size="small"
              value={editTitle}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                onChange={(e) => setEditCategory(e.target.value as ConferenceImage["category"])}
                value={editCategory}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Direct Image File Upload & URL for Edit */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-ink block">Update Photograph File or URL *</span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Image URL (Cloudinary / HTTPS)"
                    onChange={(e) => setEditUrl(e.target.value)}
                    required
                    size="small"
                    value={editUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition">
                    <Upload size={14} className="text-brand-blue" />
                    <span>Upload New</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditFileUpload}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              {editUrl && (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img alt="Preview" className="size-full object-cover" src={editUrl} />
                </div>
              )}
            </div>

            <TextField
              fullWidth
              label="Description / Caption"
              multiline
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              size="small"
              value={editDescription}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditingPhoto(null)} sx={{ textTransform: "none" }}>
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
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
