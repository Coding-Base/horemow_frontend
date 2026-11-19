import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Clock,
  Eye,
  Globe2,
  Laptop,
  Smartphone,
  Tablet,
  Users,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import SectionHeading from "../../components/common/SectionHeading";
import { fetchAnalyticsOverview } from "../../lib/analytics";
import type { AnalyticsData } from "../../lib/contentStore";
import { getAnalyticsData } from "../../lib/contentStore";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(getAnalyticsData);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (range: "7D" | "30D" | "90D", isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchAnalyticsOverview(range);
      setData(result);
    } catch {
      setData(getAnalyticsData());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange, loadData]);

  const dailyList = data.dailyVisits || [];
  const maxVisits = dailyList.length > 0 ? Math.max(...dailyList.map((d) => d.visits), 1) : 1;

  const hasVisits = data.totalPageviews > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>Real-Time Traffic & Engagement</Eyebrow>
          <SectionHeading
            description="Track global visitor metrics, geographic reach, audience devices, and resource engagement in real-time."
            title="Site Visitation & Analytics"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(timeRange, true)}
            title="Refresh metrics"
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-brand-blue hover:border-brand-blue/30 transition disabled:opacity-50"
            type="button"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-brand-blue" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
            {(["7D", "30D", "90D"] as const).map((range) => (
              <button
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  timeRange === range
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                key={range}
                onClick={() => setTimeRange(range)}
                type="button"
              >
                {range === "7D" ? "Last 7 Days" : range === "30D" ? "Last 30 Days" : "Last Quarter"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pageviews</span>
            <Eye size={18} className="text-brand-blue" />
          </div>
          <div className="mt-2 text-2xl font-black text-ink">
            {data.totalPageviews.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-500">
            {hasVisits ? "Active session tracking" : "Awaiting visitor traffic"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Visitors</span>
            <Users size={18} className="text-brand-green" />
          </div>
          <div className="mt-2 text-2xl font-black text-ink">
            {data.uniqueVisitors.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-500">
            {hasVisits ? "Unique device fingerprints" : "0 unique seekers"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Session Time</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-ink">
            {hasVisits ? `${Math.floor(data.avgSessionSeconds / 60)}m ${data.avgSessionSeconds % 60}s` : "0m 00s"}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            {hasVisits ? "Sermon & devotional read time" : "No active session duration"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Bounce Rate</span>
            <Activity size={18} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-ink">
            {hasVisits ? `${data.bounceRate}%` : "0%"}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            {hasVisits ? "Healthy organic retention" : "No bounce recorded"}
          </div>
        </div>
      </div>

      {!hasVisits ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-soft-blue text-brand-blue">
            <BarChart3 size={24} />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-ink">No Site Visit Records Yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
            Live site analytics are fully operational and connected. As seekers, church members, and leaders visit the public homepage, sermons, and devotional pages, real-time traffic charts, country telemetry, and top resources will display here.
          </p>
        </div>
      ) : (
        <>
          {/* Main Chart Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Daily Visitation Volume</h3>
                <p className="text-xs text-slate-500">Visitors and total page impressions across the selected window.</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="size-2.5 rounded-full bg-brand-blue" /> Pageviews
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="size-2.5 rounded-full bg-brand-green" /> Unique Visitors
                </span>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 pt-4">
              {dailyList.map((day, idx) => {
                const heightPct = Math.max(15, Math.round((day.visits / maxVisits) * 100));
                return (
                  <div className="flex flex-1 flex-col items-center gap-2 h-full justify-end" key={idx}>
                    <div className="relative group w-full flex items-end justify-center h-full">
                      <div
                        className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-brand-blue to-soft-blue/80 transition-all hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="absolute -top-8 hidden group-hover:block rounded bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow-md z-10 whitespace-nowrap">
                        {day.pageviews} views ({day.visits} visitors)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown: Top Pages, Countries, Devices */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top Visited Pages */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Top Engaging Pages</span>
                <ArrowUpRight size={14} />
              </h3>
              <div className="divide-y divide-slate-100">
                {data.topPages.map((page, idx) => (
                  <div className="py-2.5 flex items-center justify-between text-xs" key={idx}>
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-ink truncate">{page.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{page.path}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-ink">{page.views.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{page.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Reach */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Globe2 size={14} className="text-brand-blue" />
                <span>Geographic Audience</span>
              </h3>
              <div className="space-y-3 pt-1">
                {data.countries.map((c, idx) => (
                  <div className="space-y-1" key={idx}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{c.name}</span>
                      <span className="text-slate-500">{c.visitors} visitors ({c.pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices Used */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                <span>Platform & Devices</span>
              </h3>
              <div className="space-y-4 pt-2">
                {data.devices.map((d, idx) => (
                  <div className="flex items-center justify-between text-xs" key={idx}>
                    <div className="flex items-center gap-2">
                      {d.type.includes("Mobile") ? (
                        <Smartphone size={16} className="text-brand-blue" />
                      ) : d.type.includes("Desktop") ? (
                        <Laptop size={16} className="text-emerald-600" />
                      ) : (
                        <Tablet size={16} className="text-amber-500" />
                      )}
                      <span className="font-semibold text-slate-700">{d.type}</span>
                    </div>
                    <span className="font-bold text-ink">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
