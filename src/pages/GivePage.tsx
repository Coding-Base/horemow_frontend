import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CreditCard,
  Globe2,
  Heart,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  Mail,
  Printer,
  Radio,
  ShieldCheck,
  X,
} from "lucide-react";
import Eyebrow from "../components/common/Eyebrow";
import PageIntro from "../components/common/PageIntro";
import { recordTransaction, useContactContent, useGivingContent } from "../lib/contentStore";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");

type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE" | "PAYPAL";

type CheckoutResponse = {
  success?: boolean;
  data?: {
    authorization_url?: string;
    checkout_mode?: string;
  };
  message?: string;
  detail?: string;
};

type VerifiedReceipt = {
  transaction_id: string;
  reference: string;
  amount: string;
  currency: string;
  donor_name: string;
  donor_email: string;
  project: string;
  status: string;
  completed_at?: string;
  email_sent?: boolean;
};

function isProviderCheckoutUrl(value: string, provider: PaymentProvider) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (provider === "PAYSTACK") {
      return (
        host === "paystack.com" ||
        host.endsWith(".paystack.com") ||
        host === "localhost" ||
        host === "127.0.0.1"
      );
    }
    if (provider === "FLUTTERWAVE") {
      return (
        host === "flutterwave.com" ||
        host.endsWith(".flutterwave.com") ||
        host === "dev-flutterwave.com" ||
        host.endsWith(".dev-flutterwave.com") ||
        host === "ravepay.co" ||
        host.endsWith(".ravepay.co") ||
        host === "localhost" ||
        host === "127.0.0.1"
      );
    }
    if (provider === "PAYPAL") {
      return (
        host === "paypal.com" ||
        host.endsWith(".paypal.com") ||
        host === "localhost" ||
        host === "127.0.0.1"
      );
    }
    return false;
  } catch {
    return false;
  }
}

