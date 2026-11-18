import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  ShieldCheck,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Alert,
  Button,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  getDirectoryContent,
  saveDirectoryContent,
  useDirectoryContent,
  type OverseerItem,
} from "../../lib/contentStore";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const CATEGORIES: OverseerItem["category"][] = [
  "International",
  "National",
  "Regional",
  "Departmental",
];

const ITEMS_PER_PAGE = 6;

export default function AdminUsersManager() {
  const leaders = useDirectoryContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [office, setOffice] = useState("");
  const [category, setCategory] = useState<OverseerItem["category"]>("National");
  const [country, setCountry] = useState("Nigeria");
  const [stateOrRegion, setStateOrRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [bio, setBio] = useState("");
  const [order, setOrder] = useState(10);
  const [isActive, setIsActive] = useState(true);

  const filteredLeaders = useMemo(() => {
    return leaders.filter((l) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.office.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.stateOrRegion.toLowerCase().includes(q) ||
        l.bio.toLowerCase().includes(q);

      const matchesCat = categoryFilter === "ALL" || l.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [leaders, debouncedSearch, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaders.length / ITEMS_PER_PAGE));
  const paginatedLeaders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeaders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeaders, currentPage]);

  const openCreateModal = () => {
    setEditingLeaderId(null);
    setName("");
    setOffice("");
    setCategory("National");
    setCountry("Nigeria");
    setStateOrRegion("");
    setPhone("+234 800 000 0000");
    setEmail("leader@horemow.org");
    setOfficeAddress("HOREMOW International Secretariat, Abuja");
    setPortraitUrl("");
    setBio("");
    setOrder(leaders.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (leader: OverseerItem) => {
    setEditingLeaderId(leader.id);
    setName(leader.name);
    setOffice(leader.office);
    setCategory(leader.category);
    setCountry(leader.country);
    setStateOrRegion(leader.stateOrRegion);
    setPhone(leader.phone);
    setEmail(leader.email);
    setOfficeAddress(leader.officeAddress);
    setPortraitUrl(leader.portraitUrl);
    setBio(leader.bio);
    setOrder(leader.order);
    setIsActive(leader.isActive);
    setIsModalOpen(true);
  };

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setPortraitUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleSaveLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !office.trim()) {
      setStatus({ type: "error", text: "Please provide leader's name and office designation." });
      return;
    }

    const currentAll = getDirectoryContent();

    if (editingLeaderId) {
      const updated = currentAll.map((l) => {
        if (l.id === editingLeaderId) {
          return {
            ...l,
            name: name.trim(),
            office: office.trim(),
            category,
            country: country.trim(),
            stateOrRegion: stateOrRegion.trim(),
            phone: phone.trim(),
            email: email.trim(),
            officeAddress: officeAddress.trim(),
            portraitUrl: portraitUrl.trim() || l.portraitUrl,
            bio: bio.trim(),
            order,
            isActive,
          };
        }
        return l;
      });
      saveDirectoryContent(updated);
      setStatus({ type: "success", text: `Leader profile for "${name}" updated successfully.` });
    } else {
      const newLeader: OverseerItem = {
        id: `dir-${Date.now()}`,
        name: name.trim(),
        office: office.trim(),
        category,
        country: country.trim(),
        stateOrRegion: stateOrRegion.trim() || country.trim(),
        phone: phone.trim(),
        email: email.trim(),
        officeAddress: officeAddress.trim(),
        portraitUrl:
          portraitUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
        bio: bio.trim() || `${name} serves in ministry oversight.`,
        order,
        isActive,
      };
      saveDirectoryContent([...currentAll, newLeader]);
      setStatus({ type: "success", text: `Leader profile for "${name}" created.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, leaderName: string) => {
    if (window.confirm(`Are you sure you want to remove leader profile "${leaderName}"?`)) {
      const updated = getDirectoryContent().filter((l) => l.id !== id);
      saveDirectoryContent(updated);
      setStatus({ type: "success", text: "Leader removed from directory." });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {status && (
        <Alert
          icon={status.type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
          severity={status.type}
        >
          {status.text}
        </Alert>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <Users size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Ministry Administration & Leadership CMS</h2>
            <p className="text-xs text-slate-500">
              Manage executive leadership profiles, national overseers, photos, and ministry credentials.
            </p>
          </div>
        </div>

        <Button
          onClick={openCreateModal}
          startIcon={<Plus size={16} />}
          sx={{
            backgroundColor: "#1A4B8C",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            py: 1,
            "&:hover": { backgroundColor: "#143A6D" },
          }}
          variant="contained"
        >
          Add New Leader
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-12 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="sm:col-span-8">
          <TextField
            fullWidth
            InputProps={{
              startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
            }}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search leaders by name, office, jurisdiction, or bio..."
            size="small"
            value={searchInput}
          />
        </div>

        <div className="sm:col-span-4">
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={categoryFilter}
            >
              <MenuItem value="ALL">All Categories ({leaders.length})</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat} Leadership
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Leaders List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Active Ministry Leaders ({filteredLeaders.length})</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedLeaders.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No leaders found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or add a new leader.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedLeaders.map((leader) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={leader.id}
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 sm:size-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm relative">
                    <img
                      alt={leader.name}
                      className="size-full object-cover"
                      src={leader.portraitUrl}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                        {leader.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {leader.country} · {leader.stateOrRegion}
                      </span>
                      {!leader.isActive && (
                        <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{leader.name}</h4>
                    <p className="text-xs font-semibold text-brand-green flex items-center gap-1">
                      <ShieldCheck size={12} /> {leader.office}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{leader.bio}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                      {leader.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} className="text-slate-400" /> {leader.phone}
                        </span>
                      )}
                      {leader.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} className="text-slate-400" /> {leader.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(leader)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit CMS
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(leader.id, leader.name)}
                    size="small"
                    startIcon={<Trash2 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              size="small"
              startIcon={<ChevronLeft size={16} />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  className={`size-7 rounded text-xs font-bold transition ${
                    currentPage === idx + 1
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  type="button"
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              size="small"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* LEADER EDITOR MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingLeaderId ? "Edit Leader Profile (CMS)" : "Add New Ministry Leader (CMS)"}
        </DialogTitle>
        <form onSubmit={handleSaveLeader}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Full Name *"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pastor John Momoh"
                required
                size="small"
                value={name}
              />
              <TextField
                fullWidth
                label="Office / Ministry Title *"
                onChange={(e) => setOffice(e.target.value)}
                placeholder="e.g. National Overseer, Nigeria"
                required
                size="small"
                value={office}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  onChange={(e) => setCategory(e.target.value as OverseerItem["category"])}
                  value={category}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat} Leadership
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Country of Service *"
                onChange={(e) => setCountry(e.target.value)}
                required
                size="small"
                value={country}
              />
              <TextField
                fullWidth
                label="State / Region"
                onChange={(e) => setStateOrRegion(e.target.value)}
                placeholder="e.g. Abuja Secretariat / Lagos"
                size="small"
                value={stateOrRegion}
              />
              <TextField
                fullWidth
                label="Display Order (Sort priority)"
                onChange={(e) => setOrder(Number(e.target.value) || 1)}
                size="small"
                type="number"
                value={order}
              />
            </div>

            {/* Portrait Image Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-2 block">
                Leader Portrait Photograph Upload *
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Image URL or Cloudinary Link"
                    onChange={(e) => setPortraitUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={portraitUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    <Upload size={14} /> Upload Photo
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handlePortraitUpload}
                      type="file"
                    />
                  </label>
                  {portraitUrl && (
                    <img
                      alt="Leader"
                      className="size-10 rounded-full object-cover border border-slate-200"
                      src={portraitUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Official Phone Number"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 714 9901"
                size="small"
                value={phone}
              />
              <TextField
                fullWidth
                label="Official Email Address"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="overseer@horemow.org"
                size="small"
                value={email}
              />
            </div>

            <TextField
              fullWidth
              label="Secretariat / Office Physical Address"
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="Plot 14, Commercial District, Abuja, Nigeria"
              size="small"
              value={officeAddress}
            />

            <TextField
              fullWidth
              label="Leader Biography & Ministry Scope"
              multiline
              onChange={(e) => setBio(e.target.value)}
              placeholder="Coordinating all zonal assemblies, national camp meetings, and state coordinators..."
              rows={3}
              size="small"
              value={bio}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Active Profile (Visible in public Directory and Leadership Section)"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              sx={{
                backgroundColor: "#1A4B8C",
                color: "#ffffff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": { backgroundColor: "#143A6D" },
              }}
              type="submit"
              variant="contained"
            >
              {editingLeaderId ? "Save Profile Changes" : "Save Leader Profile"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
