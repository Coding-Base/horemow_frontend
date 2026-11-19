import { useEffect } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Contact,
  Eye,
  FileText,
  Globe2,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAnalyticsData,
  syncTransactionsFromBackend,
  useDirectoryContent,
  useSermonsContent,
  useTransactionsContent,
} from "../../lib/contentStore";
import { useAuth } from "../../lib/auth";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const analytics = getAnalyticsData();
  const transactions = useTransactionsContent();
  const directory = useDirectoryContent();
  const sermons = useSermonsContent();

  useEffect(() => {
    syncTransactionsFromBackend().catch(() => {});
  }, []);

  const totalOfferingsNGN = transactions
    .filter((transaction) => transaction.status === "SUCCESSFUL" && transaction.currency === "NGN")
    .reduce((total, transaction) => total + parseFloat(transaction.amount || "0"), 0);
  const confirmedTransactions = transactions.filter(
    (transaction) => transaction.status === "SUCCESSFUL",
  ).length;
  const activeLeaders = directory.filter((leader) => leader.isActive).length;

  const metrics = [
    {
      label: "Total offerings",
      value: `₦${totalOfferingsNGN.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      detail: `${confirmedTransactions} confirmed (Paystack & PayPal)`,
      icon: Wallet,
      href: "/admin/transactions",
      tone: "gold",
    },
    {
      label: "Site visitors",
      value: analytics.uniqueVisitors.toLocaleString(),
      detail: "Across 50+ nations",
      icon: Eye,
      href: "/admin/analytics",
      tone: "blue",
    },
    {
      label: "Overseers directory",
      value: `${activeLeaders} leaders`,
      detail: "Active ministerial jurisdiction",
      icon: Contact,
      href: "/admin/directory",
      tone: "slate",
    },
    {
      label: "Published sermons",
      value: `${sermons.length} messages`,
      detail: "Audio, video & transcripts",
      icon: FileText,
      href: "/admin/sermons",
      tone: "blue",
    },
  ] as const;

  return (
    <section className="space-y-6 sm:space-y-7">
      <div className="relative isolate overflow-hidden rounded-2xl bg-[#102b46] px-5 py-6 text-white shadow-[0_16px_45px_rgba(16,43,70,.15)] sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-32 -z-10 size-96 rounded-full border border-white/[.08]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-2 -top-20 -z-10 size-72 rounded-full border border-[#d9ba70]/20"
        />
        <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-l from-[#193d5e]/70 to-transparent" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d9ba70]">
              Unified Administration Portal
            </p>
            <p className="mt-3 text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">
              Ministry operations
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300 sm:text-sm">
              Welcome back, {user?.first_name || "Administrator"}. Review ministry activity and
              manage your public website from one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#d9ba70] px-3.5 text-xs font-bold text-[#13283d] transition hover:bg-[#e7d29d]"
              to="/admin/directory"
            >
              <Plus size={15} /> Add Overseer
            </Link>
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/[.06] px-3.5 text-xs font-bold text-white transition hover:bg-white/[.12]"
              to="/admin/transactions"
            >
              <Receipt size={15} /> View Ledger
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, href, tone }) => (
          <Link
            className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(20,40,60,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c8b375] hover:shadow-[0_12px_30px_rgba(20,40,60,.08)] sm:p-5"
            key={label}
            to={href}
          >
            <span className="absolute left-0 top-0 h-full w-[3px] bg-[#d9ba70] opacity-0 transition group-hover:opacity-100" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
                {label}
              </span>
              <span
                className={`grid size-9 place-items-center rounded-lg ${
                  tone === "gold"
                    ? "bg-[#d9ba70]/15 text-[#9b7931]"
                    : tone === "slate"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-[#1a4b8c]/[.08] text-[#1a4b8c]"
                }`}
              >
                <Icon size={17} />
              </span>
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight text-[#13283d] sm:text-2xl">
              {value}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-medium text-slate-500">{detail}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#9b7931]"
                size={14}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(20,40,60,.025)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a28747]">
                Financial activity
              </p>
              <h2 className="mt-1 text-sm font-bold text-[#13283d]">Recent offerings</h2>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a4b8c] hover:underline"
              to="/admin/transactions"
            >
              Full ledger <ArrowUpRight size={13} />
            </Link>
          </div>

          {transactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 4).map((transaction) => (
                <div
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-slate-50/70 sm:px-6"
                  key={transaction.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f5f2e9] text-[#9b7931]">
                      <Receipt size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#13283d]">
                        {transaction.donor_name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                        {transaction.reference} · {transaction.project}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-[#13283d]">
                      {transaction.currency}{" "}
                      {parseFloat(transaction.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-slate-50 text-slate-400">
                <Receipt size={17} />
              </span>
              <p className="mt-3 text-xs font-semibold text-slate-600">No offerings to display yet</p>
              <p className="mt-1 text-[10px] text-slate-400">New transactions will appear here.</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(20,40,60,.025)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a28747]">
                Audience reach
              </p>
              <h2 className="mt-1 text-sm font-bold text-[#13283d]">Global visitation</h2>
            </div>
            <span className="grid size-9 place-items-center rounded-lg bg-[#1a4b8c]/[.08] text-[#1a4b8c]">
              <Globe2 size={17} />
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 rounded-lg bg-[#f5f7fa] p-4">
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#13283d]">
                {analytics.uniqueVisitors.toLocaleString()}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Unique visitors</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-[#1a4b8c]">
              <TrendingUp size={12} /> Ministry worldwide
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-slate-500">
            Seekers and believers from over 50 nations are actively streaming sermons and reading
            daily devotionals. Top regions include Nigeria (54%), United States (15%), and United
            Kingdom (10%).
          </p>

          <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-center text-[10px] font-bold text-slate-600 transition hover:border-[#c8b375] hover:bg-[#fbfaf6] hover:text-[#13283d]"
              to="/admin/content"
            >
              <FileText size={13} /> Customise homepage
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-center text-[10px] font-bold text-slate-600 transition hover:border-[#c8b375] hover:bg-[#fbfaf6] hover:text-[#13283d]"
              to="/admin/gallery"
            >
              <BarChart3 size={13} /> Manage gallery
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
