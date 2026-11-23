import { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  CheckCircle2,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Eyebrow from "../common/Eyebrow";
import SectionHeading from "../common/SectionHeading";
import {
  getLocationsContent,
  saveDirectoryContent,
  saveLocationsContent,
  useDirectoryContent,
  type OverseerItem,
} from "../../lib/contentStore";
import { fileToDataUrl } from "../../lib/imageUpload";
import { showToast } from "../../lib/soundToast";

export default function AdminDirectoryManager() {
  const directory = useDirectoryContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [editingItem, setEditingItem] = useState<OverseerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [office, setOffice] = useState("");
  const [category, setCategory] = useState<"International" | "National" | "Regional" | "Departmental">("National");
  const [country, setCountry] = useState("Nigeria");
  const [stateOrRegion, setStateOrRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPortrait(true);
      const url = await fileToDataUrl(file, "horemow_directory");
      setPortraitUrl(url);
      showToast("Portrait photo uploaded successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      showToast(msg, "error");
    } finally {
      setIsUploadingPortrait(false);
    }
  };

  const handleRemovePortrait = () => {
    setPortraitUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filtered = directory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.office.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stateOrRegion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setOffice("");
    setCategory("National");
    setCountry("Nigeria");
    setStateOrRegion("");
    setPhone("");
    setEmail("");
    setOfficeAddress("");
    setPortraitUrl("");
    setBio("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: OverseerItem) => {
    setEditingItem(item);
    setName(item.name);
    setOffice(item.office);
    setCategory(item.category);
    setCountry(item.country);
    setStateOrRegion(item.stateOrRegion);
    setPhone(item.phone);
    setEmail(item.email);
    setOfficeAddress(item.officeAddress);
    setPortraitUrl(item.portraitUrl);
    setBio(item.bio);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !office.trim()) {
      showToast("Please provide the leader's full name and office role.", "error");
      return;
    }

    try {
      const defaultAvatar = "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg";
      const resolvedPortrait = portraitUrl.trim() || (editingItem ? editingItem.portraitUrl : defaultAvatar);

      let updatedList: OverseerItem[];
      if (editingItem) {
        // Update
        updatedList = directory.map((d) =>
          d.id === editingItem.id
            ? {
                ...d,
                name: name.trim(),
                office: office.trim(),
                category,
                country: country.trim(),
                stateOrRegion: stateOrRegion.trim(),
                phone: phone.trim(),
                email: email.trim(),
                officeAddress: officeAddress.trim(),
                portraitUrl: resolvedPortrait,
                bio: bio.trim(),
              }
            : d
        );
        showToast(`Updated record for ${name} successfully!`, "success");
      } else {
        // Create
        const newItem: OverseerItem = {
          id: `dir-${Date.now()}`,
          name: name.trim(),
          office: office.trim(),
          category,
          country: country.trim(),
          stateOrRegion: stateOrRegion.trim(),
          phone: phone.trim(),
          email: email.trim(),
          officeAddress: officeAddress.trim(),
          portraitUrl: resolvedPortrait,
          bio: bio.trim(),
          order: directory.length + 1,
          isActive: true,
        };
        updatedList = [...directory, newItem];
        showToast(`Created new overseer record for ${name}!`, "success");
      }

      saveDirectoryContent(updatedList);

      // Two-way sync: If this leader oversees a region/state, also update locations
      if (stateOrRegion.trim()) {
        const locations = getLocationsContent();
        let locationChanged = false;
        const updatedLocations = locations.map((loc) => {
          if (
            loc.stateOrArea?.toLowerCase().includes(stateOrRegion.toLowerCase()) ||
            stateOrRegion.toLowerCase().includes(loc.stateOrArea?.toLowerCase() || "")
          ) {
            locationChanged = true;
            return {
              ...loc,
              overseerName: name.trim(),
              overseerTitle: office.trim(),
              overseerPhone: phone.trim() || loc.overseerPhone,
              overseerEmail: email.trim() || loc.overseerEmail,
              overseerPhotoUrl: resolvedPortrait || loc.overseerPhotoUrl,
            };
          }
          return loc;
        });
        if (locationChanged) {
          saveLocationsContent(updatedLocations);
        }
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save overseer details.";
      showToast(msg, "error");
    }
  };

  const handleDelete = (id: string, overseerName: string) => {
    if (confirm(`Are you sure you want to remove ${overseerName} from the directory?`)) {
      const updated = directory.filter((d) => d.id !== id);
      saveDirectoryContent(updated);
      showToast(`Removed ${overseerName} from leadership directory.`, "success");
    }
  };

  const handleToggleActive = (id: string) => {
    const target = directory.find((d) => d.id === id);
    const updated = directory.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    saveDirectoryContent(updated);
    if (target) {
      showToast(
        `${target.name} is now ${!target.isActive ? "published and visible" : "hidden (inactive)"}.`,
        "info"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>Leadership Administration</Eyebrow>
          <SectionHeading
            description="Manage international, continental, national, and regional overseers and departmental director contacts for public directory publishing."
            title="Overseers & Contacts Directory"
          />
        </div>
        <Button
          className="font-bold self-start sm:self-auto"
          onClick={openCreateModal}
          startIcon={<Plus size={16} />}
          variant="contained"
        >
          Add Overseer / Leader
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by overseer name, office, nation, or region..."
            type="text"
            value={searchTerm}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Jurisdiction:</span>
          <select
            className="rounded-lg border border-slate-200 py-1.5 px-3 text-xs font-bold text-slate-700 focus:border-brand-blue focus:outline-none"
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            <option value="ALL">All Jurisdictions ({directory.length})</option>
            <option value="International">International</option>
            <option value="National">National</option>
            <option value="Regional">Regional & State</option>
            <option value="Departmental">Departmental Directors</option>
          </select>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
              item.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
            }`}
            key={item.id}
          >
            <div className="flex items-start gap-4">
              <img
                alt={item.name}
                className="size-16 rounded-full object-cover border-2 border-brand-blue/20 shrink-0 bg-slate-100"
                src={item.portraitUrl}
              />
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded bg-soft-blue px-2 py-0.5 text-[10px] font-bold text-brand-blue uppercase">
                  {item.category}
                </span>
                <h4 className="mt-1 font-bold text-ink truncate text-sm">{item.name}</h4>
                <div className="text-xs font-semibold text-brand-green truncate">{item.office}</div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 truncate">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{item.stateOrRegion}, {item.country}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span className="font-mono text-[11px]">{item.phone}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate text-[11px]">{item.email}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <button
                className={`text-[11px] font-bold ${
                  item.isActive ? "text-brand-green" : "text-slate-400"
                }`}
                onClick={() => handleToggleActive(item.id)}
                type="button"
              >
                {item.isActive ? "● Published" : "○ Inactive"}
              </button>

              <div className="flex items-center gap-1">
                <button
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-blue"
                  onClick={() => openEditModal(item)}
                  title="Edit Leader"
                  type="button"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Delete Leader"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Overseer Modal */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <div className="bg-white p-6 sm:p-8">
          <DialogTitle className="p-0 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-lg font-bold text-ink">
              {editingItem ? `Edit Overseer: ${editingItem.name}` : "Add Overseer / Leader to Directory"}
            </span>
            <button
              aria-label="Close modal"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
          </DialogTitle>

          <form className="mt-5 grid gap-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Full Name & Title"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pastor John Momoh"
                required
                size="small"
                value={name}
              />
              <TextField
                fullWidth
                label="Office / Pastoral Role"
                onChange={(e) => setOffice(e.target.value)}
                placeholder="e.g. National Overseer"
                required
                size="small"
                value={office}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                fullWidth
                label="Jurisdiction Category"
                onChange={(e) => setCategory(e.target.value as any)}
                select
                size="small"
                value={category}
              >
                <MenuItem value="International">International</MenuItem>
                <MenuItem value="National">National</MenuItem>
                <MenuItem value="Regional">Regional & State</MenuItem>
                <MenuItem value="Departmental">Departmental</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Country / Jurisdiction"
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Nigeria, United States"
                required
                size="small"
                value={country}
              />

              <TextField
                fullWidth
                label="State / Province / Region"
                onChange={(e) => setStateOrRegion(e.target.value)}
                placeholder="e.g. Lagos, Texas, London"
                required
                size="small"
                value={stateOrRegion}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Official Contact Phone"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                required
                size="small"
                value={phone}
              />
              <TextField
                fullWidth
                label="Official Email Address"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="overseer@horemow.org"
                required
                size="small"
                type="email"
                value={email}
              />
            </div>

            <TextField
              fullWidth
              label="Secretariat / Fellowship Address"
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="Full address of the regional secretariat"
              size="small"
              value={officeAddress}
            />

            {/* Dedicated File Select & Upload for Overseer Portrait (No Image URL text input) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs font-bold text-ink mb-1 block">
                Leader Portrait Photograph (Select Image File)
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Upload a professional portrait photo of the overseer (JPG, PNG, or WEBP, max 10MB).
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative size-24 shrink-0 rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden grid place-items-center shadow-inner">
                  {portraitUrl ? (
                    <img
                      alt="Overseer preview"
                      className="size-full object-cover"
                      src={portraitUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon size={28} />
                      <span className="text-[10px] mt-1 font-semibold">No Image</span>
                    </div>
                  )}
                  {isUploadingPortrait && (
                    <div className="absolute inset-0 bg-black/50 grid place-items-center text-white">
                      <Loader2 className="animate-spin" size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingPortrait}
                    onChange={handlePortraitUpload}
                    ref={fileInputRef}
                    type="file"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      disabled={isUploadingPortrait}
                      onClick={() => fileInputRef.current?.click()}
                      size="small"
                      startIcon={isUploadingPortrait ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      variant="outlined"
                    >
                      {isUploadingPortrait
                        ? "Uploading Portrait..."
                        : portraitUrl
                        ? "Select Different Image"
                        : "Select Portrait File"}
                    </Button>
                    {portraitUrl && (
                      <Button
                        color="error"
                        disabled={isUploadingPortrait}
                        onClick={handleRemovePortrait}
                        size="small"
                        startIcon={<X size={14} />}
                        variant="text"
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                  {portraitUrl ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 size={13} /> Photo ready and linked to profile
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block">
                      Choose an image from your device to attach to this leader's profile.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <TextField
              fullWidth
              label="Ministry Biography & Responsibility"
              multiline
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              size="small"
              value={bio}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button onClick={() => setIsModalOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {editingItem ? "Save Changes" : "Create Overseer"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
