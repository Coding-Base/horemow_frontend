import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  Moon,
  Sun,
  X,
  ExternalLink,
  FileText,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Dialog } from "@mui/material";
import type { Publication } from "../../data/content";
import PdfPageViewer from "./PdfPageViewer";

interface BookReaderModalProps {
  book: Publication | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BookChapter {
  title: string;
  pages: string[];
}

const SAMPLE_BOOK_CONTENTS: Record<string, BookChapter[]> = {
  "Escape From Hell": [
    {
      title: "Introduction: The Solemn Call",
      pages: [
        `HELL IS NOT A MYTH OR A METAPHOR. It is an eternal reality that should awaken every living soul. The Word of God in Luke 16:19-31 presents to us an unvarnished window into the destiny of men who live for the pleasures of this fleeting world while neglecting the salvation of their souls.\n\n"And in hell he lift up his eyes, being in torments, and seeth Abraham afar off, and Lazarus in his bosom." (Luke 16:23).\n\nThis book is written not to entertain the intellect, but to snatch souls from the unquenchable fire of perdition. As you read these pages with prayer and sober reflection, may the Spirit of the Living God open your eyes to what lies beyond the grave.`,
        `THE DECEPTION OF MODERN THEOLOGY has lulled millions into a spiritual coma. Men are told that God is too merciful to permit any man to enter eternal torment, forgetting that the same God who is rich in mercy is also a consuming fire (Hebrews 12:29).\n\nRighteousness and peace kiss each other only at the cross of absolute surrender and repentance. If your life is marked by secret compromise, hidden immorality, restitution left undone, or unconfessed transgression, you stand upon a precipice of unimaginable danger.`,
      ],
    },
    {
      title: "Chapter 1: The Reality of Eternity",
      pages: [
        `TIME IS BUT A DROPLET in the vast, boundless ocean of eternity. When a man closes his eyes in physical death, his eternal journey does not cease; it merely begins in its true dimension.\n\nThere are only two eternal destinations: Heaven in the glorious presence of the King of Kings, or Hell in outer darkness where the worm dieth not and the fire is not quenched (Mark 9:48).\n\nConsider this solemn truth: every choice you make today, every thought you entertain, every penny you earn honestly or deceitfully, is a seed planted toward your eternal dwelling place.`,
        `WHAT PROFIT SHALL A MAN HAVE if he gains the whole world and loses his soul? (Matthew 16:26).\n\nEarthly riches, university degrees, ecclesiastical titles, and societal praise will vanish in an instant before the Great White Throne. Only a clean heart, purified in the precious blood of the Lamb and walking in daily holiness without which no man shall see the Lord (Hebrews 12:14), will stand firm in that dreadful day.`,
      ],
    },
    {
      title: "Chapter 2: The Sinner's Only Hope",
      pages: [
        `THE DOOR OF MERCY STILL STANDS OPEN TODAY. If you hear His voice, harden not your heart as in the day of provocation (Hebrews 3:15).\n\nTrue repentance requires more than emotional tears; it demands a radical turning away from every known sin, a renunciation of the world, and a willingness to make right with men what was made wrong through deceit or theft. This is the biblical doctrine of restitution.`,
        `COME UNTO CHRIST WITH A BROKEN AND CONTRITE HEART. He that covereth his sins shall not prosper: but whoso confesseth and forsaketh them shall have mercy (Proverbs 28:13).\n\nBow your head right now wherever you are reading this book, call upon the name of Jesus Christ, and ask Him to wash you clean and write your name in the Lamb's Book of Life.`,
      ],
    },
  ],
  "Marriage, Divorce and Remarriage": [
    {
      title: "Chapter 1: The Divine Institution of Marriage",
      pages: [
        `FROM THE VERY DAWN OF CREATION, Almighty God established marriage as a sacred, lifelong covenant between one man and one woman. In Matthew 19:4-6, the Lord Jesus settled all controversy for all generations:\n\n"Have ye not read, that he which made them at the beginning made them male and female... Wherefore they are no more twain, but one flesh. What therefore God hath joined together, let not man put asunder."\n\nMarriage is not a social contract that can be dissolved at the whim of human courts; it is a spiritual bond forged before the throne of Heaven.`,
        `THE COMPROMISE OF THE MODERN CHURCH on the issue of divorce and remarriage has opened the floodgates of adultery and broken homes. Many Christians today believe that irreconcilable differences or incompatibility justify divorce and subsequent remarriage.\n\nYet scripture speaks with unwavering clarity in Romans 7:2-3: "For the woman which hath an husband is bound by the law to her husband so long as he liveth; but if the husband be dead, she is loosed from the law of her husband."`,
      ],
    },
    {
      title: "Chapter 2: Restoring Purity to the Home",
      pages: [
        `HOLINESS IN THE HOME is the bedrock of spiritual revival in the church and the nation. When husbands love their wives as Christ loved the church, laying down their lives in selfless servant-leadership, and when wives submit to their own husbands in reverence as unto the Lord (Ephesians 5:22-25), the presence of God transforms the dwelling.\n\nLet no bitterness, corrupt communication, or ungodly influence find an entrance into your marital sanctuary.`,
        `PRAYER AND FASTING IN THE FAMILY must replace arguments and contention. A family altar where the Word of God is expounded, hymns of holiness are sung, and intercession is made daily creates an impregnable fortress against the fiery darts of the wicked one.\n\nCommit your home anew to the undiluted standard of God's holy Word.`,
      ],
    },
  ],
};

function generateGenericChapters(book: Publication): BookChapter[] {
  return [
    {
      title: "Introduction & Spiritual Purpose",
      pages: [
        `WELCOME TO THIS PUBLICATION: "${book.title.toUpperCase()}".\n\nWritten and published under the guidance of the Holy Spirit through the ministry of Holiness Revival Movement Worldwide (HOREMOW).\n\n"Sanctify them through thy truth: thy word is truth." (John 17:17).\n\n${book.description}\n\nOur prayer is that the truths revealed in these pages will purify your heart, establish your feet upon the solid rock of Christ Jesus, and prepare your soul for the glorious rapture of the saints.`,
        `THE SPIRITUAL BATTLE OF THIS END TIME is fought primarily in the arena of truth. The enemy has flooded the earth with deceptive literature and humanistic philosophies that diminish the holiness of God.\n\nAs you read this work, allow the Holy Spirit to search the deep recesses of your soul. Do not skim through these words as mere academic literature, but read with an open heart ready for conviction, correction, and divine transformation.`,
      ],
    },
    {
      title: "Chapter 1: Foundational Truths",
      pages: [
        `BIBLICAL FOUNDATIONS CAN NEVER BE SHAKEN. "Nevertheless the foundation of God standeth sure, having this seal, The Lord knoweth them that are his. And, Let every one that nameth the name of Christ depart from iniquity." (2 Timothy 2:19).\n\nWhether this treatise concerns spiritual warfare, biblical restitution, personal sanctification, or pastoral oversight, the foundational principle remains unchanging: without holiness, no man shall see the Lord.\n\nExamine your personal life in the light of the scriptures cited herein.`,
        `THE POWER OF UNCOMPROMISING FAITH enables the believer to overcome every worldly enticement. God has called us not unto uncleanness, but unto holiness (1 Thessalonians 4:7).\n\nLet the testimonies and biblical precepts recorded in this volume challenge your walk and ignite a fresh passion for prayer, evangelism, and heavenly readiness.`,
      ],
    },
    {
      title: "Chapter 2: Walking in Full Obedience",
      pages: [
        `OBEDIENCE IS BETTER THAN SACRIFICE. It is not enough to agree intellectually with sound doctrine; we must be doers of the word and not hearers only, deceiving our own selves (James 1:22).\n\nTake practical steps today to put into practice the biblical injunctions revealed in this book. Share these truths with your family, your fellowship brethren, and all who seek to know the truth that leads to life eternal.`,
        `PRAYER FOR SANCTIFICATION:\n\n"Lord Jesus, author and finisher of our faith, cleanse my life from every spot, wrinkle, and blemish. Grant me the grace to walk in holy obedience to Your commandments all the days of my life. Fill me with Your Holy Spirit and keep me faithful until Your trumpet sounds. Amen."`,
      ],
    },
  ];
}

export default function BookReaderModal({ book, isOpen, onClose }: BookReaderModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<"light" | "sepia" | "dark">("sepia");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isTocOpen, setIsTocOpen] = useState(false);