export default function GivePage() {
  const projects = useGivingContent();
  const contact = useContactContent();
  const [selected, setSelected] = useState<string>(projects[0]?.name ?? "");
  const [currency, setCurrency] = useState("NGN");
  const [amount, setAmount] = useState("10000");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [provider, setProvider] = useState<PaymentProvider>("PAYSTACK");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Return from payment verification & official receipt modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedReceipt | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [returnNotice, setReturnNotice] = useState<{
    type: "warning" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isCancelled = params.get("cancelled") === "true";
    const isVerified = params.get("verified") === "true";
    const ref = params.get("reference") || params.get("tx_ref") || params.get("trxref") || params.get("token");
    const flwTxId = params.get("transaction_id");
    const prov = (params.get("provider") || "PAYSTACK").toUpperCase() as PaymentProvider;

    if (isCancelled) {
      setReturnNotice({
        type: "warning",
        title: "Checkout Cancelled",
        message: "You cancelled the payment session. No offering was debited from your card or account.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    if (isVerified || ref || flwTxId) {
      setIsVerifying(true);
      fetch(`${API_BASE_URL}/donations/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: ref || "",
          transaction_id: flwTxId || "",
          provider: prov,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || data.success === false) {
            throw new Error(
              data.message || "Payment was not completed on the provider gateway. No offering was debited.",
            );
          }
          return data;
        })
        .then((data) => {
          if (data.success && data.data) {
            setVerifiedReceipt(data.data);
            setReceiptModalOpen(true);
            try {
              recordTransaction({
                id: data.data.transaction_id || data.data.reference,
                reference: data.data.reference,
                project: data.data.project || selected || "General Ministry Offering",
                amount: String(data.data.amount),
                currency: data.data.currency || currency,
                donor_name: data.data.donor_name || donorName || "Anonymous Donor",
                donor_email: data.data.donor_email || donorEmail,
                donor_phone: donorPhone || undefined,
                provider: (prov === "FLUTTERWAVE" ? "FLUTTERWAVE" : prov === "PAYPAL" ? "PAYPAL" : "PAYSTACK") as "PAYSTACK" | "FLUTTERWAVE" | "PAYPAL",
                status: "SUCCESSFUL",
                created_at: data.data.completed_at || new Date().toISOString(),
                completed_at: data.data.completed_at || new Date().toISOString(),
                email_sent: Boolean(data.data.email_sent),
              });
            } catch {
              // Ignore local record issue
            }
          }
        })
        .catch((err) => {
          const msg =
            err instanceof Error
              ? err.message
              : "Payment verification failed. No receipt was issued.";
          setReturnNotice({
            type: "error",
            title: "Payment Not Completed",
            message: msg,
          });
          window.scrollTo({ top: 120, behavior: "smooth" });
        })
        .finally(() => {
          setIsVerifying(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  const activeProject = projects.find((project) => project.name === selected);
  const numericAmount = Number(amount);
  const presetAmounts = currency === "NGN"
    ? ["5000", "10000", "25000", "50000", "100000"]
    : ["25", "50", "100", "250", "500"];
  const formattedAmount = useMemo(() => {
    if (!Number.isFinite(numericAmount)) return "—";
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }, [currency, numericAmount]);

  const handleOnlineDonation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);

    if (!Number.isFinite(numericAmount) || numericAmount < 1) {
      setCheckoutError("Enter an amount of at least 1.00 to continue.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/donations/checkout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount.toFixed(2),
          currency,
          donor_name: isAnonymous ? "Anonymous" : donorName.trim(),
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          is_anonymous: isAnonymous,
          provider,
        }),
      });

      const result = (await response.json()) as CheckoutResponse;
      if (!response.ok || result.success === false) {
        throw new Error(result.detail || result.message || "We couldn't start checkout. Please try again.");
      }

      const checkoutUrl = result.data?.authorization_url;
      if (!checkoutUrl || !isProviderCheckoutUrl(checkoutUrl, provider)) {
        throw new Error(
          "The payment provider has not returned a valid checkout link. No payment was processed.",
        );
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "We couldn't connect to the payment service. Please try again later.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <PageIntro
        description="Make a considered contribution to the ministry work you care about. Your payment is handled by the selected provider."
        eyebrow="Giving"
        title="Give with purpose."
      />

      <section className="bg-[#f7f7f3] py-10 sm:py-14">
        <div className="mx-auto w-[min(1120px,calc(100%-2.25rem))]">
          <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Giving</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-ink">Secure checkout</span>
          </div>

          {/* Active Verification Status Loader */}
          {isVerifying && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/90 p-4 text-sm text-blue-950 shadow-xs animate-pulse">
              <Loader2 className="animate-spin text-brand-blue shrink-0" size={20} />
              <div>
                <p className="font-bold text-ink">Verifying payment authorization…</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Confirming transaction status with the provider gateway. Please wait a moment.
                </p>
              </div>
            </div>
          )}

          {/* Prominent Payment Return Notice */}
          {returnNotice && (
            <div
              className={`mb-6 flex items-start justify-between gap-3 rounded-xl border p-4.5 shadow-xs transition ${
                returnNotice.type === "warning"
                  ? "border-amber-300 bg-amber-50/95 text-amber-950"
                  : "border-red-300 bg-red-50/95 text-red-950"
              }`}
            >
              <div className="flex items-start gap-3">
                {returnNotice.type === "warning" ? (
                  <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
                ) : (
                  <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
                )}
                <div>
                  <h4 className="text-sm font-bold tracking-tight">{returnNotice.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {returnNotice.message}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    You can adjust your contribution details below and proceed whenever you are ready.
                  </p>
                </div>
              </div>
              <button
                className="rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-700"
                onClick={() => setReturnNotice(null)}
                title="Dismiss notice"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.75fr)] lg:gap-8">
            <form
              className="overflow-hidden border border-slate-200 bg-white shadow-sm"
              onSubmit={handleOnlineDonation}
            >
              <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
                <Eyebrow>Contribution details</Eyebrow>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
                  Set up your gift
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose where your contribution should go and how you would like to pay.
                </p>
              </div>

              <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="grid size-6 place-items-center border border-[#d8c9a9] font-serif text-xs text-brand-blue">1</span>
                    Choose a ministry designation
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {projects.map((project, index) => {
                      const Icon = index === 0
                        ? BookOpen
                        : index === 1
                          ? Globe2
                          : index === 2
                            ? Radio
                            : HeartHandshake;
                      const isSelected = selected === project.name;

                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`flex min-h-[88px] items-start gap-3 border p-4 text-left transition-colors ${
                            isSelected
                              ? "border-brand-blue bg-[#f2f5f8]"
                              : "border-slate-200 bg-white hover:border-slate-400"
                          }`}
                          key={project.id}
                          onClick={() => setSelected(project.name)}
                          type="button"
                        >
                          <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-brand-blue" size={18} />
                          <span className="min-w-0 flex-1">
                            <strong className="block text-xs font-bold leading-5 text-ink">{project.name}</strong>
                            <span className="mt-1 block text-[11px] leading-5 text-slate-600">
                              {project.description}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
                              isSelected ? "border-brand-blue bg-brand-blue text-white" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <Check size={10} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="grid size-6 place-items-center border border-[#d8c9a9] font-serif text-xs text-brand-blue">2</span>
                    Select payment method
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      {
                        id: "PAYSTACK",
                        title: "Paystack",
                        description: "Cards, bank transfer & USSD (processes in NGN ₦)",
                        badge: "NGN Only",
                        Icon: CreditCard,
                      },
                      {
                        id: "FLUTTERWAVE",
                        title: "Flutterwave",
                        description: "International cards, Apple Pay & transfers (USD $, GBP £, EUR €, CAD $)",
                        badge: "International",
                        Icon: Globe2,
                      },
                    ] as const).map(({ id, title, description, badge, Icon }) => (
                      <button
                        aria-pressed={provider === id}
                        className={`flex items-center gap-3 border px-4 py-4 text-left transition-colors ${
                          provider === id
                            ? "border-brand-blue bg-[#f2f5f8]"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                        key={id}
                        onClick={() => {
                          setProvider(id);
                          if (id === "PAYSTACK") {
                            setCurrency("NGN");
                            if (Number(amount) < 100) setAmount("10000");
                          }
                          if (id === "FLUTTERWAVE") {
                            if (currency === "NGN") setCurrency("USD");
                            if (Number(amount) > 1000) setAmount("25");
                          }
                        }}
                        type="button"
                      >
                        <Icon aria-hidden="true" className="text-brand-blue shrink-0" size={20} />
                        <span className="flex-1">
                          <span className="flex items-center gap-2">
                            <strong className="block text-sm text-ink">{title}</strong>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 uppercase">
                              {badge}
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-600">{description}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`size-4 rounded-full border shrink-0 ${
                            provider === id ? "border-[5px] border-brand-blue" : "border-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="grid size-6 place-items-center border border-[#d8c9a9] font-serif text-xs text-brand-blue">3</span>
                    Set the amount
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-[170px_1fr]">
                    <TextField
                      fullWidth
                      label="Currency"
                      onChange={(event) => {
                        const newCurr = event.target.value;
                        setCurrency(newCurr);
                        if (newCurr === "NGN") {
                          setProvider("PAYSTACK");
                          if (Number(amount) < 100) setAmount("10000");
                        } else {
                          setProvider("FLUTTERWAVE");
                          if (Number(amount) > 1000) setAmount("25");
                        }
                      }}
                      select
                      size="small"
                      value={currency}
                    >
                      <MenuItem value="NGN">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>NGN · ₦</span>
                          <span className="text-[10px] font-semibold text-slate-400">Paystack</span>
                        </div>
                      </MenuItem>
                      <MenuItem value="USD">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>USD · $</span>
                          <span className="text-[10px] font-semibold text-slate-400">Flutterwave</span>
                        </div>
                      </MenuItem>
                      <MenuItem value="GBP">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>GBP · £</span>
                          <span className="text-[10px] font-semibold text-slate-400">Flutterwave</span>
                        </div>
                      </MenuItem>
                      <MenuItem value="EUR">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>EUR · €</span>
                          <span className="text-[10px] font-semibold text-slate-400">Flutterwave</span>
                        </div>
                      </MenuItem>
                      <MenuItem value="CAD">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>CAD · C$</span>
                          <span className="text-[10px] font-semibold text-slate-400">Flutterwave</span>
                        </div>
                      </MenuItem>
                    </TextField>
                    <TextField
                      fullWidth
                      inputProps={{ min: 1, step: "0.01" }}
                      label="Contribution amount"
                      onChange={(event) => setAmount(event.target.value)}
                      required
                      size="small"
                      type="number"
                      value={amount}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {presetAmounts.map((preset) => (
                      <button
                        aria-pressed={amount === preset}
                        className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                          amount === preset
                            ? "border-brand-blue bg-brand-blue text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-brand-blue"
                        }`}
                        key={preset}
                        onClick={() => setAmount(preset)}
                        type="button"
                      >
                        {new Intl.NumberFormat("en", {
                          style: "currency",
                          currency,
                          maximumFractionDigits: 0,
                        }).format(Number(preset))}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="grid size-6 place-items-center border border-[#d8c9a9] font-serif text-xs text-brand-blue">4</span>
                    Your details
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      disabled={isAnonymous}
                      fullWidth
                      label="Full name"
                      onChange={(event) => setDonorName(event.target.value)}
                      required={!isAnonymous}
                      size="small"
                      value={donorName}
                    />
                    <TextField
                      fullWidth
                      helperText="Your payment confirmation will be sent here."
                      label="Email address"
                      onChange={(event) => setDonorEmail(event.target.value)}
                      required
                      size="small"
                      type="email"
                      value={donorEmail}
                    />
                    <TextField
                      className="sm:col-span-2"
                      fullWidth
                      label="Phone number (optional)"
                      onChange={(event) => setDonorPhone(event.target.value)}
                      size="small"
                      value={donorPhone}
                    />
                  </div>
                  <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-600">
                    <input
                      checked={isAnonymous}
                      className="mt-1 accent-brand-blue"
                      onChange={(event) => setIsAnonymous(event.target.checked)}
                      type="checkbox"
                    />
                    <span>Make this contribution anonymous in ministry records.</span>
                  </label>
                </fieldset>

                {checkoutError && (
                  <Alert severity="error">{checkoutError}</Alert>
                )}

                <div className="border-t border-slate-200 pt-5">
                  <Button
                    className="min-h-12"
                    disabled={isProcessing || projects.length === 0}
                    endIcon={<ArrowRight size={17} />}
                    fullWidth
                    type="submit"
                    variant="contained"
                  >
                    {isProcessing ? "Connecting to payment provider…" : "Continue to secure checkout"}
                  </Button>
                  <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
                    You’ll review and complete payment on the selected provider’s secure site.
                    HOREMOW does not store your card details.
                  </p>
                </div>
              </div>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-32">
              <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <Eyebrow>Giving summary</Eyebrow>
                <h2 className="mt-1 text-xl font-bold text-ink">Your contribution</h2>
                <div className="mt-5 space-y-4 border-y border-slate-200 py-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Designation</span>
                    <span className="max-w-[60%] text-right font-semibold text-ink">
                      {activeProject?.name ?? "Select a ministry"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Payment method</span>
                    <span className="font-semibold text-ink">{provider === "PAYSTACK" ? "Paystack" : provider === "FLUTTERWAVE" ? "Flutterwave" : "PayPal"}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4 py-5">
                  <span className="text-sm font-semibold text-slate-600">Total contribution</span>
                  <strong className="text-2xl font-bold tracking-tight text-brand-blue">{formattedAmount}</strong>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-600">
                  <LockKeyhole aria-hidden="true" className="mt-0.5 shrink-0 text-brand-blue" size={16} />
                  <p>
                    Your contribution is only confirmed after the payment provider completes the transaction and returns a verified result.
                  </p>
                </div>
              </div>

              <div className="border border-[#d8c9a9] bg-[#f7f5ef] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Heart aria-hidden="true" className="text-brand-blue" size={19} />
                  <h3 className="font-bold text-ink">Prefer a bank transfer?</h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Contact the finance office to confirm current official account details before making a transfer.
                </p>
                <a
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline"
                  href={`mailto:${contact.email}?subject=Official%20giving%20details`}
                >
                  <Mail size={15} /> Request transfer details
                </a>
              </div>

              <p className="flex items-center gap-2 px-1 text-[11px] leading-5 text-slate-500">
                <HeartHandshake aria-hidden="true" className="shrink-0 text-brand-blue" size={15} />
                Thank you for supporting the work of the ministry.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Official Receipt & Pastoral Appreciation Dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setReceiptModalOpen(false)}
        open={receiptModalOpen}
        PaperProps={{
          className: "rounded-2xl p-2",
        }}
      >
        <DialogTitle className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={22} />
            <span className="text-sm font-bold tracking-wider text-ink uppercase">
              Official Offering Receipt
            </span>
          </div>
          <button
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={() => setReceiptModalOpen(false)}
            type="button"
          >
            <X size={18} />
          </button>
        </DialogTitle>

        <DialogContent className="space-y-5 pt-6">
          <div className="py-2 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="mt-3 text-xl font-bold text-ink">Thank You for Your Offering!</h3>
            <p className="mt-1 text-xs text-slate-600">
              Your contribution to Holiness Revival Movement Worldwide has been confirmed and verified.
            </p>
          </div>

          {verifiedReceipt && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 py-1">
                <span className="font-medium text-slate-500">Receipt Reference</span>
                <span className="font-mono font-bold text-ink">{verifiedReceipt.reference}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 py-1">
                <span className="font-medium text-slate-500">Designation / Project</span>
                <span className="font-semibold text-ink">{verifiedReceipt.project}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 py-1">
                <span className="font-medium text-slate-500">Amount Received</span>
                <span className="text-base font-bold text-emerald-700">
                  {verifiedReceipt.currency} {Number(verifiedReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 py-1">
                <span className="font-medium text-slate-500">Contributor</span>
                <span className="font-semibold text-ink">{verifiedReceipt.donor_name || "Beloved in Christ"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-500">Payment Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <Check size={13} /> Verified & Received
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/80 p-3 text-xs text-emerald-900">
            <Mail className="mt-0.5 shrink-0 text-emerald-700" size={16} />
            <div>
              <p className="font-semibold">Official Receipt Dispatched via Email</p>
              <p className="mt-0.5 text-[11px] text-emerald-800">
                A formal acknowledgement and pastoral blessing from Pastor Paul Rika has been dispatched to{" "}
                <strong>{verifiedReceipt?.donor_email}</strong>.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200/50 bg-amber-50/60 p-3 text-center text-xs italic text-amber-900">
            &ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo;
            <div className="mt-1 font-sans text-[11px] font-bold text-amber-950 not-italic">— 2 Corinthians 9:7</div>
          </div>
        </DialogContent>

        <DialogActions className="flex justify-between border-t border-slate-100 p-4">
          <Button
            onClick={() => window.print()}
            size="small"
            startIcon={<Printer size={15} />}
            variant="outlined"
          >
            Print Receipt
          </Button>
          <Button
            onClick={() => setReceiptModalOpen(false)}
            size="small"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
