import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useGalleryContent, useHomepageContent } from "../../lib/contentStore";
import type { ConferenceImage } from "../../data/mediaAssets";
import Eyebrow from "../common/Eyebrow";

const categories = ["All", "Conferences", "Crusades", "Worship", "Ministers"] as const;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Gallery3DSection() {
  const images = useGalleryContent();
  const homepageContent = useHomepageContent();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ConferenceImage | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const autoPlayRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(window.scrollY);
  const scrollRemainder = useRef(0);

  const filteredImages = images.filter(
    (img) => activeCategory === "All" || img.category === activeCategory,
  );

  const total = filteredImages.length;

  useEffect(() => {
    if (currentIndex >= total) setCurrentIndex(0);
    if (selectedImage && !images.some((image) => image.id === selectedImage.id)) {
      setSelectedImage(null);
    }
  }, [currentIndex, images, selectedImage, total]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
  }, [total]);

  // Smooth auto-play rotation
  useEffect(() => {
    if (
      !isPlaying ||
      !isInView ||
      total === 0 ||
      prefersReducedMotion()
    ) {
      return;
    }
    autoPlayRef.current = window.setInterval(() => {
      nextSlide();
    }, 3800);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isInView, isPlaying, nextSlide, total]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      const section = sectionRef.current;
      if (!isPlaying || prefersReducedMotion() || total < 2 || !section || delta === 0) return;

      const bounds = section.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        scrollRemainder.current = 0;
        return;
      }

      scrollRemainder.current += delta;
      const stepSize = 180;
      if (Math.abs(scrollRemainder.current) < stepSize) return;

      const direction = Math.sign(scrollRemainder.current);
      const steps = Math.floor(Math.abs(scrollRemainder.current) / stepSize);
      setCurrentIndex((index) => ((index + direction * steps) % total + total) % total);
      scrollRemainder.current -= direction * steps * stepSize;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPlaying, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch and drag swipe handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartX === null) return;
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX - clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setDragStartX(null);
  };

  return (
    <section
      aria-label="3D Conference Photo Gallery"
      className="relative overflow-hidden bg-gradient-to-b from-[#0c1c2b] via-[#10253a] to-[#0a1622] py-20 text-white sm:py-28"
      data-scroll-reveal
      data-testid="home-gallery-3d"
      ref={sectionRef}
    >
      {/* 3D Ambient Stage Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-brand-blue/25 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[600px] rounded-full bg-brand-green/15 blur-[120px]"
      />

      <div className="relative mx-auto w-[min(1240px,calc(100%-2.25rem))]">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>
              <span className="flex items-center gap-1.5 text-[#e5be64]">
                <Sparkles size={14} /> {homepageContent.gallery.eyebrow}
              </span>
            </Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {homepageContent.gallery.title}
            </h2>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-300 sm:text-sm">
              {homepageContent.gallery.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-[#e5be64]/40 bg-white/5 px-4 py-2 text-xs font-bold text-[#e5be64] transition hover:bg-[#e5be64] hover:text-[#112437]"
              to="/gallery"
            >
              Browse all {images.length} photographs <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills & Controls */}
        <div
          aria-label="Filter gallery"
          className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                aria-pressed={activeCategory === cat}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition duration-300 ${
                  activeCategory === cat
                    ? "bg-[#e5be64] text-[#112437] shadow-lg shadow-[#e5be64]/25"
                    : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white"
                }`}
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentIndex(0);
                }}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label={isPlaying ? "Pause 3D rotation" : "Play 3D rotation"}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
              onClick={() => setIsPlaying((p) => !p)}
              type="button"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className="hidden sm:inline">{isPlaying ? "Pause Motion" : "Resume 3D"}</span>
            </button>
            <button
              aria-label="Reset rotation"
              className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:bg-white/15"
              onClick={() => setCurrentIndex(0)}
              title="Reset view"
              type="button"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* 3D Perspective Stage with Depth and Carousel */}
        <div
          className="relative mx-auto mt-12 flex h-[460px] cursor-grab items-center justify-center overflow-visible active:cursor-grabbing sm:h-[520px]"
          onMouseDown={handleTouchStart}
          onMouseLeave={() => {
            setDragStartX(null);
          }}
          onMouseUp={handleTouchEnd}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          style={{ perspective: "1400px" }}
        >
          {filteredImages.map((image, index) => {
            let offset = index - currentIndex;
            const half = Math.floor(total / 2);
            if (offset > half) offset -= total;
            if (offset < -half) offset += total;

            const isCurrent = offset === 0;
            const isVisible = Math.abs(offset) <= 2; // Render 5 visible 3D planes

            if (!isVisible) return null;

            // 3D Transformation Math
            const rotateY = offset * 32; // angle in degrees
            const translateX = offset * 255; // horizontal spacing in pixels
            const translateZ = -Math.abs(offset) * 190; // perspective depth in pixels
            const scale = isCurrent ? 1.05 : Math.max(0.72, 1 - Math.abs(offset) * 0.16);
            const opacity = isCurrent ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.35);
            const zIndex = 30 - Math.abs(offset) * 6;

            return (
              <div
                aria-hidden={!isCurrent}
                className="absolute w-[290px] select-none transition-all duration-700 ease-out sm:w-[390px]"
                key={image.id}
                onClick={() => {
                  if (isCurrent) {
                    setSelectedImage(image);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: "preserve-3d",
                  zIndex,
                  opacity,
                }}
              >
                <div
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? "border-[#e5be64] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(229,190,100,0.4)]"
                      : "border-white/20 shadow-xl opacity-90"
                  } bg-[#14293e]`}
                >
                  {/* Photo with responsive ratio */}
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
                    <img
                      alt={image.title}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      src={image.url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e2133] via-transparent to-black/30" />

                    <span className="absolute left-3 top-3 rounded-md bg-[#0e2133]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e5be64] backdrop-blur-md">
                      {image.category}
                    </span>

                    {isCurrent && (
                      <button
                        aria-label={`Inspect ${image.title}`}
                        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white hover:text-brand-blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(image);
                        }}
                        type="button"
                      >
                        <Maximize2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Caption & Metadata */}
                  <div className="p-4 sm:p-5">
                    <h3 className="line-clamp-1 text-base font-bold text-white sm:text-lg">
                      {image.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
                      {image.description}
                    </p>
                  </div>
                </div>

                {/* Simulated 3D Reflection Floor */}
                {isCurrent && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none mt-2 h-10 w-full rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-30 blur-sm"
                  />
                )}
              </div>
            );
          })}
          {total === 0 && (
            <div className="absolute inset-x-4 flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[.03] text-center text-sm text-slate-300 sm:inset-x-20">
              No photographs are available in this gallery category yet.
            </div>
          )}
        </div>

        {/* Carousel Controls, Progress & Slide Count */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous photograph"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-[#e5be64] hover:text-[#112437] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={total < 2}
              onClick={prevSlide}
              type="button"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              aria-label="Next photograph"
              className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-[#e5be64] hover:text-[#112437] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={total < 2}
              onClick={nextSlide}
              type="button"
            >
              <ArrowRight size={18} />
            </button>
            <span className="ml-3 text-xs font-semibold text-slate-300">
              {total === 0 ? 0 : currentIndex + 1} <span className="text-slate-500">/</span> {total}
            </span>
          </div>

          {/* Dots Indicator */}
          <div
            aria-label="Slide indicators"
            className="flex max-w-md flex-wrap items-center justify-center gap-1.5"
          >
            {filteredImages.slice(0, 16).map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? "w-6 bg-[#e5be64]" : "w-2 bg-white/25 hover:bg-white/45"
                }`}
                key={i}
                onClick={() => setCurrentIndex(i)}
                type="button"
              />
            ))}
          </div>

          <Link
            className="rounded-xl bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e5be64] hover:text-[#112437]"
            to="/gallery"
          >
            Explore Complete Archive ({images.length})
          </Link>
        </div>
      </div>

      {/* Lightbox High-Resolution Dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setSelectedImage(null)}
        open={Boolean(selectedImage)}
      >
        {selectedImage && (
          <div className="bg-[#0e2133] text-white">
            <DialogTitle className="flex items-center justify-between border-b border-white/10 font-bold text-white">
              <span>{selectedImage.title}</span>
              <span className="rounded bg-[#e5be64] px-2.5 py-0.5 text-xs font-bold text-[#112437]">
                {selectedImage.category}
              </span>
            </DialogTitle>
            <DialogContent className="p-4 sm:p-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                <img
                  alt={selectedImage.title}
                  className="size-full object-contain"
                  src={selectedImage.url}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selectedImage.description}</p>
            </DialogContent>
          </div>
        )}
      </Dialog>
    </section>
  );
}