  // PDF Page Viewer States
  const [displayMode, setDisplayMode] = useState<"reader" | "pdf">("pdf");
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.2);

  // Compile chapters and flat page list for Text Mode
  const chapters = useMemo(() => {
    if (!book) return [];
    if (SAMPLE_BOOK_CONTENTS[book.title]) {
      return SAMPLE_BOOK_CONTENTS[book.title];
    }
    return generateGenericChapters(book);
  }, [book]);

  const allPages = useMemo(() => {
    const list: Array<{ chapterTitle: string; content: string; pageNumber: number }> = [];
    let count = 1;
    chapters.forEach((ch) => {
      ch.pages.forEach((p) => {
        list.push({ chapterTitle: ch.title, content: p, pageNumber: count++ });
      });
    });
    return list;
  }, [chapters]);

  // Reset page when book changes
  useEffect(() => {
    setCurrentPageIndex(0);
    setPdfCurrentPage(1);
    setPdfScale(1.2);
    // If book has a real PDF URL, default directly to real PDF page-by-page reader
    if (book?.fileUrl) {
      setDisplayMode("pdf");
    } else {
      setDisplayMode("reader");
    }
  }, [book]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (displayMode === "pdf") {
          setPdfCurrentPage((prev) => Math.min(pdfTotalPages, prev + 1));
        } else {
          setCurrentPageIndex((prev) => Math.min(allPages.length - 1, prev + 1));
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (displayMode === "pdf") {
          setPdfCurrentPage((prev) => Math.max(1, prev - 1));
        } else {
          setCurrentPageIndex((prev) => Math.max(0, prev - 1));
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayMode, pdfTotalPages, allPages.length, onClose]);

  if (!book) return null;

  const currentPage = allPages[currentPageIndex] || allPages[0];
  const progressPct =
    displayMode === "pdf"
      ? Math.round((pdfCurrentPage / Math.max(1, pdfTotalPages)) * 100)
      : Math.round(((currentPageIndex + 1) / allPages.length) * 100);

  // Theme styling configurations
  const themeClasses = {
    light: "bg-white text-slate-800 border-slate-200",
    sepia: "bg-[#fbf7ee] text-[#3e3428] border-[#e7ddc9]",
    dark: "bg-[#141b24] text-slate-200 border-slate-800",
  }[themeMode];

  const pagePaperClasses = {
    light: "bg-[#fdfdfd] shadow-sm text-slate-800 border-slate-200",
    sepia: "bg-[#faf5ea] shadow-sm text-[#382f23] border-[#ecdcc0]",
    dark: "bg-[#18212d] shadow-sm text-slate-200 border-slate-700/60",
  }[themeMode];

  const fontSizeClasses = {
    sm: "text-xs sm:text-sm leading-relaxed sm:leading-7",
    base: "text-sm sm:text-base leading-relaxed sm:leading-8",
    lg: "text-base sm:text-lg leading-loose sm:leading-9",
  }[fontSize];

  return (
    <Dialog
      fullScreen
      onClose={onClose}
      open={isOpen}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: themeMode === "dark" ? "#0f1620" : themeMode === "sepia" ? "#f4ede0" : "#f1f3f5",
          transition: "background-color 0.25s ease",
        },
      }}
    >
      <div className="flex h-screen w-full flex-col overflow-hidden font-sans">
        {/* Top Control Bar */}
        <header className={`flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-md z-30 ${themeClasses}`}>
          <div className="flex items-center gap-3 min-w-0">
            {displayMode === "reader" && (
              <button
                aria-label="Table of contents"
                className="grid size-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                onClick={() => setIsTocOpen(!isTocOpen)}
                title="Table of Contents"
                type="button"
              >
                <List size={18} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-xs sm:text-sm truncate">
                {book.title}
              </h2>
              <p className="text-[10px] text-brand-green font-semibold truncate hidden sm:block">
                by {book.author || "Pastor Paul Rika"} · HOREMOW Literature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher: Real PDF Page Viewer vs Chapter Reader */}
            {book.fileUrl && (
              <div className="flex items-center rounded-lg border border-black/10 dark:border-white/10 p-0.5 bg-black/5 dark:bg-white/5">
                <button
                  className={`rounded px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                    displayMode === "pdf"
                      ? "bg-brand-blue text-white shadow-xs"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  onClick={() => setDisplayMode("pdf")}
                  title="View authentic PDF pages"
                  type="button"
                >
                  <FileText size={12} /> Book PDF
                </button>
                <button
                  className={`rounded px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                    displayMode === "reader"
                      ? "bg-brand-blue text-white shadow-xs"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  onClick={() => setDisplayMode("reader")}
                  title="Switch to chapter text mode"
                  type="button"
                >
                  <BookOpen size={12} /> Text Mode
                </button>
              </div>
            )}

            {/* PDF Zoom Controls */}
            {displayMode === "pdf" && (
              <div className="hidden sm:flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2">
                <button
                  className="grid size-8 place-items-center rounded text-xs hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setPdfScale((s) => Math.max(0.7, Number((s - 0.15).toFixed(2))))}
                  title="Zoom Out"
                  type="button"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-[10px] font-mono px-1 font-bold">
                  {Math.round(pdfScale * 100)}%
                </span>
                <button
                  className="grid size-8 place-items-center rounded text-xs hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setPdfScale((s) => Math.min(2.2, Number((s + 0.15).toFixed(2))))}
                  title="Zoom In"
                  type="button"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  className="grid size-8 place-items-center rounded text-xs hover:bg-black/5 dark:hover:bg-white/10 text-slate-400"
                  onClick={() => setPdfScale(1.2)}
                  title="Reset Zoom"
                  type="button"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}

            {/* Reading Mode Selector (Text Mode only) */}
            {displayMode === "reader" && (
              <div className="flex items-center rounded-lg border border-black/10 dark:border-white/10 p-0.5 bg-black/5 dark:bg-white/5">
                <button
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    themeMode === "sepia" ? "bg-amber-100 text-amber-900 shadow-xs" : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setThemeMode("sepia")}
                  title="Sepia Paper Mode"
                  type="button"
                >
                  Sepia
                </button>
                <button
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    themeMode === "light" ? "bg-white text-slate-800 shadow-xs" : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setThemeMode("light")}
                  title="Clean White Mode"
                  type="button"
                >
                  <Sun size={12} className="inline mr-1" /> Light
                </button>
                <button
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    themeMode === "dark" ? "bg-slate-700 text-white shadow-xs" : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setThemeMode("dark")}
                  title="Night Mode"
                  type="button"
                >
                  <Moon size={12} className="inline mr-1" /> Dark
                </button>
              </div>
            )}

            {/* Font Size Adjust (Text Mode only) */}
            {displayMode === "reader" && (
              <div className="hidden sm:flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2">
                <button
                  className="grid size-8 place-items-center rounded text-xs font-serif font-bold hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setFontSize(fontSize === "lg" ? "base" : "sm")}
                  title="Decrease Font Size"
                  type="button"
                >
                  A-
                </button>
                <button
                  className="grid size-8 place-items-center rounded text-sm font-serif font-bold hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setFontSize(fontSize === "sm" ? "base" : "lg")}
                  title="Increase Font Size"
                  type="button"
                >
                  A+
                </button>
              </div>
            )}

            {book.fileUrl && (
              <a
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
                download={`${book.title}.pdf`}
                href={book.fileUrl}
                rel="noreferrer"
                target="_blank"
                title="Download complete PDF book"
              >
                <Download size={13} /> Download PDF
              </a>
            )}

            <button
              aria-label="Close book reader"
              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-700 transition"
              onClick={onClose}
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Reader Workspace */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Table of Contents Drawer (Text Mode) */}
          <AnimatePresence>
            {isTocOpen && displayMode === "reader" && (
              <motion.aside
                animate={{ x: 0 }}
                className={`absolute inset-y-0 left-0 z-40 w-72 sm:w-80 border-r shadow-2xl overflow-y-auto p-5 ${themeClasses}`}
                exit={{ x: -320 }}
                initial={{ x: -320 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                  <h3 className="font-serif font-bold text-sm">Table of Contents</h3>
                  <button
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => setIsTocOpen(false)}
                    type="button"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-2">
                  {chapters.map((ch, chIdx) => {
                    const chapterStartIdx = allPages.findIndex((p) => p.chapterTitle === ch.title);
                    const isActive = allPages[currentPageIndex]?.chapterTitle === ch.title;

                    return (
                      <button
                        className={`w-full text-left p-3 rounded-xl transition text-xs font-medium flex items-center justify-between ${
                          isActive
                            ? "bg-brand-blue text-white shadow font-bold"
                            : "hover:bg-black/5 dark:hover:bg-white/5 opacity-85"
                        }`}
                        key={chIdx}
                        onClick={() => {
                          if (chapterStartIdx >= 0) setCurrentPageIndex(chapterStartIdx);
                          setIsTocOpen(false);
                        }}
                        type="button"
                      >
                        <span className="line-clamp-2">{ch.title}</span>
                        <span className="text-[10px] opacity-70 ml-2 shrink-0">
                          {ch.pages.length} {ch.pages.length === 1 ? "page" : "pages"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 text-xs space-y-2 text-slate-500">
                  <div className="font-bold text-ink">HOREMOW Publishing Division</div>
                  <p className="text-[11px] leading-relaxed">
                    Undiluted gospel literature published globally for the sanctification and revival of the church.
                  </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Book Canvas Area: Real PDF Page-By-Page or Animated Text Mode */}
          {displayMode === "pdf" && book.fileUrl ? (
            <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
              <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
                <PdfPageViewer
                  currentPage={pdfCurrentPage}
                  onSwitchToTextMode={() => setDisplayMode("reader")}
                  onTotalPagesLoaded={(total) => setPdfTotalPages(Math.max(1, total))}
                  pdfUrl={book.fileUrl}
                  scale={pdfScale}
                />

                {/* Floating Prev / Next Navigation for PDF */}
                <button
                  aria-label="Previous page"
                  className={`fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 grid size-10 sm:size-12 place-items-center rounded-full bg-white text-slate-800 shadow-2xl border border-slate-300 transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none z-30 ${
                    pdfCurrentPage <= 1 ? "opacity-20 pointer-events-none" : ""
                  }`}
                  disabled={pdfCurrentPage <= 1}
                  onClick={() => setPdfCurrentPage((prev) => Math.max(1, prev - 1))}
                  title="Previous Page (Left Arrow)"
                  type="button"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  aria-label="Next page"
                  className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 grid size-10 sm:size-12 place-items-center rounded-full bg-brand-blue text-white shadow-2xl transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none z-30 ${
                    pdfCurrentPage >= pdfTotalPages ? "opacity-20 pointer-events-none" : ""
                  }`}
                  disabled={pdfCurrentPage >= pdfTotalPages}
                  onClick={() => setPdfCurrentPage((prev) => Math.min(pdfTotalPages, prev + 1))}
                  title="Next Page (Right Arrow)"
                  type="button"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </main>
          ) : (
            <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="relative w-full max-w-3xl flex-1 flex flex-col justify-between">
                {/* Animated Book Page Transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    className={`flex-1 flex flex-col justify-between rounded-2xl border p-6 sm:p-10 lg:p-12 transition-all ${pagePaperClasses}`}
                    exit={{ opacity: 0, y: 6, rotateY: -3 }}
                    initial={{ opacity: 0, y: -6, rotateY: 3 }}
                    key={currentPageIndex}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    {/* Page Header */}
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span className="truncate pr-4">{currentPage.chapterTitle}</span>
                      <span className="shrink-0">HOREMOW Reader</span>
                    </div>

                    {/* Main Page Body Text */}
                    <div className={`my-auto py-6 font-serif ${fontSizeClasses} whitespace-pre-line text-justify`}>
                      {currentPage.content}
                    </div>

                    {/* Page Footer */}
                    <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-3 text-[11px] font-medium opacity-60">
                      <span>{book.title}</span>
                      <span className="font-mono font-bold">Page {currentPage.pageNumber}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Next Floating Navigation Buttons */}
                <button
                  aria-label="Previous page"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6 grid size-10 sm:size-12 place-items-center rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none z-20 ${
                    currentPageIndex === 0 ? "opacity-0 pointer-events-none" : ""
                  }`}
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  type="button"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  aria-label="Next page"
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6 grid size-10 sm:size-12 place-items-center rounded-full bg-brand-blue text-white shadow-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none z-20 ${
                    currentPageIndex === allPages.length - 1 ? "opacity-0 pointer-events-none" : ""
                  }`}
                  disabled={currentPageIndex === allPages.length - 1}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(allPages.length - 1, prev + 1))}
                  type="button"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </main>
          )}
        </div>

        {/* Bottom Page Scrubber & Status Bar */}
        <footer className={`h-12 shrink-0 border-t flex items-center justify-between px-4 sm:px-8 text-xs z-30 ${themeClasses}`}>
          <div className="flex items-center gap-2 text-[11px] font-bold opacity-75">
            {displayMode === "pdf" ? (
              <>
                <span>Page {pdfCurrentPage} of {pdfTotalPages}</span>
                <span>({progressPct}% read)</span>
              </>
            ) : (
              <>
                <span>Page {currentPageIndex + 1} of {allPages.length}</span>
                <span>({progressPct}% completed)</span>
              </>
            )}
          </div>

          {/* Reading Scrubber Slider */}
          <div className="flex items-center gap-3 w-1/3 max-w-xs">
            {displayMode === "pdf" ? (
              <input
                aria-label="PDF page scrubber"
                className="w-full accent-brand-blue cursor-pointer h-1.5"
                max={Math.max(1, pdfTotalPages)}
                min={1}
                onChange={(e) => setPdfCurrentPage(Number(e.target.value))}
                type="range"
                value={pdfCurrentPage}
              />
            ) : (
              <input
                aria-label="Reading progress scrubber"
                className="w-full accent-brand-blue cursor-pointer h-1.5"
                max={allPages.length - 1}
                min={0}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                type="range"
                value={currentPageIndex}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {displayMode === "pdf" ? (
              <>
                <button
                  className="text-[11px] font-bold text-brand-blue hover:underline hidden sm:inline"
                  onClick={() => setPdfCurrentPage(1)}
                  type="button"
                >
                  First Page
                </button>
                {book.fileUrl && (
                  <a
                    className="text-[11px] font-bold text-slate-500 hover:text-ink hidden md:inline-flex items-center gap-1"
                    href={book.fileUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={11} /> Open File
                  </a>
                )}
              </>
            ) : (
              <button
                className="text-[11px] font-bold text-brand-blue hover:underline hidden sm:inline"
                onClick={() => setCurrentPageIndex(0)}
                type="button"
              >
                Start Over
              </button>
            )}
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
