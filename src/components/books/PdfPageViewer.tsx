import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2, AlertCircle } from "lucide-react";

// Configure worker using CDN matching installed version
if (typeof window !== "undefined" && "GlobalWorkerOptions" in pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface PdfOutlineItem {
  title: string;
  pageNumber: number;
}

interface PdfPageViewerProps {
  pdfUrl: string;
  currentPage: number;
  scale?: number;
  onTotalPagesLoaded: (totalPages: number) => void;
  onPageRendered?: () => void;
  onSwitchToTextMode?: () => void;
  onOutlineLoaded?: (outline: PdfOutlineItem[]) => void;
}

export default function PdfPageViewer({
  pdfUrl,
  currentPage,
  scale = 1.3,
  onTotalPagesLoaded,
  onPageRendered,
  onSwitchToTextMode,
  onOutlineLoaded,
}: PdfPageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Keep callback refs stable across renders
  const onTotalPagesLoadedRef = useRef(onTotalPagesLoaded);
  onTotalPagesLoadedRef.current = onTotalPagesLoaded;

  const onPageRenderedRef = useRef(onPageRendered);
  onPageRenderedRef.current = onPageRendered;

  const onOutlineLoadedRef = useRef(onOutlineLoaded);
  onOutlineLoadedRef.current = onOutlineLoaded;

  // Load PDF Document ONCE per pdfUrl
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingDoc(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((loadedDoc) => {
        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          if (onTotalPagesLoadedRef.current) {
            onTotalPagesLoadedRef.current(loadedDoc.numPages);
          }
          setIsLoadingDoc(false);

          // Extract PDF document bookmarks/outline if available
          loadedDoc
            .getOutline()
            .then(async (rawOutline) => {
              if (rawOutline && Array.isArray(rawOutline) && rawOutline.length > 0) {
                const parsed: PdfOutlineItem[] = [];
                for (const item of rawOutline) {
                  let destPage = 1;
                  if (item.dest) {
                    try {
                      let dest: any = item.dest;
                      if (typeof dest === "string") {
                        dest = await loadedDoc.getDestination(dest);
                      }
                      if (dest && Array.isArray(dest) && dest[0]) {
                        const pageIdx = await loadedDoc.getPageIndex(dest[0]);
                        destPage = pageIdx + 1;
                      }
                    } catch {
                      // Fallback
                    }
                  }
                  parsed.push({ title: item.title, pageNumber: destPage });
                }
                if (onOutlineLoadedRef.current && parsed.length > 0) {
                  onOutlineLoadedRef.current(parsed);
                }
              }
            })
            .catch(() => {});
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load PDF document";
          setError(msg);
          setIsLoadingDoc(false);
        }
      });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore
        }
        renderTaskRef.current = null;
      }
      setPdfDoc(null);
      try {
        loadingTask.destroy();
      } catch {
        // Ignore
      }
    };
  }, [pdfUrl]);

  // Render Page to Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    // Guard against destroyed or invalid worker transport
    if ((pdfDoc as any).destroyed || !(pdfDoc as any)._transport) return;

    let isCancelled = false;
    setIsRenderingPage(true);

    // Cancel prior render task safely
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore
      }
      renderTaskRef.current = null;
    }

    const safePageNum = Math.min(Math.max(1, currentPage), pdfDoc.numPages);

    pdfDoc
      .getPage(safePageNum)
      .then((page) => {
        if (isCancelled || !canvasRef.current) return;
        if ((pdfDoc as any).destroyed || !(pdfDoc as any)._transport) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        return task.promise.then(() => {
          if (!isCancelled) {
            setIsRenderingPage(false);
            if (onPageRenderedRef.current) onPageRenderedRef.current();
          }
        });
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setIsRenderingPage(false);
          if ((err as any)?.name !== "RenderingCancelledException") {
            console.warn("PDF getPage/render note:", err);
          }
        }
      });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto my-auto">
        <AlertCircle className="text-red-500 mb-2" size={36} />
        <h4 className="font-bold text-slate-800 text-sm">Cannot Render PDF Directly</h4>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onSwitchToTextMode && (
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#143A6D] transition"
              onClick={onSwitchToTextMode}
              type="button"
            >
              Read in Text Reader Mode
            </button>
          )}
          <a
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            download
            href={pdfUrl}
            rel="noreferrer"
            target="_blank"
          >
            Download PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[500px] w-full">
      {(isLoadingDoc || isRenderingPage) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs z-10 rounded-xl">
          <Loader2 className="animate-spin text-brand-blue mb-2" size={32} />
          <span className="text-xs font-bold text-slate-700">
            {isLoadingDoc ? "Loading book document..." : `Rendering page ${currentPage}...`}
          </span>
        </div>
      )}

      <div className="rounded-lg shadow-xl overflow-hidden border border-slate-300 bg-white transition-all">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

