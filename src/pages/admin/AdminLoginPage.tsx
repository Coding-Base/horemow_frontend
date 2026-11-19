import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  MotionConfig,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cross,
  KeyRound,
  LockKeyhole,
  UserPlus,
} from "lucide-react";
import { Alert, Button, MenuItem, TextField } from "@mui/material";
import Logo from "../../components/layout/Logo";
import { loginAdmin, registerAdmin } from "../../lib/auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [role, setRole] = useState("SUPERADMIN");

  const changeMode = (registering: boolean) => {
    setIsRegistering(registering);
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(loginEmail, loginPassword);
      setSuccessMsg("Signed in successfully. Redirecting to the dashboard…");
      window.setTimeout(() => navigate("/admin/dashboard"), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please check both fields.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (!authCode.trim()) {
      setError("SuperAdmin authentication code is required.");
      return;
    }

    setLoading(true);
    try {
      await registerAdmin({
        email: regEmail,
        password: regPassword,
        first_name: firstName,
        last_name: lastName,
        role,
        auth_code: authCode,
      });
      setSuccessMsg("Administrator account created. Redirecting to the dashboard…");
      window.setTimeout(() => navigate("/admin/dashboard"), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create the administrator account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#071523] px-4 py-8 sm:px-8 lg:min-h-svh lg:py-12">
        <video
          aria-hidden="true"
          autoPlay
          className="fixed inset-0 -z-20 size-full object-cover"
          data-testid="admin-auth-video"
          loop
          muted
          playsInline
          preload="auto"
          src="/video.mp4"
        />
        <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#071523]/65" />
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-[linear-gradient(115deg,rgba(5,16,29,.92)_0%,rgba(7,25,42,.78)_48%,rgba(7,21,35,.68)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -left-40 top-1/4 -z-10 size-[520px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -left-24 top-[28%] -z-10 size-[360px] rounded-full border border-[#e5be64]/15"
        />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(440px,.82fr)] lg:gap-16">
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="hidden text-white lg:block"
            initial={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Logo inverse size="lg" />
            <p className="mt-16 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#e5be64]">
              <span className="h-px w-8 bg-[#e5be64]" />
              HOREMOW administration
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[.98] tracking-[-.06em] xl:text-7xl">
              Serving the work.
              <br />
              <span className="font-serif font-normal italic text-[#e5be64]">
                Strengthening the mission.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-200">
              A dedicated space for authorized ministry teams to care for resources,
              communications and the life of the movement.
            </p>
            <div className="mt-12 flex max-w-lg items-center gap-4 border-t border-white/20 pt-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#e5be64]/50 text-[#e5be64]">
                <Cross size={20} strokeWidth={1.4} />
              </span>
              <p className="font-serif text-sm italic leading-6 text-slate-200">
                “Let all things be done decently and in order.”
                <span className="mt-1 block font-sans text-[9px] font-bold uppercase tracking-[.17em] text-[#e5be64]">
                  1 Corinthians 14:40
                </span>
              </p>
            </div>
          </motion.section>

          <motion.section
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby="admin-auth-title"
            className="mx-auto w-full max-w-xl overflow-hidden border border-white/50 bg-[#fbfaf7] shadow-[0_32px_100px_rgba(0,0,0,.4)]"
            initial={{ opacity: 0, y: 22 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.08 }}
          >
            <div className="h-1 bg-gradient-to-r from-[#d0ad60] via-[#f0d998] to-[#1a4b8c]" />
            <div className="p-6 sm:p-9 lg:p-10">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <Logo size="md" />
                <span className="hidden border border-[#d8c9a9] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-brand-blue sm:inline-flex">
                  Ministry portal
                </span>
              </div>

              <div className="mt-7">
                <p className="text-[9px] font-bold uppercase tracking-[.22em] text-brand-blue">
                  {isRegistering ? "Account registration" : "Authorized personnel"}
                </p>
                <h2
                  className="mt-2 text-3xl font-bold tracking-[-.045em] text-ink sm:text-[2.1rem]"
                  id="admin-auth-title"
                >
                  {isRegistering ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">
                  {isRegistering
                    ? "Set up an administrator account to access ministry tools."
                    : "Sign in to continue to the HOREMOW administration portal."}
                </p>
              </div>

              <div aria-label="Account access options" className="mt-6 grid grid-cols-2 border-b border-slate-200">
                <button
                  aria-pressed={!isRegistering}
                  className={`relative flex min-h-11 items-center justify-center gap-2 text-xs font-bold transition-colors ${
                    !isRegistering ? "text-brand-blue" : "text-slate-500 hover:text-ink"
                  }`}
                  onClick={() => changeMode(false)}
                  type="button"
                >
                  <KeyRound size={14} /> Sign in
                  {!isRegistering && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-blue" />}
                </button>
                <button
                  aria-pressed={isRegistering}
                  className={`relative flex min-h-11 items-center justify-center gap-2 text-xs font-bold transition-colors ${
                    isRegistering ? "text-brand-blue" : "text-slate-500 hover:text-ink"
                  }`}
                  onClick={() => changeMode(true)}
                  type="button"
                >
                  <UserPlus size={14} /> Create account
                  {isRegistering && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-blue" />}
                </button>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  exit={{ opacity: 0, y: -8 }}
                  key={isRegistering ? "register" : "login"}
                  transition={{ duration: 0.2 }}
                >
                  {error && (
                    <Alert className="mt-5" severity="error">
                      {error}
                    </Alert>
                  )}
                  {successMsg && (
                    <Alert className="mt-5" severity="success" icon={<CheckCircle2 size={16} />}>
                      {successMsg}
                    </Alert>
                  )}

                  {!isRegistering ? (
                    <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
                      <TextField
                        autoComplete="username"
                        autoFocus
                        fullWidth
                        label="Administrator email"
                        onChange={(event) => setLoginEmail(event.target.value)}
                        required
                        size="medium"
                        type="email"
                        value={loginEmail}
                      />
                      <TextField
                        autoComplete="current-password"
                        fullWidth
                        label="Password"
                        onChange={(event) => setLoginPassword(event.target.value)}
                        required
                        size="medium"
                        type="password"
                        value={loginPassword}
                      />
                      <Button
                        className="mt-1 min-h-12 font-bold tracking-wide"
                        disabled={loading}
                        endIcon={<ArrowRight size={17} />}
                        fullWidth
                        type="submit"
                        variant="contained"
                      >
                        {loading ? "Signing in…" : "Sign in to administration"}
                      </Button>
                    </form>
                  ) : (
                    <form className="mt-6 grid gap-3.5" onSubmit={handleRegister}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextField
                          autoComplete="given-name"
                          fullWidth
                          label="First name"
                          onChange={(event) => setFirstName(event.target.value)}
                          required
                          size="small"
                          value={firstName}
                        />
                        <TextField
                          autoComplete="family-name"
                          fullWidth
                          label="Last name"
                          onChange={(event) => setLastName(event.target.value)}
                          required
                          size="small"
                          value={lastName}
                        />
                      </div>
                      <TextField
                        autoComplete="email"
                        fullWidth
                        label="Official email address"
                        onChange={(event) => setRegEmail(event.target.value)}
                        required
                        size="small"
                        type="email"
                        value={regEmail}
                      />
                      <TextField
                        fullWidth
                        label="Administrative role"
                        onChange={(event) => setRole(event.target.value)}
                        select
                        size="small"
                        value={role}
                      >
                        <MenuItem value="SUPERADMIN">Super Administrator</MenuItem>
                        <MenuItem value="CONTENT_EDITOR">Content Editor</MenuItem>
                        <MenuItem value="FINANCE_AUDITOR">Finance Auditor</MenuItem>
                        <MenuItem value="MODERATOR">Community Moderator</MenuItem>
                      </TextField>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextField
                          autoComplete="new-password"
                          fullWidth
                          helperText="At least 8 characters"
                          label="Password"
                          onChange={(event) => setRegPassword(event.target.value)}
                          required
                          size="small"
                          type="password"
                          value={regPassword}
                        />
                        <TextField
                          autoComplete="new-password"
                          fullWidth
                          label="Confirm password"
                          onChange={(event) => setRegConfirmPassword(event.target.value)}
                          required
                          size="small"
                          type="password"
                          value={regConfirmPassword}
                        />
                      </div>
                      <TextField
                        autoComplete="off"
                        fullWidth
                        helperText=""
                        label="SuperAdmin Authentication Code"
                        onChange={(event) => setAuthCode(event.target.value)}
                        placeholder="Enter authorization passcode from .env"
                        required
                        size="small"
                        type="password"
                        value={authCode}
                      />
                      <Button
                        className="mt-1 min-h-12 font-bold tracking-wide"
                        disabled={loading}
                        endIcon={<ArrowRight size={17} />}
                        fullWidth
                        type="submit"
                        variant="contained"
                      >
                        {loading ? "Creating account…" : "Create administrator account"}
                      </Button>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-start gap-2 border-t border-slate-200 pt-4 text-[10px] leading-5 text-slate-500">
                <LockKeyhole className="mt-0.5 shrink-0 text-brand-blue" size={14} />
                <p>Access is for authorized ministry personnel. Keep your sign-in details private.</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <Link
                  className="inline-flex items-center gap-1.5 font-bold text-brand-blue hover:underline"
                  to="/"
                >
                  <ArrowLeft size={14} /> Back to website
                </Link>
                <Link className="font-medium text-slate-500 hover:text-brand-blue" to="/admin/dashboard">
                  Admin dashboard <ArrowRight className="ml-1 inline" size={13} />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </MotionConfig>
  );
}
