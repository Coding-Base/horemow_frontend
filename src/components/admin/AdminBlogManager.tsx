import React, { useState, useMemo } from "react";
import {
  MessageSquareText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  Loader2,
  Globe,
  User,
  Clock,
  Heading,
  Bold,
  Italic,
  Quote,
  List,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import {
  Alert,
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
  getBlogContent,
  saveBlogContent,
  useBlogContent,
} from "../../lib/contentStore";
import type { BlogPost } from "../../data/content";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";
import { showToast } from "../../lib/soundToast";

const CATEGORIES = [
  "Faith & practice",
  "Christian Holiness",
  "Church & leadership",
  "Family",
  "End-Time & Heaven",
  "Missions & Evangelism",
  "Biblical Doctrine",
];

const ITEMS_PER_PAGE = 5;

export default function AdminBlogManager() {
  const posts = useBlogContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filters
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("Pastor Paul Rika");
  const [readTime, setReadTime] = useState("5 min read");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [postStatus, setPostStatus] = useState<"Published" | "Draft">("Published");

  // Selected post for comments viewing
  const [activeCommentsPost, setActiveCommentsPost] = useState<BlogPost | null>(null);

  // Filtered & Paginated Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        (post.metaKeywords && post.metaKeywords.toLowerCase().includes(q));

      const matchesCat = selectedCategory === "ALL" || post.category === selectedCategory;
      const matchesStatus = selectedStatus === "ALL" || (post.status || "Published") === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [posts, debouncedSearch, selectedCategory, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const openCreateModal = () => {
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setCategory(CATEGORIES[0]);
    setExcerpt("");
    setBody("");
    setAuthor("Pastor Paul Rika");
    setReadTime("5 min read");
    setThumbnailUrl("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setPostStatus("Published");
    setIsEditorOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setBody(post.body || post.excerpt);
    setAuthor(post.author || "Pastor Paul Rika");
    setReadTime(post.readTime || "5 min read");
    setThumbnailUrl(post.thumbnailUrl || "");
    setMetaTitle(post.metaTitle || post.title);
    setMetaDescription(post.metaDescription || post.excerpt);
    setMetaKeywords(post.metaKeywords || "");
    setPostStatus(post.status || "Published");
    setIsEditorOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
      setMetaTitle(`${val} | HOREMOW Journal`);
      setMetaDescription(val);
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setStatus(null);
      try {
        const cloudinaryUrl = await fileToDataUrl(file);
        setThumbnailUrl(cloudinaryUrl);
        setStatus({ type: "success", text: "Image successfully uploaded to Cloudinary!" });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload image";
        setStatus({ type: "error", text: message });
      } finally {
        setIsUploadingImage(false);
        e.target.value = "";
      }
    }
  };

  const insertFormatting = (syntax: string) => {
    setBody((prev) => `${prev}\n\n${syntax}`);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      setStatus({ type: "error", text: "Please provide an article title and excerpt." });
      return;
    }

    const currentAll = getBlogContent();
    const currentDate = new Date().toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (editingPostId) {
      const updated = currentAll.map((p) => {
        if (p.id === editingPostId) {
          return {
            ...p,
            title: title.trim(),
            slug: slug.trim() || p.slug,
            category,
            excerpt: excerpt.trim(),
            body: body.trim() || excerpt.trim(),
            author: author.trim(),
            readTime,
            thumbnailUrl: thumbnailUrl.trim() || p.thumbnailUrl,
            metaTitle: metaTitle.trim(),
            metaDescription: metaDescription.trim(),
            metaKeywords: metaKeywords.trim(),
            status: postStatus,
          };
        }
        return p;
      });
      saveBlogContent(updated);
      showToast(`Article "${title}" updated successfully!`, "success");
      setStatus({ type: "success", text: `Article "${title}" updated successfully.` });
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        title: title.trim(),
        slug:
          slug.trim() ||
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        category,
        excerpt: excerpt.trim(),
        body: body.trim() || excerpt.trim(),
        date: currentDate,
        author: author.trim(),
        readTime,
        thumbnailUrl:
          thumbnailUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
        metaTitle: metaTitle.trim() || `${title} | HOREMOW Journal`,
        metaDescription: metaDescription.trim() || excerpt.trim(),
        metaKeywords: metaKeywords.trim() || "holiness, biblical truth, horemow",
        status: postStatus,
        comments: [],
      };
      saveBlogContent([newPost, ...currentAll]);
      showToast(`Article "${title}" published to CMS successfully!`, "success");
      setStatus({ type: "success", text: `Article "${title}" published to CMS successfully.` });
    }

    setIsEditorOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (postId: string, postTitle: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${postTitle}"?`)) {
      const updated = getBlogContent().filter((p) => p.id !== postId && p.title !== postTitle);
      saveBlogContent(updated);
      showToast("Article deleted successfully.", "success");
      setStatus({ type: "success", text: "Article deleted successfully." });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    const current = getBlogContent();
    const updated = current.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: (p.comments || []).filter((c) => c.id !== commentId),
        };
      }
      return p;
    });
    saveBlogContent(updated);
    setActiveCommentsPost(updated.find((p) => p.id === postId) || null);
    setStatus({ type: "success", text: "Comment removed." });
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

      {/* Header & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-soft-blue text-brand-blue font-bold">
              <MessageSquareText size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Blog & Editorial CMS</h2>
              <p className="text-xs text-slate-500">
                Full editorial publishing system with SEO meta tags, rich formatting, and comment moderation.
              </p>
            </div>
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
          Compose New Article
        </Button>
      </div>

      {/* Search & Filter Controls */}
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
            placeholder="Search articles by title, excerpt, author, keywords..."
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
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              value={selectedCategory}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="sm:col-span-3">
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              value={selectedStatus}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Articles List / Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Articles Archive ({filteredPosts.length} total)</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedPosts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareText className="mx-auto text-slate-300" size={40} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No articles found</h4>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search criteria or write a new article.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedPosts.map((post) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={post.id}
              >
                <div className="flex items-start gap-4">
                  {post.thumbnailUrl && (
                    <img
                      alt={post.title}
                      className="size-16 sm:size-20 rounded-lg object-cover border border-slate-200 shrink-0"
                      src={post.thumbnailUrl}
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[11px] font-bold text-brand-blue">
                        {post.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          post.status === "Draft"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {post.status || "Published"}
                      </span>
                      <span className="text-xs text-slate-400">· {post.date}</span>
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{post.excerpt}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <User size={13} className="text-slate-400" /> {post.author || "Pastor Paul Rika"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" /> {post.readTime || "5 min read"}
                      </span>
                      <button
                        className="flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                        onClick={() => setActiveCommentsPost(post)}
                        type="button"
                      >
                        <MessageCircle size={13} /> {post.comments?.length || 0} comments
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(post)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit CMS
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(post.id, post.title)}
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

      {/* FULL CMS EDITOR DIALOG */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsEditorOpen(false)}
        open={isEditorOpen}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111820" }}>
          {editingPostId ? "Edit Journal Article (CMS)" : "Compose New Article (CMS)"}
        </DialogTitle>
        <form onSubmit={handleSavePost}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* 1. Basic Metadata */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Article Headline / Title *"
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Sanctification of the Mind in an Ungodly Generation"
                required
                size="small"
                value={title}
              />
              <TextField
                fullWidth
                helperText="URL address slug (auto-generated)"
                label="Article Slug"
                onChange={(e) => setSlug(e.target.value)}
                size="small"
                value={slug}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Category / Topic *</InputLabel>
                <Select
                  label="Category / Topic *"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Author / Preacher *"
                onChange={(e) => setAuthor(e.target.value)}
                required
                size="small"
                value={author}
              />
            </div>

            {/* 2. Excerpt */}
            <TextField
              fullWidth
              helperText="Brief 1-2 sentence overview for cards and meta preview."
              label="Article Summary / Excerpt *"
              multiline
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of what this message imparts to the reader..."
              required
              rows={2}
              size="small"
              value={excerpt}
            />

            {/* 3. Featured Image Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-brand-blue" /> Featured Thumbnail Image
                </span>
                {thumbnailUrl && (
                  <span className="text-[11px] text-emerald-600 font-semibold">Image loaded</span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-7">
                  <TextField
                    fullWidth
                    label="Image URL or Cloudinary Link"
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={thumbnailUrl}
                  />
                </div>
                <div className="sm:col-span-5 flex items-center gap-2">
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm ${isUploadingImage ? "opacity-60 cursor-not-allowed" : ""}`}>
                    {isUploadingImage ? (
                      <Loader2 size={14} className="animate-spin text-brand-blue" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{isUploadingImage ? "Uploading to Cloudinary..." : "Upload Image"}</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingImage}
                      onChange={handleImageFileChange}
                      type="file"
                    />
                  </label>
                  {thumbnailUrl && (
                    <img
                      alt="Thumbnail Preview"
                      className="size-10 rounded object-cover border border-slate-200"
                      src={thumbnailUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 4. Rich Body Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink">Article Body Content *</label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue font-bold text-[11px]"
                    onClick={() => insertFormatting("## Section Heading")}
                    title="Insert Heading"
                    type="button"
                  >
                    <Heading size={14} />
                  </button>
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue"
                    onClick={() => insertFormatting("**Bold Text**")}
                    title="Bold"
                    type="button"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue"
                    onClick={() => insertFormatting("*Italic Emphasis*")}
                    title="Italic"
                    type="button"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue"
                    onClick={() => insertFormatting("> Scriptural citation or quote")}
                    title="Blockquote"
                    type="button"
                  >
                    <Quote size={14} />
                  </button>
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue"
                    onClick={() => insertFormatting("1. Point One\n2. Point Two\n3. Point Three")}
                    title="Numbered List"
                    type="button"
                  >
                    <List size={14} />
                  </button>
                  <button
                    className="p-1 text-slate-600 hover:bg-white rounded hover:text-brand-blue font-semibold text-[11px]"
                    onClick={() => insertFormatting("![Image Caption](https://example.com/image.jpg)")}
                    title="Embed Image"
                    type="button"
                  >
                    <ImageIcon size={14} />
                  </button>
                </div>
              </div>
              <TextField
                fullWidth
                multiline
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write full article body here..."
                required
                rows={10}
                size="small"
                value={body}
              />
            </div>

            {/* 5. SEO & Metadata Config */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider">
                <Globe size={14} /> SEO Meta Tags & Sitemap Keywords
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  label="Meta Title (for Google & Tab)"
                  onChange={(e) => setMetaTitle(e.target.value)}
                  size="small"
                  value={metaTitle}
                />
                <TextField
                  fullWidth
                  helperText="Comma-separated tags for Google indexing & sitemap generation"
                  label="Meta Keywords"
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="holiness, repentance, christian living, pastor paul rika"
                  size="small"
                  value={metaKeywords}
                />
              </div>
              <TextField
                fullWidth
                label="Meta Description"
                multiline
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                size="small"
                value={metaDescription}
              />
            </div>

            {/* 6. Status & Read Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Estimated Read Time"
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                size="small"
                value={readTime}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Publication Status</InputLabel>
                <Select
                  label="Publication Status"
                  onChange={(e) => setPostStatus(e.target.value as "Published" | "Draft")}
                  value={postStatus}
                >
                  <MenuItem value="Published">Published (Live to public)</MenuItem>
                  <MenuItem value="Draft">Draft (Hidden from public)</MenuItem>
                </Select>
              </FormControl>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsEditorOpen(false)} sx={{ textTransform: "none" }}>
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
              {editingPostId ? "Save CMS Changes" : "Publish to Journal"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* COMMENTS MODERATION DIALOG */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setActiveCommentsPost(null)}
        open={Boolean(activeCommentsPost)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Article Comments Moderation · {activeCommentsPost?.title}
        </DialogTitle>
        <DialogContent dividers>
          {(!activeCommentsPost?.comments || activeCommentsPost.comments.length === 0) ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No comments have been submitted on this article yet.
            </p>
          ) : (
            <div className="space-y-4">
              {activeCommentsPost.comments.map((comment) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-2" key={comment.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-ink">{comment.authorName}</span>
                      <span className="text-xs text-slate-400 ml-2">({comment.authorEmail})</span>
                      <div className="text-[11px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</div>
                    </div>
                    <Button
                      color="error"
                      onClick={() => handleDeleteComment(activeCommentsPost.id, comment.id)}
                      size="small"
                      startIcon={<Trash2 size={13} />}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-100">
                    {comment.content}
                  </p>

                  {/* Replies if any */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 space-y-2 border-l-2 border-brand-blue/30 pl-3 pt-1">
                      <div className="text-[11px] font-bold text-brand-blue uppercase">Replies ({comment.replies.length}):</div>
                      {comment.replies.map((reply) => (
                        <div className="rounded bg-white p-2 border border-slate-100 text-xs" key={reply.id}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-ink">{reply.authorName}</span>
                            <Button
                              color="error"
                              onClick={() => handleDeleteComment(activeCommentsPost.id, reply.id)}
                              size="small"
                              sx={{ textTransform: "none", fontSize: "10px", minWidth: 0, p: 0.5 }}
                            >
                              Delete
                            </Button>
                          </div>
                          <p className="text-slate-600 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveCommentsPost(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
