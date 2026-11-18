import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  AlertCircle,
  Upload,
  Globe2,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  ChevronDown,
  X,
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
  getLocationsContent,
  saveLocationsContent,
  useLocationsContent,
  type FellowshipLocation,
} from "../../lib/contentStore";
import { CONTINENTS_DATA } from "../../lib/locationData";
import { useDebounce } from "../../lib/useDebounce";
import { fileToDataUrl } from "../../lib/imageUpload";

const ITEMS_PER_PAGE = 5;
const CONTINENTS = Object.keys(CONTINENTS_DATA);

/* -------------------------------------------------------------
 * SEARCHABLE SELECT COMBOBOX COMPONENT
 * Provides interactive instant search dropdown with click-to-select
 * ------------------------------------------------------------- */
function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  onAddCustom,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string; sub?: string }[];
  onChange: (val: string) => void;
  onAddCustom?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal query with incoming value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sub && opt.sub.toLowerCase().includes(q))
    );
  }, [options, query]);

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="relative flex items-center">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-16 text-xs font-medium text-ink shadow-xs focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          type="text"
          value={query}
        />
        <div className="absolute right-2 flex items-center gap-1 text-slate-400">
          {query && (
            <button
              className="p-1 hover:text-slate-600"
              onClick={() => {
                setQuery("");
                setIsOpen(true);
              }}
              type="button"
            >
              <X size={13} />
            </button>
          )}
          <button
            className="p-1 hover:text-brand-blue"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl scrollbar-thin">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              No results for &ldquo;{query}&rdquo;
              {onAddCustom && (
                <button
                  className="mt-1 block w-full text-xs font-bold text-brand-blue hover:underline"
                  onClick={() => {
                    onAddCustom();
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  + Add &ldquo;{query}&rdquo; as Custom
                </button>
              )}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-soft-blue hover:text-brand-blue ${
                  opt.value.toLowerCase() === value.toLowerCase()
                    ? "bg-slate-100 font-bold text-brand-blue"
                    : "text-slate-700"
                }`}
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setQuery(opt.label);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span>{opt.label}</span>
                {opt.sub && (
                  <span className="text-[10px] font-mono text-slate-400">{opt.sub}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLocationsManager() {
  const locations = useLocationsContent();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [continentFilter, setContinentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [continent, setContinent] = useState<string>("Africa");
  const [country, setCountry] = useState("Nigeria");
  const [stateOrArea, setStateOrArea] = useState("Federal Capital Territory (Abuja)");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  // Overseer of State/Location Fields
  const [overseerName, setOverseerName] = useState("");
  const [overseerTitle, setOverseerTitle] = useState("State Coordinator");
  const [overseerPhone, setOverseerPhone] = useState("");
  const [overseerEmail, setOverseerEmail] = useState("");
  const [overseerPhotoUrl, setOverseerPhotoUrl] = useState("");

  const [isAddingCustomState, setIsAddingCustomState] = useState(false);
  const [customStateInput, setCustomStateInput] = useState("");

  // Available Countries list for the chosen continent
  const continentCountries = useMemo(() => {
    const list = CONTINENTS_DATA[continent] || [];
    return list.map((c) => ({
      label: c.name,
      value: c.name,
      sub: c.code,
    }));
  }, [continent]);

  // Available States list for the chosen country
  const countryStates = useMemo(() => {
    const list = CONTINENTS_DATA[continent] || [];
    const cObj = list.find((c) => c.name.toLowerCase() === country.toLowerCase());
    return (cObj?.states || []).map((s) => ({
      label: s,
      value: s,
    }));
  }, [continent, country]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.stateOrArea.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        (loc.overseerName && loc.overseerName.toLowerCase().includes(q));

      const matchesContinent = continentFilter === "ALL" || loc.continent === continentFilter;
      return matchesSearch && matchesContinent;
    });
  }, [locations, debouncedSearch, continentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / ITEMS_PER_PAGE));
  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLocations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLocations, currentPage]);

  const openCreateModal = () => {
    setEditingLocationId(null);
    setName("");
    setContinent("Africa");
    setCountry("Nigeria");
    setStateOrArea("Federal Capital Territory (Abuja)");
    setAddress("");
    setPhone("+234 806 191 5797");
    setEmail("info@horemow.org");
    setIsHeadquarters(false);
    setOverseerName("");
    setOverseerTitle("State Coordinator");
    setOverseerPhone("");
    setOverseerEmail("");
    setOverseerPhotoUrl("");
    setIsAddingCustomState(false);
    setCustomStateInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: FellowshipLocation) => {
    setEditingLocationId(loc.id);
    setName(loc.name);
    setContinent(loc.continent);
    setCountry(loc.country);
    setStateOrArea(loc.stateOrArea);
    setAddress(loc.address);
    setPhone(loc.phone);
    setEmail(loc.email);
    setIsHeadquarters(Boolean(loc.isHeadquarters));
    setOverseerName(loc.overseerName || "");
    setOverseerTitle(loc.overseerTitle || "State Coordinator");
    setOverseerPhone(loc.overseerPhone || "");
    setOverseerEmail(loc.overseerEmail || "");
    setOverseerPhotoUrl(loc.overseerPhotoUrl || "");
    setIsAddingCustomState(false);
    setCustomStateInput("");
    setIsModalOpen(true);
  };

  const handleOverseerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setOverseerPhotoUrl(dataUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image load failed";
        setStatus({ type: "error", text: msg });
      }
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setStatus({ type: "error", text: "Please provide both fellowship name and physical address." });
      return;
    }

    const currentAll = getLocationsContent();
    const resolvedState =
      isAddingCustomState && customStateInput.trim() ? customStateInput.trim() : stateOrArea;

    if (editingLocationId) {
      const updated = currentAll.map((loc) => {
        if (loc.id === editingLocationId) {
          return {
            ...loc,
            name: name.trim(),
            continent: continent as FellowshipLocation["continent"],
            country: country.trim(),
            stateOrArea: resolvedState.trim(),
            address: address.trim(),
            phone: phone.trim() || "+234 806 191 5797",
            email: email.trim() || "info@horemow.org",
            isHeadquarters,
            overseerName: overseerName.trim() || undefined,
            overseerTitle: overseerTitle.trim() || undefined,
            overseerPhone: overseerPhone.trim() || undefined,
            overseerEmail: overseerEmail.trim() || undefined,
            overseerPhotoUrl: overseerPhotoUrl.trim() || loc.overseerPhotoUrl,
          };
        }
        return loc;
      });
      saveLocationsContent(updated);
      setStatus({ type: "success", text: `Location "${name}" updated successfully.` });
    } else {
      const newLoc: FellowshipLocation = {
        id: `loc-${Date.now()}`,
        name: name.trim(),
        continent: continent as FellowshipLocation["continent"],
        country: country.trim(),
        stateOrArea: resolvedState.trim(),
        address: address.trim(),
        phone: phone.trim() || "+234 806 191 5797",
        email: email.trim() || "info@horemow.org",
        isHeadquarters,
        overseerName: overseerName.trim() || undefined,
        overseerTitle: overseerTitle.trim() || undefined,
        overseerPhone: overseerPhone.trim() || undefined,
        overseerEmail: overseerEmail.trim() || undefined,
        overseerPhotoUrl:
          overseerPhotoUrl.trim() ||
          "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
      };
      saveLocationsContent([...currentAll, newLoc]);
      setStatus({ type: "success", text: `Location "${name}" published to directory.` });
    }

    setIsModalOpen(false);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDelete = (id: string, locName: string) => {
    if (window.confirm(`Are you sure you want to remove fellowship "${locName}"?`)) {
      const updated = getLocationsContent().filter((l) => l.id !== id);
      saveLocationsContent(updated);
      setStatus({ type: "success", text: "Fellowship location removed." });
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
            <MapPin size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Global Fellowship Locations & Overseers</h2>
            <p className="text-xs text-slate-500">
              Hierarchical directory by Continent &gt; Country &gt; State with assigned State Overseers and photos.
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
          Add Fellowship Location
        </Button>
      </div>

      {/* Search & Continent Filter Bar */}
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
            placeholder="Search locations by fellowship name, country, state, overseer or address..."
            size="small"
            value={searchInput}
          />
        </div>

        <div className="sm:col-span-4">
          <FormControl fullWidth size="small">
            <InputLabel>Continent</InputLabel>
            <Select
              label="Continent"
              onChange={(e) => {
                setContinentFilter(e.target.value);
                setCurrentPage(1);
              }}
              value={continentFilter}
            >
              <MenuItem value="ALL">All Continents ({locations.length})</MenuItem>
              {CONTINENTS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Locations Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Fellowship Centers & Overseers ({filteredLocations.length})</span>
          <span className="text-slate-400 font-normal">Page {currentPage} of {totalPages}</span>
        </div>

        {paginatedLocations.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="mx-auto text-slate-300" size={38} />
            <h4 className="mt-2 text-sm font-bold text-slate-700">No locations found</h4>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or add a new fellowship location.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedLocations.map((loc) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={loc.id}
              >
                <div className="flex items-start gap-4">
                  {/* Overseer / Branch Portrait */}
                  <div className="size-16 sm:size-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm relative">
                    <img
                      alt={loc.overseerName || loc.name}
                      className="size-full object-cover"
                      src={
                        loc.overseerPhotoUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg"
                      }
                    />
                    {loc.isHeadquarters && (
                      <span className="absolute bottom-0 inset-x-0 bg-brand-blue text-[9px] font-bold text-white text-center py-0.5">
                        HQ
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-soft-blue px-2.5 py-0.5 text-[10px] font-bold text-brand-blue">
                        {loc.continent}
                      </span>
                      <span className="text-xs font-bold text-ink">{loc.country}</span>
                      <span className="text-xs text-slate-400">· {loc.stateOrArea}</span>
                      {loc.isHeadquarters && (
                        <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                          Global Headquarters
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-ink text-sm sm:text-base">{loc.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" /> {loc.address}
                    </p>

                    {/* Overseer Info Banner */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                      <span className="font-bold text-brand-blue flex items-center gap-1">
                        <User size={12} /> {loc.overseerName || "Pastor Paul Rika (General Oversight)"}
                      </span>
                      <span className="text-slate-400">({loc.overseerTitle || "Overseer"})</span>
                      {loc.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone size={11} /> {loc.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditModal(loc)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(loc.id, loc.name)}
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

      {/* LOCATION & OVERSEER MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingLocationId ? "Edit Fellowship Location & Overseer" : "Add New Fellowship Location & Overseer"}
        </DialogTitle>
        <form onSubmit={handleSaveLocation}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* 1. Hierarchy: Continent -> Country -> State */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 size={15} /> 1. Geographic Hierarchy (Continent &gt; Country &gt; State)
              </span>

              <div className="grid gap-3 sm:grid-cols-3">
                {/* Continent Dropdown */}
                <FormControl fullWidth size="small">
                  <InputLabel>Continent *</InputLabel>
                  <Select
                    label="Continent *"
                    onChange={(e) => {
                      const newCont = e.target.value;
                      setContinent(newCont);
                      const defaultCountry = CONTINENTS_DATA[newCont]?.[0]?.name || "Nigeria";
                      setCountry(defaultCountry);
                      const defaultState = CONTINENTS_DATA[newCont]?.[0]?.states?.[0] || "Capital Region";
                      setStateOrArea(defaultState);
                    }}
                    value={continent}
                  >
                    {CONTINENTS.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Country Searchable Dropdown Combobox */}
                <SearchableSelect
                  label="Country (Search & Select) *"
                  onChange={(selectedCountry) => {
                    setCountry(selectedCountry);
                    const list = CONTINENTS_DATA[continent] || [];
                    const cObj = list.find(
                      (item) => item.name.toLowerCase() === selectedCountry.toLowerCase()
                    );
                    const firstState = cObj?.states?.[0] || "Capital Region";
                    setStateOrArea(firstState);
                  }}
                  placeholder="Type e.g. South, United, etc."
                  value={country}
                  options={continentCountries}
                />

                {/* State Searchable Dropdown Combobox */}
                {!isAddingCustomState ? (
                  <div className="space-y-1">
                    <SearchableSelect
                      label="State / Province *"
                      onChange={(selectedState) => setStateOrArea(selectedState)}
                      onAddCustom={() => setIsAddingCustomState(true)}
                      placeholder="Type state name..."
                      value={stateOrArea}
                      options={countryStates}
                    />
                    <div className="flex justify-end">
                      <button
                        className="text-[10px] font-bold text-brand-blue hover:underline"
                        onClick={() => setIsAddingCustomState(true)}
                        type="button"
                      >
                        + Missing state? Add Custom State
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <TextField
                      fullWidth
                      label="Enter Custom State / Region"
                      onChange={(e) => setCustomStateInput(e.target.value)}
                      placeholder="e.g. Ondo North District"
                      size="small"
                      value={customStateInput}
                    />
                    <button
                      className="text-[10px] text-slate-500 hover:text-brand-blue underline"
                      onClick={() => setIsAddingCustomState(false)}
                      type="button"
                    >
                      ← Back to standard state list
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Fellowship Center Details */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
                <Building size={15} /> 2. Fellowship Center Information
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  label="Fellowship Branch Name *"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HOREMOW Lagos State Fellowship Centre"
                  required
                  size="small"
                  value={name}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isHeadquarters}
                      onChange={(e) => setIsHeadquarters(e.target.checked)}
                    />
                  }
                  label="Designate as International Headquarters"
                />
              </div>

              <TextField
                fullWidth
                label="Physical Center Address *"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot / Street, Landmark, City..."
                required
                size="small"
                value={address}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  label="Official Contact Phone"
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 1234"
                  size="small"
                  value={phone}
                />
                <TextField
                  fullWidth
                  label="Official Email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="state.coordinator@horemow.org"
                  size="small"
                  value={email}
                />
              </div>
            </div>

            {/* 3. Overseer Assignment & Image Upload */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={15} /> 3. State Overseer / Coordinator Details & Image Upload
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  fullWidth
                  label="Overseer Full Name"
                  onChange={(e) => setOverseerName(e.target.value)}
                  placeholder="e.g. Pastor Samuel Adeleke"
                  size="small"
                  value={overseerName}
                />
                <TextField
                  fullWidth
                  label="Overseer Office / Title"
                  onChange={(e) => setOverseerTitle(e.target.value)}
                  placeholder="e.g. State Coordinator / Regional Overseer"
                  size="small"
                  value={overseerTitle}
                />
                <TextField
                  fullWidth
                  label="Overseer Direct Phone"
                  onChange={(e) => setOverseerPhone(e.target.value)}
                  placeholder="+234 802 334 1120"
                  size="small"
                  value={overseerPhone}
                />
                <TextField
                  fullWidth
                  label="Overseer Direct Email"
                  onChange={(e) => setOverseerEmail(e.target.value)}
                  placeholder="overseer@horemow.org"
                  size="small"
                  value={overseerEmail}
                />
              </div>

              {/* Overseer Photo Upload */}
              <div className="rounded-lg border border-dashed border-slate-300 p-3 bg-white">
                <span className="text-xs font-bold text-ink mb-1.5 block">
                  Overseer Portrait Photograph Upload
                </span>
                <div className="grid gap-3 sm:grid-cols-12 items-center">
                  <div className="sm:col-span-8">
                    <TextField
                      fullWidth
                      label="Image URL or Cloudinary Link"
                      onChange={(e) => setOverseerPhotoUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      size="small"
                      value={overseerPhotoUrl}
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm">
                      <Upload size={14} /> Upload Portrait
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={handleOverseerPhotoUpload}
                        type="file"
                      />
                    </label>
                    {overseerPhotoUrl && (
                      <img
                        alt="Overseer"
                        className="size-10 rounded-full object-cover border border-slate-300"
                        src={overseerPhotoUrl}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              {editingLocationId ? "Save Location Changes" : "Save Location"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
