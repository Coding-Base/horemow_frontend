import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  CheckCircle2,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Eyebrow from "../common/Eyebrow";
import SectionHeading from "../common/SectionHeading";
import {
  saveDirectoryContent,
  useDirectoryContent,
  type OverseerItem,
} from "../../lib/contentStore";

export default function AdminDirectoryManager() {
  const directory = useDirectoryContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [editingItem, setEditingItem] = useState<OverseerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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
    if (!name || !office) return;

    if (editingItem) {
      // Update
      const updated = directory.map((d) =>
        d.id === editingItem.id
          ? {
              ...d,
              name,
              office,
              category,
              country,
              stateOrRegion,
              phone,
              email,
              officeAddress,
              portraitUrl: portraitUrl || d.portraitUrl,
              bio,
            }
          : d
      );
      saveDirectoryContent(updated);
      setNotice(`Updated record for ${name} successfully.`);
    } else {
      // Create
      const newItem: OverseerItem = {
        id: `dir-${Date.now()}`,
        name,
        office,
        category,
        country,
        stateOrRegion,
        phone,
        email,
        officeAddress,
        portraitUrl:
          portraitUrl ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
        bio,
        order: directory.length + 1,
        isActive: true,
      };
      saveDirectoryContent([...directory, newItem]);
      setNotice(`Created new overseer record for ${name}.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleDelete = (id: string, overseerName: string) => {
    if (confirm(`Are you sure you want to remove ${overseerName} from the directory?`)) {
      const updated = directory.filter((d) => d.id !== id);
      saveDirectoryContent(updated);
      setNotice(`Removed ${overseerName} from directory.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = directory.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    saveDirectoryContent(updated);
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

      {notice && (
        <Alert severity="success" icon={<CheckCircle2 size={16} />}>
          {notice}
        </Alert>
      )}

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
                className="size-16 rounded-full object-cover border-2 border-brand-blue/20 shrink-0"
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

            <TextField
              fullWidth
              helperText="Paste direct Cloudinary URL or image link"
              label="Portrait Image URL"
              onChange={(e) => setPortraitUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              size="small"
              value={portraitUrl}
            />

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
