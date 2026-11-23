import { Check, Loader2, RefreshCw, Save, ShieldCheck, Upload } from "lucide-react";
import { Alert, Button, TextField } from "@mui/material";
import { useState } from "react";
import {
  getGalleryContent,
  getHomepageContent,
  resetGalleryContent,
  resetHomepageContent,
  saveGalleryContent,
  saveHomepageContent,
  type HomepageContent,
} from "../../lib/contentStore";
import { fileToDataUrl } from "../../lib/imageUpload";
import HomeCardsEditor from "./HomeCardsEditor";
import AdminAdsManager from "./AdminAdsManager";
import { showToast } from "../../lib/soundToast";
import type { ConferenceImage } from "../../data/mediaAssets";

export default function AdminContentEditor() {
  const [formData, setFormData] = useState<HomepageContent>(getHomepageContent);
  const [galleryCards, setGalleryCards] = useState<ConferenceImage[]>(getGalleryContent);
  const [isUploadingPastor, setIsUploadingPastor] = useState(false);
  const [isUploadingMummy, setIsUploadingMummy] = useState(false);
  const [savedStatus, setSavedStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePastorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPastor(true);
      const url = await fileToDataUrl(file, "horemow_leadership");
      handleLeadershipChange("pastorImage", url);
      setSavedStatus({ type: "success", text: "Pastor Paul Rika's photo uploaded to Cloudinary successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setSavedStatus({ type: "error", text: msg });
    } finally {
      setIsUploadingPastor(false);
    }
  };

  const handleMummyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingMummy(true);
      const url = await fileToDataUrl(file, "horemow_leadership");
      handleLeadershipChange("mummyImage", url);
      setSavedStatus({ type: "success", text: "Evangelist Linda Paul Rika's photo uploaded to Cloudinary successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setSavedStatus({ type: "error", text: msg });
    } finally {
      setIsUploadingMummy(false);
    }
  };

  const handleHeroChange = (field: keyof HomepageContent["hero"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
    setSavedStatus(null);
  };

  const handleWelcomeChange = (field: keyof HomepageContent["welcome"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      welcome: { ...prev.welcome, [field]: value },
    }));
    setSavedStatus(null);
  };

  const handleLeadershipChange = (
    field: keyof HomepageContent["leadership"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      leadership: { ...prev.leadership, [field]: value },
    }));
    setSavedStatus(null);
  };

  const handleGivingChange = (
    field: keyof HomepageContent["givingBanner"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      givingBanner: { ...prev.givingBanner, [field]: value },
    }));
    setSavedStatus(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const invalidStat = formData.stats.some(
      (card) => !card.number.trim() || !card.label.trim() || !card.sub.trim(),
    );
    if (invalidStat) {
      showToast("Complete the value, title, and supporting text for every statistic card before saving.", "error");
      setSavedStatus({
        type: "error",
        text: "Complete the value, title, and supporting text for every statistic card before saving.",
      });
      return;
    }

    const invalidGalleryCard = galleryCards.some(
      (card) => !card.title.trim() || !card.url.trim(),
    );
    if (invalidGalleryCard) {
      showToast("Every 3D gallery card needs a title and image before saving.", "error");
      setSavedStatus({
        type: "error",
        text: "Every 3D gallery card needs a title and image before saving.",
      });
      return;
    }

    saveHomepageContent(formData);
    saveGalleryContent(galleryCards);
    showToast("Homepage content successfully saved and published!", "success");
    setSavedStatus({ type: "success", text: "Homepage content successfully saved and published!" });
    setTimeout(() => setSavedStatus(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all homepage sections to official default content?")) {
      const reset = resetHomepageContent();
      const resetGallery = resetGalleryContent();
      setFormData(reset);
      setGalleryCards(resetGallery);
      setSavedStatus({ type: "success", text: "Homepage restored to official defaults." });
      setTimeout(() => setSavedStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {savedStatus && (
        <Alert
          icon={savedStatus.type === "success" ? <Check size={18} /> : undefined}
          onClose={() => setSavedStatus(null)}
          severity={savedStatus.type}
        >
          {savedStatus.text}
        </Alert>
      )}

      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-ink">Homepage Content Manager</h2>
          <p className="text-xs text-slate-500">
            Edit text, scripture, quotes and media for the public homepage in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            size="small"
            startIcon={<RefreshCw size={14} />}
            variant="outlined"
          >
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            size="small"
            startIcon={<Save size={14} />}
            variant="contained"
          >
            Save All Sections
          </Button>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSave}>
        {/* Hero Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-brand-blue">1. Hero Section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Eyebrow Text"
              onChange={(e) => handleHeroChange("eyebrow", e.target.value)}
              size="small"
              value={formData.hero.eyebrow}
            />
            <TextField
              fullWidth
              label="Headline (First Line)"
              onChange={(e) => handleHeroChange("headlineLine1", e.target.value)}
              size="small"
              value={formData.hero.headlineLine1}
            />
            <TextField
              fullWidth
              label="Headline (Accent / Highlight)"
              onChange={(e) => handleHeroChange("headlineHighlight", e.target.value)}
              size="small"
              value={formData.hero.headlineHighlight}
            />
            <TextField
              fullWidth
              label="Scripture Reference"
              onChange={(e) => handleHeroChange("scripturalRef", e.target.value)}
              size="small"
              value={formData.hero.scripturalRef}
            />
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Hero Subtitle / Description"
                multiline
                onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                rows={2}
                size="small"
                value={formData.hero.subtitle}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Scripture Verse Text"
                multiline
                onChange={(e) => handleHeroChange("scripturalVerse", e.target.value)}
                rows={2}
                size="small"
                value={formData.hero.scripturalVerse}
              />
            </div>
            <TextField
              fullWidth
              label="Primary CTA Text"
              onChange={(e) => handleHeroChange("discoverText", e.target.value)}
              size="small"
              value={formData.hero.discoverText}
            />
            <TextField
              fullWidth
              label="Devotional Link Text"
              onChange={(e) => handleHeroChange("devotionalText", e.target.value)}
              size="small"
              value={formData.hero.devotionalText}
            />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-brand-blue">2. Welcome / Discover Section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Section Eyebrow"
              onChange={(e) => handleWelcomeChange("eyebrow", e.target.value)}
              size="small"
              value={formData.welcome.eyebrow}
            />
            <TextField
              fullWidth
              label="Section Title"
              onChange={(e) => handleWelcomeChange("title", e.target.value)}
              size="small"
              value={formData.welcome.title}
            />
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Section Description"
                multiline
                onChange={(e) => handleWelcomeChange("description", e.target.value)}
                rows={2}
                size="small"
                value={formData.welcome.description}
              />
            </div>
          </div>
        </div>

        {/* Leadership Spotlight Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-brand-blue">
            3. Leadership Spotlight (Pastor Paul Rika & Mummy Linda)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Leadership Eyebrow"
              onChange={(e) => handleLeadershipChange("eyebrow", e.target.value)}
              size="small"
              value={formData.leadership.eyebrow}
            />
            <TextField
              fullWidth
              label="Pastor Name"
              onChange={(e) => handleLeadershipChange("pastorName", e.target.value)}
              size="small"
              value={formData.leadership.pastorName}
            />
            <TextField
              fullWidth
              label="Pastor Role / Title"
              onChange={(e) => handleLeadershipChange("pastorRole", e.target.value)}
              size="small"
              value={formData.leadership.pastorRole}
            />

            {/* Pastor Paul Rika Image Upload */}
            <div className="sm:col-span-2 rounded-lg border border-dashed border-slate-300 p-3.5 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-1.5 block">
                Pastor Paul Rika Portrait Photograph
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Pastor Image Cloudinary URL"
                    onChange={(e) => handleLeadershipChange("pastorImage", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={formData.leadership.pastorImage}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm ${isUploadingPastor ? "opacity-60 cursor-not-allowed" : ""}`}>
                    {isUploadingPastor ? (
                      <Loader2 size={14} className="animate-spin text-brand-blue" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{isUploadingPastor ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingPastor}
                      onChange={handlePastorImageUpload}
                      type="file"
                    />
                  </label>
                  {formData.leadership.pastorImage && (
                    <img
                      alt="Pastor Paul Rika"
                      className="size-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      src={formData.leadership.pastorImage}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Pastor Pull Quote"
                multiline
                onChange={(e) => handleLeadershipChange("pastorQuote", e.target.value)}
                rows={2}
                size="small"
                value={formData.leadership.pastorQuote}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Pastor Biography Summary"
                multiline
                onChange={(e) => handleLeadershipChange("pastorBio", e.target.value)}
                rows={3}
                size="small"
                value={formData.leadership.pastorBio}
              />
            </div>

            {/* Mummy Linda Paul Rika fields */}
            <TextField
              fullWidth
              label="Women Coordinator Name"
              onChange={(e) => handleLeadershipChange("mummyName", e.target.value)}
              size="small"
              value={formData.leadership.mummyName}
            />
            <TextField
              fullWidth
              label="Women Coordinator Role"
              onChange={(e) => handleLeadershipChange("mummyRole", e.target.value)}
              size="small"
              value={formData.leadership.mummyRole}
            />
            {/* Mummy Linda Paul Rika Image Upload */}
            <div className="sm:col-span-2 rounded-lg border border-dashed border-slate-300 p-3.5 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-1.5 block">
                Evangelist Linda Paul Rika Portrait Photograph
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Mummy Linda Image Cloudinary URL"
                    onChange={(e) => handleLeadershipChange("mummyImage", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={formData.leadership.mummyImage}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm ${isUploadingMummy ? "opacity-60 cursor-not-allowed" : ""}`}>
                    {isUploadingMummy ? (
                      <Loader2 size={14} className="animate-spin text-brand-blue" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{isUploadingMummy ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingMummy}
                      onChange={handleMummyImageUpload}
                      type="file"
                    />
                  </label>
                  {formData.leadership.mummyImage && (
                    <img
                      alt="Evangelist Linda Paul Rika"
                      className="size-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      src={formData.leadership.mummyImage}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Mummy Linda Bio / Profile"
                multiline
                onChange={(e) => handleLeadershipChange("mummyBio", e.target.value)}
                rows={2}
                size="small"
                value={formData.leadership.mummyBio}
              />
            </div>
          </div>
        </div>

        {/* Giving Banner Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-brand-blue">4. Giving / Stewardship Banner</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Giving Eyebrow"
              onChange={(e) => handleGivingChange("eyebrow", e.target.value)}
              size="small"
              value={formData.givingBanner.eyebrow}
            />
            <TextField
              fullWidth
              label="Giving Headline"
              onChange={(e) => handleGivingChange("title", e.target.value)}
              size="small"
              value={formData.givingBanner.title}
            />
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Giving Description"
                multiline
                onChange={(e) => handleGivingChange("description", e.target.value)}
                rows={2}
                size="small"
                value={formData.givingBanner.description}
              />
            </div>
            <TextField
              fullWidth
              label="Button Text"
              onChange={(e) => handleGivingChange("actionText", e.target.value)}
              size="small"
              value={formData.givingBanner.actionText}
            />
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-brand-blue">5. Homepage Cards</h3>
            <p className="mt-1 text-xs text-slate-500">
              Manage the impact statistics and the images and captions used by the 3D gallery.
            </p>
          </div>
          <HomeCardsEditor
            gallery={formData.gallery}
            galleryCards={galleryCards}
            onGalleryChange={(gallery) => {
              setFormData((previous) => ({ ...previous, gallery }));
              setSavedStatus(null);
            }}
            onGalleryCardsChange={(cards) => {
              setGalleryCards(cards);
              setSavedStatus(null);
            }}
            onStatsChange={(stats) => {
              setFormData((previous) => ({ ...previous, stats }));
              setSavedStatus(null);
            }}
            stats={formData.stats}
          />
        </section>

        {/* 6. Promotional Ads & Announcements Management */}
        <section>
          <AdminAdsManager />
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="text-brand-green" size={16} /> All updates are sanitized and stored safely.
          </span>
          <Button
            size="medium"
            startIcon={<Save size={16} />}
            type="submit"
            variant="contained"
          >
            Save and Apply to Homepage
          </Button>
        </div>
      </form>
    </div>
  );
}
