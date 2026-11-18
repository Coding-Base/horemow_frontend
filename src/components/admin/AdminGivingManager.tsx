import React, { useState, useMemo } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  Building2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  getGivingContent,
  saveGivingContent,
  useGivingContent,
  type GivingProject,
} from "../../lib/contentStore";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const ITEMS_PER_PAGE = 5;

export default function AdminGivingManager() {
  const projects = useGivingContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Pagination
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [isActive, setIsActive] = useState(true);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = debouncedSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.bankDetails && p.bankDetails.toLowerCase().includes(q))
      );
    });
  }, [projects, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const openCreateModal = () => {
    setEditingProjectId(null);
    setName("");
    setDescription("");
    setTargetGoal("₦50,000,000 / $35,000");
    setThumbnailUrl("");
    setBankDetails("Bank: Zenith Bank | Acc: 1012345678 | Name: HOREMOW Ministry");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: GivingProject) => {
    setEditingProjectId(p.id);
    setName(p.name);
    setDescription(p.description);
    setTargetGoal(p.targetGoal || "");
    setThumbnailUrl(p.thumbnailUrl || "");
    setBankDetails(p.bankDetails || "");
    setIsActive(p.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setThumbnailUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ type: "error", text: "Please provide a fund designation name." });
      return;
    }

    const currentAll = getGivingContent();

    if (editingProjectId) {
      const updated = currentAll.map((p) => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            name: name.trim(),
            description: description.trim(),
            targetGoal: targetGoal.trim(),
            thumbnailUrl: thumbnailUrl.trim() || p.thumbnailUrl,
            bankDetails: bankDetails.trim(),
            isActive,
          };
        }
        return p;
      });
      saveGivingContent(updated);
      setStatus({ type: "success", text: `Giving project "${name}" updated successfully.` });
    } else {
      const newProject: GivingProject = {
        id: `give-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || `Support the ${name} initiative of HOREMOW.`,
        targetGoal: targetGoal.trim(),
        thumbnailUrl:
          thumbnailUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
        bankDetails: bankDetails.trim() || "Contact ministry for bank details.",
        isActive,
      };
      saveGivingContent([...currentAll, newProject]);
      setStatus({ type: "success", text: `Giving project "${name}" added.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to remove fund "${projectName}"?`)) {
      const updated = getGivingContent().filter((p) => p.id !== id);
      saveGivingContent(updated);
      setStatus({ type: "success", text: "Giving fund removed." });
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
            <Wallet size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Donation & Ministry Funds Manager</h2>
            <p className="text-xs text-slate-500">
              Manage designated giving projects, goals, bank account details, and online payment channels.
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
          Create Giving Fund
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <TextField
          fullWidth
          InputProps={{
            startAdornment: <Search className="mr-2 text-slate-400" size={18} />,
          }}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search giving projects by name, description, or bank account..."
          size="small"
          value={searchInput}
        />
      </div>

      {/* Projects Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Active Ministry Funds ({filteredProjects.length})</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedProjects.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No giving funds found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria or create a new giving fund.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedProjects.map((p) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={p.id}
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 sm:size-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm">
                    <img
                      alt={p.name}
                      className="size-full object-cover"
                      src={
                        p.thumbnailUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg"
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.isActive ?? true
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.isActive ?? true ? "Active" : "Archived"}
                      </span>
                      {p.targetGoal && (
                        <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                          <TrendingUp size={12} /> Target: {p.targetGoal}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">{p.description}</p>

                    {p.bankDetails && (
                      <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1 flex items-center gap-1.5">
                        <Building2 size={12} className="text-brand-blue shrink-0" />
                        <span>{p.bankDetails}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(p)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(p.id, p.name)}
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

      {/* GIVING PROJECT EDITOR MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingProjectId ? "Edit Giving Project / Fund" : "Create New Giving Project / Fund"}
        </DialogTitle>
        <form onSubmit={handleSaveProject}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Fund Designation Name *"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Free Bibles & Literature Distribution"
                required
                size="small"
                value={name}
              />
              <TextField
                fullWidth
                helperText="e.g. ₦50,000,000 / $35,000"
                label="Target Financial Goal (Optional)"
                onChange={(e) => setTargetGoal(e.target.value)}
                size="small"
                value={targetGoal}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-ink mb-2 block">
                Fund Feature Image / Thumbnail
              </span>
              <div className="grid gap-3 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8">
                  <TextField
                    fullWidth
                    label="Image URL or Cloudinary Link"
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    size="small"
                    value={thumbnailUrl}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    <Upload size={14} /> Upload Image
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      type="file"
                    />
                  </label>
                  {thumbnailUrl && (
                    <img
                      alt="Thumbnail"
                      className="size-10 rounded object-cover border border-slate-200"
                      src={thumbnailUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            <TextField
              fullWidth
              label="Fund Purpose & Description *"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how funds will be utilized for literature printing, logistics, or crusade outreaches..."
              rows={3}
              size="small"
              value={description}
            />

            <TextField
              fullWidth
              helperText="e.g. Bank: Zenith Bank | Account: 1012345678 | Name: HOREMOW Literature Ministry"
              label="Designated Bank Transfer Details"
              multiline
              onChange={(e) => setBankDetails(e.target.value)}
              rows={2}
              size="small"
              value={bankDetails}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Active Project (Visible in public Giving Portal)"
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
              {editingProjectId ? "Save Fund Changes" : "Create Fund"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
