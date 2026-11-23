import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { TOAST_CUSTOM_EVENT, type ToastMessage } from "../../lib/soundToast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const custom = e as CustomEvent<ToastMessage>;
      if (!custom.detail) return;
      const newToast = custom.detail;
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener(TOAST_CUSTOM_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_CUSTOM_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex max-w-sm w-full flex-col gap-2.5 sm:right-6 sm:top-6"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all ${
                isSuccess
                  ? "border-emerald-300 bg-emerald-50/95 text-emerald-950 shadow-emerald-900/10"
                  : isError
                  ? "border-rose-300 bg-rose-50/95 text-rose-950 shadow-rose-900/10"
                  : "border-sky-300 bg-sky-50/95 text-sky-950 shadow-sky-900/10"
              }`}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              key={toast.id}
              layout
            >
              <div className="shrink-0 pt-0.5">
                {isSuccess && <CheckCircle2 className="text-emerald-600" size={18} />}
                {isError && <AlertCircle className="text-rose-600" size={18} />}
                {!isSuccess && !isError && <Info className="text-sky-600" size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                {toast.title && (
                  <h4 className="text-xs font-bold leading-tight tracking-tight">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>

              <button
                aria-label="Dismiss toast"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-black/5 hover:text-slate-700 transition"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
