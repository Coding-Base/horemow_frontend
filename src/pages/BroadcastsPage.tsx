import { Music2, Play, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";
import PageIntro from "../components/common/PageIntro";
import { useBroadcastsContent } from "../lib/contentStore";

type BroadcastMode = "tv" | "radio";

export default function BroadcastsPage() {
  const broadcasts = useBroadcastsContent();
  const [mode, setMode] = useState<BroadcastMode>("tv");

  const isTv = mode === "tv";
  const title = isTv ? broadcasts.tvTitle : broadcasts.radioTitle;
  const status = isTv ? broadcasts.tvStatus : broadcasts.radioStatus;
  const schedule = isTv ? broadcasts.tvSchedule : broadcasts.radioSchedule;
  const streamUrl = isTv ? broadcasts.tvStreamUrl : broadcasts.radioStreamUrl;

  return (
    <>
      <PageIntro
        description="Connect with HOREMOW global teaching and live satellite broadcast streams."
        eyebrow="Watch & listen"
        title="Broadcasts."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(900px,calc(100%-2.25rem))]">
          <div aria-label="Broadcast type" className="mb-4 flex flex-col gap-2 sm:flex-row" role="tablist">
            <BroadcastTab active={mode === "tv"} icon={<Play size={15} />} onClick={() => setMode("tv")}>
              {broadcasts.tvTitle}
            </BroadcastTab>
            <BroadcastTab active={mode === "radio"} icon={<Music2 size={16} />} onClick={() => setMode("radio")}>
              {broadcasts.radioTitle}
            </BroadcastTab>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex min-h-[320px] flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(212,196,168,.18),transparent_31%),linear-gradient(145deg,#173b5a,#102338)] p-6 text-center text-white">
              <span className="mb-4 grid size-16 place-items-center rounded-full border border-white/40 bg-white/5">
                <Radio size={28} />
              </span>
              <span className="text-[10px] font-extrabold tracking-[.18em] text-[#e5be64]">
                {title.toUpperCase()}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {status === "Online" ? "Live Stream Active" : "Stream Scheduled / Standby"}
              </h2>
              <p className="mt-2 max-w-md text-xs leading-6 text-slate-300">{schedule}</p>
            </div>

            <div className="flex min-h-16 items-center justify-between px-6 py-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span
                  className={`size-2.5 rounded-full ${
                    status === "Online" ? "bg-green-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {status === "Online" ? "Broadcasting Live" : "Offline / Check Schedule"}
              </span>

              {streamUrl ? (
                <Button
                  component="a"
                  href={streamUrl}
                  rel="noopener noreferrer"
                  startIcon={<Play size={14} />}
                  target="_blank"
                  variant="contained"
                >
                  Tune In / Play
                </Button>
              ) : (
                <Button disabled startIcon={<Play size={14} />} variant="outlined">
                  Stream Standby
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-soft-blue p-4">
            <ShieldCheck className="mt-0.5 shrink-0 text-brand-green" size={18} />
            <p className="text-xs leading-5 text-slate-600">
              Official HOREMOW media channels are managed centrally. Broadcasters can update stream connections directly from the Admin control panel.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function BroadcastTab({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-selected={active}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-xs font-bold transition ${
        active
          ? "border-brand-blue bg-brand-blue text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-600 hover:border-brand-blue"
      }`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {icon} {children}
    </button>
  );
}
