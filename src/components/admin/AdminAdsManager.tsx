import { useState, useRef } from "react";
import {
  Edit2,
  Megaphone,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  saveAdsContent,
  useAdsContent,
  type AdItem,
} from "../../lib/contentStore";
import { fileToDataUrl } from "../../lib/imageUpload";
import { showToast } from "../../lib/soundToast";

export default function AdminAdsManager() {
  const ads = useAdsContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("Special Announcement");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("/events");
  const [ctaText, setCtaText] = useState("Learn More");
  const [placement, setPlacement] = useState<"modal" | "top_banner" | "both">("both");
  const [isActive, setIsActive] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await fileToDataUrl(file, "horemow_ads");
      setImageUrl(url);
      showToast("Ad flyer / banner image uploaded successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload ad image";
      showToast(msg, "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setTitle("");
    setBadge("Special Announcement");
    setDescription("");
    setImageUrl("");
    setTargetUrl("/events");
    setCtaText("Learn More");
    setPlacement("both");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: AdItem) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setBadge(ad.badge || "Special Announcement");
    setDescription(ad.description);
    setImageUrl(ad.imageUrl || "");
    setTargetUrl(ad.targetUrl);
    setCtaText(ad.ctaText);
    setPlacement(ad.placement);
    setIsActive(ad.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Please provide an Ad headline and description.", "error");
      return;
    }

    try {
      let updated: AdItem[];
      if (editingAd) {
        updated = ads.map((a) =>
          a.id === editingAd.id
            ? {
                ...a,
                title: title.trim(),
                badge: badge.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim() || undefined,
                targetUrl: targetUrl.trim() || "/",
                ctaText: ctaText.trim() || "Learn More",
                placement,
                isActive,
              }
            : a
        );
        showToast(`Ad "${title}" updated successfully!`, "success");
      } else {
        const newAd: AdItem = {
          id: `ad-${Date.now()}`,
          title: title.trim(),
          badge: badge.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          targetUrl: targetUrl.trim() || "/",
          ctaText: ctaText.trim() || "Learn More",
          placement,
          isActive,
          createdAt: new Date().toISOString(),
        };
        updated = [newAd, ...ads];
        showToast(`New Ad "${title}" published successfully!`, "success");
      }

      saveAdsContent(updated);
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save ad.";
      showToast(msg, "error");
    }
  };

  const handleDelete = (id: string, adTitle: string) => {
    if (confirm(`Are you sure you want to delete the ad "${adTitle}"?`)) {
      const updated = ads.filter((a) => a.id !== id);
      saveAdsContent(updated);
      showToast(`Deleted ad "${adTitle}".`, "success");
    }
  };

  const handleToggleActive = (id: string) => {
    const target = ads.find((a) => a.id === id);
    const updated = ads.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    saveAdsContent(updated);
    if (target) {
      showToast(
        `Ad "${target.title}" is now ${!target.isActive ? "active and visible" : "disabled"}.`,
        "info"
      );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <Megaphone size={16} />
            </span>
            <h3 className="text-base font-bold text-brand-blue">
              6. Promotional Ads & Announcement Banners
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Create, update, toggle and delete public site banners, pop-up announcements, crusade promotions, and book campaigns.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          size="small"
          startIcon={<Plus size={15} />}
          sx={{
            backgroundColor: "#1A4B8C",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "8px",
            alignSelf: "flex-start",
          }}
          variant="contained"
        >
          Create New Ad
        </Button>
      </div>

      {/* Ads List */}
      <div className="space-y-3">
        {ads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
            <Megaphone className="mx-auto text-slate-400" size={30} />
            <p className="mt-2 text-xs font-bold text-slate-700">No promotional ads yet</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Click "Create New Ad" above to launch an announcement banner or modal.
            </p>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition ${
                ad.isActive ? "border-slate-200 bg-white shadow-xs" : "border-slate-200 bg-slate-50 opacity-70"
              }`}
              key={ad.id}
            >
              <div className="flex items-start gap-3.5">
                {ad.imageUrl ? (
                  <img
                    alt={ad.title}
                    className="size-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    src={ad.imageUrl}
                  />
                ) : (
                  <div className="size-16 rounded-lg bg-amber-100 text-amber-800 grid place-items-center font-bold text-xs shrink-0">
                    <Megaphone size={20} />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {ad.badge && (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        {ad.badge}
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Placement: {ad.placement === "both" ? "Top Banner + Modal" : ad.placement === "top_banner" ? "Top Banner" : "Pop-up Modal"}
                    </span>
                    <button
                      className={`text-[10px] font-bold cursor-pointer ${
                        ad.isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                      onClick={() => handleToggleActive(ad.id)}
                      type="button"
                    >
                      ● {ad.isActive ? "Active (Live)" : "Disabled"}
                    </button>
                  </div>

                  <h4 className="font-bold text-ink text-sm">{ad.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{ad.description}</p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-blue font-semibold">
                    <span>Target: {ad.targetUrl}</span>
                    <span>·</span>
                    <span>Button: "{ad.ctaText}"</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  onClick={() => openEditModal(ad)}
                  size="small"
                  startIcon={<Edit2 size={13} />}
                  sx={{ textTransform: "none", fontSize: "11px", fontWeight: 600 }}
                  variant="outlined"
                >
                  Edit
                </Button>
                <Button
                  color="error"
                  onClick={() => handleDelete(ad.id, ad.title)}
                  size="small"
                  startIcon={<Trash2 size={13} />}
                  sx={{ textTransform: "none", fontSize: "11px", fontWeight: 600 }}
                  variant="text"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT AD MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingAd ? `Edit Ad: ${editingAd.title}` : "Create New Promotional Ad / Announcement"}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Ad Headline / Title *"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. International Holiness Conference 2026"
                required
                size="small"
                value={title}
              />
              <TextField
                fullWidth
                label="Badge / Tag (Optional)"
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Special Announcement, Upcoming Crusade, Free Gift"
                size="small"
                value={badge}
              />
            </div>

            <TextField
              fullWidth
              label="Ad Message / Description *"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview of the announcement or campaign..."
              required
              rows={3}
              size="small"
              value={description}
            />

            {/* Dedicated File Select & Upload for Ad Banner/Flyer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-bold text-ink mb-1 block">
                Ad Flyer or Banner Photograph (File Select & Upload)
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Select an image flyer or promotional banner (PNG, JPG, WEBP).
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative size-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden grid place-items-center shadow-inner">
                  {imageUrl ? (
                    <img
                      alt="Ad flyer preview"
                      className="size-full object-cover"
                      src={imageUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon size={24} />
                      <span className="text-[9px] mt-1 font-semibold">No Image</span>
                    </div>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 grid place-items-center text-white">
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingImage}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    type="file"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      size="small"
                      startIcon={isUploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      variant="outlined"
                    >
                      {isUploadingImage
                        ? "Uploading Flyer..."
                        : imageUrl
                        ? "Change Image File"
                        : "Select Image File"}
                    </Button>
                    {imageUrl && (
                      <Button
                        color="error"
                        disabled={isUploadingImage}
                        onClick={() => setImageUrl("")}
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
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={imageUrl}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                helperText="Link when user clicks (e.g. /events, /give, /bookstore, or external URL)"
                label="Target Destination URL"
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/events"
                size="small"
                value={targetUrl}
              />
              <TextField
                fullWidth
                helperText="Text on the call-to-action button"
                label="Button CTA Text"
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Register Free / Read More"
                size="small"
                value={ctaText}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 items-center">
              <TextField
                fullWidth
                label="Display Placement"
                onChange={(e) => setPlacement(e.target.value as any)}
                select
                size="small"
                value={placement}
              >
                <MenuItem value="both">Both Top Banner & Pop-up Modal</MenuItem>
                <MenuItem value="top_banner">Top Announcement Banner Only</MenuItem>
                <MenuItem value="modal">Pop-up Announcement Modal Only</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    color="primary"
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label={
                  <span className="text-xs font-bold text-slate-700">
                    Publish Ad Immediately (Active)
                  </span>
                }
              />
            </div>
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
              {editingAd ? "Save Ad Changes" : "Publish Ad"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
