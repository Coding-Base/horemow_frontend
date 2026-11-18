import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Mail, MapPin, Phone, Search, Send, Users, X } from "lucide-react";
import PageIntro from "../components/common/PageIntro";
import {
  recordPageView,
  useDirectoryContent,
  type OverseerItem,
} from "../lib/contentStore";

const categories = [
  { label: "All leaders", value: "ALL" },
  { label: "International", value: "International" },
  { label: "National", value: "National" },
  { label: "Regional", value: "Regional" },
  { label: "Departments", value: "Departmental" },
] as const;

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
};

export default function DirectoryPage() {
  const directory = useDirectoryContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedLeader, setSelectedLeader] = useState<OverseerItem | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    recordPageView("/directory");
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return directory.filter((item) => {
      if (!item.isActive || (categoryFilter !== "ALL" && item.category !== categoryFilter)) {
        return false;
      }
      return (
        !query ||
        [item.name, item.office, item.country, item.stateOrRegion]
          .some((value) => value.toLowerCase().includes(query))
      );
    });
  }, [categoryFilter, directory, searchTerm]);

  const handleSendInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inquiryEmail || !inquiryMessage) return;
    setInquirySent(true);
  };

  const closeInquiry = () => {
    setSelectedLeader(null);
    setInquirySent(false);
    setInquiryName("");
    setInquiryEmail("");
    setInquiryPhone("");
    setInquirySubject("");
    setInquiryMessage("");
  };

  return (
    <MotionConfig reducedMotion="user">
      <PageIntro
        description="Find ministry leaders and regional contacts serving HOREMOW communities around the world."
        eyebrow="The people who serve"
        title="Leadership directory."
      />

      <section className="border-b border-[#d8c9a9] bg-[#f7f5ef] py-7 sm:py-9">
        <div className="mx-auto flex w-[min(1200px,calc(100%-2.25rem))] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <blockquote className="max-w-3xl font-serif text-sm leading-6 text-slate-700 sm:text-base">
            “Remember them which have the rule over you, who have spoken unto you the word of God.”
            <cite className="mt-1 block font-sans text-[10px] font-bold uppercase not-italic tracking-[.16em] text-brand-blue">
              Hebrews 13:7
            </cite>
          </blockquote>
          <div className="flex items-center gap-3 border-l-2 border-[#d8c9a9] pl-4 text-sm text-slate-600">
            <Users aria-hidden="true" className="text-brand-blue" size={20} />
            <span><strong className="text-ink">{filtered.length}</strong> listed leaders</span>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f3] py-12 sm:py-16">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-blue">
                Global ministry
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em] text-ink sm:text-4xl">
                A directory for connection.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Browse by ministry level or search for a leader, office or location.
              </p>
            </div>
            <label className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15 lg:max-w-md">
              <Search aria-hidden="true" className="shrink-0 text-brand-blue" size={18} />
              <input
                aria-label="Search leaders"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, office or location"
                type="search"
                value={searchTerm}
              />
              {searchTerm && (
                <button
                  aria-label="Clear search"
                  className="grid size-8 place-items-center rounded text-slate-500 hover:bg-slate-100"
                  onClick={() => setSearchTerm("")}
                  type="button"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          <div aria-label="Filter leaders by ministry level" className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {categories.map(({ label, value }) => (
              <button
                aria-pressed={categoryFilter === value}
                className={`shrink-0 border px-4 py-2 text-xs font-semibold transition-colors ${
                  categoryFilter === value
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue"
                }`}
                key={value}
                onClick={() => setCategoryFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                animate="visible"
                className="mt-7 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                key={`${categoryFilter}-${searchTerm}`}
                variants={listVariants}
              >
                {filtered.map((leader) => (
                  <motion.article
                    className="group flex flex-col border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
                    key={leader.id}
                    layout
                    variants={cardVariants}
                  >
                    <div className="h-1 bg-brand-blue transition-colors group-hover:bg-[#c49b4a]" />
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <img
                          alt={leader.name}
                          className="size-[76px] shrink-0 border border-[#d8c9a9] bg-[#f1eee6] object-cover"
                          loading="lazy"
                          src={leader.portraitUrl}
                        />
                        <div className="min-w-0 pt-1">
                          <span className="text-[9px] font-bold uppercase tracking-[.16em] text-brand-blue">
                            {leader.category}
                          </span>
                          <h3 className="mt-1 text-lg font-bold leading-tight tracking-[-.025em] text-ink">
                            {leader.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                            {leader.office}
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 line-clamp-3 text-xs leading-6 text-slate-600">
                        {leader.bio}
                      </p>

                      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-xs">
                        <p className="flex items-center gap-2 text-slate-700">
                          <MapPin aria-hidden="true" className="shrink-0 text-brand-blue" size={15} />
                          <span className="truncate">{leader.stateOrRegion}, {leader.country}</span>
                        </p>
                        <a
                          className="flex items-center gap-2 text-slate-700 hover:text-brand-blue"
                          href={`tel:${leader.phone.replaceAll(" ", "")}`}
                        >
                          <Phone aria-hidden="true" className="shrink-0 text-brand-blue" size={15} />
                          {leader.phone}
                        </a>
                        <a
                          className="flex min-w-0 items-center gap-2 text-slate-700 hover:text-brand-blue"
                          href={`mailto:${leader.email}`}
                        >
                          <Mail aria-hidden="true" className="shrink-0 text-brand-blue" size={15} />
                          <span className="truncate">{leader.email}</span>
                        </a>
                      </div>

                      {leader.officeAddress && (
                        <p className="mt-4 border-l-2 border-[#d8c9a9] bg-[#f7f5ef] px-3 py-2 text-[11px] leading-5 text-slate-600">
                          <strong className="text-ink">Office</strong> · {leader.officeAddress}
                        </p>
                      )}

                      <div className="mt-auto flex gap-3 pt-5">
                        <Button
                          className="flex-1"
                          href={`tel:${leader.phone.replaceAll(" ", "")}`}
                          size="small"
                          variant="outlined"
                        >
                          Call office
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setSelectedLeader(leader);
                            setInquirySent(false);
                          }}
                          size="small"
                          variant="contained"
                        >
                          Send a message
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
                exit={{ opacity: 0, y: 8 }}
                initial={{ opacity: 0, y: 8 }}
                key="empty"
              >
                <Search aria-hidden="true" className="mx-auto text-brand-blue" size={24} />
                <h3 className="mt-3 font-bold text-ink">No leaders found</h3>
                <p className="mt-1 text-sm text-slate-600">Try another name, location or ministry level.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Dialog fullWidth maxWidth="sm" onClose={closeInquiry} open={Boolean(selectedLeader)}>
        {selectedLeader && (
          <div className="p-6 sm:p-8">
            <DialogTitle className="border-b border-slate-200 p-0 pb-4">
              <div className="flex items-center gap-3">
                <img
                  alt=""
                  className="size-12 border border-[#d8c9a9] object-cover"
                  src={selectedLeader.portraitUrl}
                />
                <div>
                  <h3 className="text-base font-bold text-ink">Contact {selectedLeader.name}</h3>
                  <p className="text-xs font-medium text-brand-blue">
                    {selectedLeader.office} · {selectedLeader.country}
                  </p>
                </div>
              </div>
            </DialogTitle>
            <DialogContent className="p-0 pt-5">
              {inquirySent ? (
                <div className="space-y-3 py-6">
                  <h4 className="text-lg font-bold text-ink">Message form preview</h4>
                  <p className="text-sm leading-6 text-slate-600">
                    Messaging is not connected yet. Your message has not been sent. Please contact the leader directly using the email or phone listed in the directory.
                  </p>
                  <Button onClick={closeInquiry} variant="contained">Close</Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSendInquiry}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      fullWidth
                      label="Your name"
                      onChange={(event) => setInquiryName(event.target.value)}
                      required
                      size="small"
                      value={inquiryName}
                    />
                    <TextField
                      fullWidth
                      label="Email address"
                      onChange={(event) => setInquiryEmail(event.target.value)}
                      required
                      size="small"
                      type="email"
                      value={inquiryEmail}
                    />
                    <TextField
                      fullWidth
                      label="Phone (optional)"
                      onChange={(event) => setInquiryPhone(event.target.value)}
                      size="small"
                      value={inquiryPhone}
                    />
                    <TextField
                      fullWidth
                      label="Subject"
                      onChange={(event) => setInquirySubject(event.target.value)}
                      required
                      size="small"
                      value={inquirySubject}
                    />
                  </div>
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    onChange={(event) => setInquiryMessage(event.target.value)}
                    required
                    rows={4}
                    size="small"
                    value={inquiryMessage}
                  />
                  <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                    <Button onClick={closeInquiry} variant="outlined">Cancel</Button>
                    <Button startIcon={<Send size={15} />} type="submit" variant="contained">
                      Preview message
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </div>
        )}
      </Dialog>
    </MotionConfig>
  );
}
