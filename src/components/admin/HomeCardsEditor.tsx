import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";
import { Alert, Button } from "@mui/material";
import type { ConferenceImage } from "../../data/mediaAssets";
import type { HomepageContent, HomepageStatCard } from "../../lib/contentStore";
import { fileToDataUrl } from "../../lib/imageUpload";

type HomeCardsEditorProps = {
  gallery: HomepageContent["gallery"];
  galleryCards: ConferenceImage[];
  onGalleryChange: (gallery: HomepageContent["gallery"]) => void;
  onGalleryCardsChange: (cards: ConferenceImage[]) => void;
  onStatsChange: (cards: HomepageStatCard[]) => void;
  stats: HomepageStatCard[];
};

const categories: ConferenceImage["category"][] = [
  "Conferences",
  "Crusades",
  "Worship",
  "Ministers",
];

const fieldClassName =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10";

function CardTextField({
  label,
  multiline = false,
  onChange,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block min-w-0 text-[10px] font-semibold text-slate-600">
      {label}
      {multiline ? (
        <textarea
          className={`${fieldClassName} min-h-16 resize-y`}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          value={value}
        />
      ) : (
        <input
          className={fieldClassName}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  );
}

function CardSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block min-w-0 text-[10px] font-semibold text-slate-600">
      {label}
      <select
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HomeCardsEditor({
  gallery,
  galleryCards,
  onGalleryChange,
  onGalleryCardsChange,
  onStatsChange,
  stats,
}: HomeCardsEditorProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateStat = (id: string, updates: Partial<HomepageStatCard>) => {
    onStatsChange(stats.map((card) => (card.id === id ? { ...card, ...updates } : card)));
  };

  const updateGalleryCard = (id: string, updates: Partial<ConferenceImage>) => {
    onGalleryCardsChange(
      galleryCards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    );
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (image: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      onChange(await fileToDataUrl(file));
      setUploadError(null);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Unable to load the selected image.");
    } finally {
      event.target.value = "";
    }
  };

  const moveCard = <T extends { id: string }>(
    cards: T[],
    index: number,
    direction: -1 | 1,
    onChange: (next: T[]) => void,
  ) => {
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const reordered = [...cards];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  const addStat = () => {
    onStatsChange([
      ...stats,
      {
        id: `impact-${Date.now()}`,
        number: "New metric",
        label: "New impact area",
        sub: "Add supporting detail.",
        icon: "globe",
        image: "",
      },
    ]);
  };

  const addGalleryCard = () => {
    onGalleryCardsChange([
      ...galleryCards,
      {
        id: `home-gallery-${Date.now()}`,
        url: "",
        title: "",
        category: "Conferences",
        description: "",
      },
    ]);
  };

  return (
    <div className="space-y-8">
      {uploadError && (
        <Alert onClose={() => setUploadError(null)} severity="error">
          {uploadError}
        </Alert>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">
              Homepage cards
            </p>
            <h3 className="mt-1 text-base font-bold text-brand-blue">Ministry impact statistics</h3>
            <p className="mt-1 text-xs text-slate-500">
              Edit the values and descriptions, choose an icon, or upload an image for each card.
            </p>
          </div>
          <Button onClick={addStat} size="small" startIcon={<Plus size={14} />} variant="outlined">
            Add statistic
          </Button>
        </div>

        <div className="space-y-4">
          {stats.map((card, index) => (
            <article
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              data-testid="homepage-stat-editor-card"
              key={card.id}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold text-slate-700">Statistic {index + 1}</h4>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Move statistic ${index + 1} up`}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 enabled:hover:text-brand-blue disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveCard(stats, index, -1, onStatsChange)}
                    type="button"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    aria-label={`Move statistic ${index + 1} down`}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 enabled:hover:text-brand-blue disabled:opacity-40"
                    disabled={index === stats.length - 1}
                    onClick={() => moveCard(stats, index, 1, onStatsChange)}
                    type="button"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    aria-label={`Remove statistic ${index + 1}`}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
                    onClick={() => onStatsChange(stats.filter((item) => item.id !== card.id))}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <CardTextField
                  label="Statistic value"
                  onChange={(number) => updateStat(card.id, { number })}
                  value={card.number}
                />
                <CardTextField
                  label="Card title"
                  onChange={(label) => updateStat(card.id, { label })}
                  value={card.label}
                />
                <CardTextField
                  label="Supporting text"
                  onChange={(sub) => updateStat(card.id, { sub })}
                  value={card.sub}
                />
                <CardSelect
                  label="Fallback icon"
                  onChange={(icon) =>
                    updateStat(card.id, {
                      icon: icon as HomepageStatCard["icon"],
                    })
                  }
                  options={[
                    { label: "Globe", value: "globe" },
                    { label: "Calendar", value: "calendar" },
                    { label: "Shield", value: "shield" },
                    { label: "Book", value: "book" },
                  ]}
                  value={card.icon}
                />
                <div className="flex items-center gap-3 sm:col-span-2 xl:col-span-4">
                  {card.image ? (
                    <img
                      alt={`Preview for ${card.label || `statistic ${index + 1}`}`}
                      className="size-14 rounded-lg border border-slate-200 object-cover"
                      src={card.image}
                    />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                      <ImagePlus size={18} />
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button component="label" size="small" startIcon={<ImagePlus size={14} />} variant="outlined">
                      Upload image
                      <input
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) =>
                          handleImageUpload(event, (image) => updateStat(card.id, { image }))
                        }
                        type="file"
                      />
                    </Button>
                    {card.image && (
                      <Button
                        color="inherit"
                        onClick={() => updateStat(card.id, { image: "" })}
                        size="small"
                        type="button"
                      >
                        Use icon instead
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {stats.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              No statistic cards yet. Add a card to show ministry impact on the homepage.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">
            Homepage cards
          </p>
          <h3 className="mt-1 text-base font-bold text-brand-blue">3D photo gallery</h3>
          <p className="mt-1 text-xs text-slate-500">
            Manage the homepage carousel and shared gallery archive. Changes appear in both places.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CardTextField
              label="Section eyebrow"
              onChange={(eyebrow) => onGalleryChange({ ...gallery, eyebrow })}
              value={gallery.eyebrow}
            />
            <CardTextField
              label="Section title"
              onChange={(title) => onGalleryChange({ ...gallery, title })}
              value={gallery.title}
            />
            <div className="sm:col-span-2">
              <CardTextField
                label="Section description"
                multiline
                onChange={(description) =>
                  onGalleryChange({ ...gallery, description })
                }
                value={gallery.description}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-600">
            {galleryCards.length} gallery {galleryCards.length === 1 ? "card" : "cards"}
          </p>
          <Button
            onClick={addGalleryCard}
            size="small"
            startIcon={<Plus size={14} />}
            variant="outlined"
          >
            Add gallery card
          </Button>
        </div>

        <div className="space-y-4">
          {galleryCards.map((card, index) => (
            <article
              className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[170px_minmax(0,1fr)]"
              data-testid="homepage-gallery-editor-card"
              key={card.id}
            >
              <div className="space-y-2">
                <div className="aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {card.url ? (
                    <img
                      alt={`Preview: ${card.title || `gallery card ${index + 1}`}`}
                      className="size-full object-cover"
                      src={card.url}
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-slate-400">
                      <ImagePlus size={24} />
                    </div>
                  )}
                </div>
                <Button component="label" fullWidth size="small" startIcon={<ImagePlus size={14} />} variant="outlined">
                  Upload image
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      handleImageUpload(event, (url) => updateGalleryCard(card.id, { url }))
                    }
                    type="file"
                  />
                </Button>
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-700">Gallery card {index + 1}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label={`Move gallery card ${index + 1} up`}
                      className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 enabled:hover:text-brand-blue disabled:opacity-40"
                      disabled={index === 0}
                      onClick={() => moveCard(galleryCards, index, -1, onGalleryCardsChange)}
                      type="button"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      aria-label={`Move gallery card ${index + 1} down`}
                      className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 enabled:hover:text-brand-blue disabled:opacity-40"
                      disabled={index === galleryCards.length - 1}
                      onClick={() => moveCard(galleryCards, index, 1, onGalleryCardsChange)}
                      type="button"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      aria-label={`Remove gallery card ${index + 1}`}
                      className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
                      onClick={() =>
                        onGalleryCardsChange(galleryCards.filter((item) => item.id !== card.id))
                      }
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CardTextField
                    label="Card title"
                    onChange={(title) => updateGalleryCard(card.id, { title })}
                    value={card.title}
                  />
                  <CardSelect
                    label="Category"
                    onChange={(category) =>
                      updateGalleryCard(card.id, {
                        category: category as ConferenceImage["category"],
                      })
                    }
                    options={categories.map((category) => ({
                      label: category,
                      value: category,
                    }))}
                    value={card.category}
                  />
                  <div className="sm:col-span-2">
                    <CardTextField
                      label="Image URL"
                      onChange={(url) => updateGalleryCard(card.id, { url })}
                      value={card.url}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <CardTextField
                      label="Card description"
                      multiline
                      onChange={(description) =>
                        updateGalleryCard(card.id, { description })
                      }
                      value={card.description}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
          {galleryCards.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              The 3D gallery is empty. Add a card and provide an image before saving.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
