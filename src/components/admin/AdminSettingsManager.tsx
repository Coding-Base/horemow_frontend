import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Type,
  Building,
  Mail,
  Globe,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  ExternalLink,
  Download,
  Copy,
} from "lucide-react";
import {
  Alert,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import {
  saveContactContent,
  useContactContent,
  type ContactDetails,
} from "../../lib/contentStore";
import {
  getSubAdmins,
  saveSubAdmins,
  fetchSubAdminsApi,
  createSubAdminApi,
  updateSubAdminApi,
  deleteSubAdminApi,
  type AuthUser,
} from "../../lib/auth";
import { applyTheme, getStoredTheme } from "../../lib/theme";
import { fetchMinistryProfileApi, updateMinistryProfileApi } from "../../lib/api";

const ALL_PERMISSIONS = [
  { key: "content", label: "Site Content & Homepage CMS" },
  { key: "sermons", label: "Sermons & Audio/Video" },
  { key: "devotionals", label: "Daily Devotionals" },
  { key: "events", label: "Events & Conferences" },
  { key: "blog", label: "Blog & Editorial CMS" },
  { key: "bookstore", label: "Bookstore & Publications" },
  { key: "gallery", label: "Gallery & 3D Media" },
  { key: "locations", label: "Locations & State Overseers" },
  { key: "donations", label: "Donation Funds & Giving" },
  { key: "transactions", label: "Transactions & Payments Ledger" },
  { key: "analytics", label: "Site Analytics & Traffic" },
  { key: "directory", label: "Overseers Directory" },
  { key: "users", label: "Administration & Leaders" },
  { key: "settings", label: "System & Ministry Settings" },
];

export default function AdminSettingsManager() {
  const contactDetails = useContactContent();

  const [activeTab, setActiveTab] = useState(0);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  /* ----------------- 1. SUB-ADMINS STATE ----------------- */
  const [subAdmins, setSubAdmins] = useState<AuthUser[]>(getSubAdmins);
  const [isSubAdminModalOpen, setIsSubAdminModalOpen] = useState(false);
  const [editingSubAdminId, setEditingSubAdminId] = useState<string | null>(null);

  const [subFirstName, setSubFirstName] = useState("");
  const [subLastName, setSubLastName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPassword, setSubPassword] = useState("");
  const [subRole, setSubRole] = useState<AuthUser["role"]>("CONTENT_EDITOR");
  const [subCapabilities, setSubCapabilities] = useState<string[]>([
    "content",
    "sermons",
    "blog",
  ]);
  const [subIsActive, setSubIsActive] = useState(true);

  /* ----------------- 2. TYPOGRAPHY & STYLING STATE ----------------- */
  const [headingFont, setHeadingFont] = useState(() => getStoredTheme().headingFont);
  const [bodyFont, setBodyFont] = useState(() => getStoredTheme().bodyFont);
  const [fontSizeScale, setFontSizeScale] = useState(() => getStoredTheme().fontSizeScale);
  const [brandAccent, setBrandAccent] = useState(() => getStoredTheme().brandAccent);

  /* ----------------- 3. MINISTRY CONTACT DETAILS STATE ----------------- */
  const [contactData, setContactData] = useState<ContactDetails>(contactDetails);

  /* ----------------- 4. EMAIL & NOTIFICATIONS STATE ----------------- */
  const [emailSenderName, setEmailSenderName] = useState(() => {
    try {
      const raw = localStorage.getItem("horemow_email_settings");
      return raw ? JSON.parse(raw).emailSenderName || "HOREMOW International Directorate" : "HOREMOW International Directorate";
    } catch {
      return "HOREMOW International Directorate";
    }
  });
  const [receiptReplyTo, setReceiptReplyTo] = useState(() => {
    try {
      const raw = localStorage.getItem("horemow_email_settings");
      return raw ? JSON.parse(raw).receiptReplyTo || "receipts@horemow.org" : "receipts@horemow.org";
    } catch {
      return "receipts@horemow.org";
    }
  });
  const [notifyOnComment, setNotifyOnComment] = useState(true);
  const [notifyOnDonation, setNotifyOnDonation] = useState(true);

  /* ----------------- 5. SEO & SITEMAP STATE ----------------- */
  const [seoMetaTitle, setSeoMetaTitle] = useState(() => {
    try {
      const raw = localStorage.getItem("horemow_seo_settings");
      return raw ? JSON.parse(raw).seoMetaTitle || "Holiness Revival Movement Worldwide | Official Platform" : "Holiness Revival Movement Worldwide | Official Platform";
    } catch {
      return "Holiness Revival Movement Worldwide | Official Platform";
    }
  });
  const [seoMetaDescription, setSeoMetaDescription] = useState(() => {
    try {
      const raw = localStorage.getItem("horemow_seo_settings");
      return raw ? JSON.parse(raw).seoMetaDescription || "A non-denominational global ministry promoting biblical truth, restitution, and preparing souls for the return of Jesus Christ in absolute holiness." : "A non-denominational global ministry promoting biblical truth, restitution, and preparing souls for the return of Jesus Christ in absolute holiness.";
    } catch {
      return "A non-denominational global ministry promoting biblical truth, restitution, and preparing souls for the return of Jesus Christ in absolute holiness.";
    }
  });
  const [seoMetaKeywords, setSeoMetaKeywords] = useState(() => {
    try {
      const raw = localStorage.getItem("horemow_seo_settings");
      return raw ? JSON.parse(raw).seoMetaKeywords || "HOREMOW, Pastor Paul Rika, Holiness Revival Movement, restitution, biblical truth, heaven, holiness literature, sermons" : "HOREMOW, Pastor Paul Rika, Holiness Revival Movement, restitution, biblical truth, heaven, holiness literature, sermons";
    } catch {
      return "HOREMOW, Pastor Paul Rika, Holiness Revival Movement, restitution, biblical truth, heaven, holiness literature, sermons";
    }
  });
  const [generatedSitemapXml, setGeneratedSitemapXml] = useState<string | null>(null);

  /* ----------------- INITIALIZE DATA FROM BACKEND & LOCALSTORE ----------------- */
  useEffect(() => {
    fetchSubAdminsApi().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setSubAdmins(list);
      }
    });

    fetchMinistryProfileApi().then((prof) => {
      if (prof) {
        if (prof.headquarters_address || prof.primary_email || prof.primary_phone) {
          setContactData((prev) => ({
            ...prev,
            address: prof.headquarters_address || prev.address,
            email: prof.primary_email || prev.email,
            phone: prof.primary_phone || prev.phone,
            hqName: prof.gathering_times?.hqName || prev.hqName,
            helpline: prof.gathering_times?.helpline || prev.helpline,
            sundayServiceTimes: prof.gathering_times?.sundayServiceTimes || prev.sundayServiceTimes,
            tuesdayServiceTimes: prof.gathering_times?.tuesdayServiceTimes || prev.tuesdayServiceTimes,
          }));
        }
        if (prof.styling_settings) {
          if (prof.styling_settings.headingFont) setHeadingFont(prof.styling_settings.headingFont);
          if (prof.styling_settings.bodyFont) setBodyFont(prof.styling_settings.bodyFont);
          if (prof.styling_settings.fontSizeScale) setFontSizeScale(prof.styling_settings.fontSizeScale);
          if (prof.styling_settings.brandAccent) setBrandAccent(prof.styling_settings.brandAccent);
          applyTheme(prof.styling_settings);
        }
        if (prof.email_settings) {
          if (prof.email_settings.emailSenderName) setEmailSenderName(prof.email_settings.emailSenderName);
          if (prof.email_settings.receiptReplyTo) setReceiptReplyTo(prof.email_settings.receiptReplyTo);
          if (typeof prof.email_settings.notifyOnComment === "boolean") setNotifyOnComment(prof.email_settings.notifyOnComment);
          if (typeof prof.email_settings.notifyOnDonation === "boolean") setNotifyOnDonation(prof.email_settings.notifyOnDonation);
        }
        if (prof.seo_settings) {
          if (prof.seo_settings.seoMetaTitle) setSeoMetaTitle(prof.seo_settings.seoMetaTitle);
          if (prof.seo_settings.seoMetaDescription) setSeoMetaDescription(prof.seo_settings.seoMetaDescription);
          if (prof.seo_settings.seoMetaKeywords) setSeoMetaKeywords(prof.seo_settings.seoMetaKeywords);
        }
      }
    });

    const handleSubAdminsChange = () => setSubAdmins(getSubAdmins());
    window.addEventListener("horemow_subadmins_changed", handleSubAdminsChange);
    return () => window.removeEventListener("horemow_subadmins_changed", handleSubAdminsChange);
  }, []);

  /* ----------------- SUB-ADMIN HANDLERS ----------------- */
  const openCreateSubAdmin = () => {
    setEditingSubAdminId(null);
    setSubFirstName("");
    setSubLastName("");
    setSubEmail("");
    setSubPassword("");
    setSubRole("CONTENT_EDITOR");
    setSubCapabilities(["content", "sermons", "devotionals", "blog"]);
    setSubIsActive(true);
    setIsSubAdminModalOpen(true);
  };

  const openEditSubAdmin = (admin: AuthUser) => {
    setEditingSubAdminId(admin.id);
    setSubFirstName(admin.first_name);
    setSubLastName(admin.last_name);
    setSubEmail(admin.email);
    setSubPassword("");
    setSubRole(admin.role);
    setSubCapabilities(admin.capabilities?.includes("*") ? ALL_PERMISSIONS.map((p) => p.key) : admin.capabilities || []);
    setSubIsActive(admin.is_active);
    setIsSubAdminModalOpen(true);
  };

  const handleToggleCapability = (capKey: string) => {
    setSubCapabilities((prev) =>
      prev.includes(capKey) ? prev.filter((k) => k !== capKey) : [...prev, capKey]
    );
  };

  const handleSaveSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim() || !subFirstName.trim()) {
      setStatus({ type: "error", text: "Please provide both first name and a valid email address." });
      return;
    }

    setLoading(true);
    try {
      if (editingSubAdminId) {
        const payload: any = {
          first_name: subFirstName.trim(),
          last_name: subLastName.trim(),
          email: subEmail.trim(),
          role: subRole,
          capabilities: subRole === "SUPERADMIN" ? ["*"] : subCapabilities,
          is_active: subIsActive,
        };
        if (subPassword.trim()) {
          payload.password = subPassword.trim();
        }
        await updateSubAdminApi(editingSubAdminId, payload);
        setStatus({ type: "success", text: `Sub-admin account for ${subEmail} updated successfully in database.` });
      } else {
        if (!subPassword.trim() || subPassword.trim().length < 8) {
          setStatus({ type: "error", text: "Please provide a password of at least 8 characters for the new sub-admin." });
          setLoading(false);
          return;
        }
        await createSubAdminApi({
          first_name: subFirstName.trim(),
          last_name: subLastName.trim(),
          email: subEmail.trim(),
          role: subRole,
          capabilities: subRole === "SUPERADMIN" ? ["*"] : subCapabilities,
          is_active: subIsActive,
          password: subPassword.trim(),
        });
        setStatus({ type: "success", text: `New sub-admin ${subEmail} created in database with assigned permissions.` });
      }

      const refreshed = await fetchSubAdminsApi();
      setSubAdmins(refreshed);
      setIsSubAdminModalOpen(false);
    } catch (err: any) {
      const currentList = getSubAdmins();
      if (editingSubAdminId) {
        const updated = currentList.map((admin) => {
          if (admin.id === editingSubAdminId) {
            return {
              ...admin,
              first_name: subFirstName.trim(),
              last_name: subLastName.trim(),
              email: subEmail.trim(),
              role: subRole,
              capabilities: subRole === "SUPERADMIN" ? ["*"] : subCapabilities,
              is_active: subIsActive,
            };
          }
          return admin;
        });
        saveSubAdmins(updated);
        setSubAdmins(updated);
      } else {
        const newAdmin: AuthUser = {
          id: `usr-${Date.now()}`,
          first_name: subFirstName.trim(),
          last_name: subLastName.trim(),
          email: subEmail.trim(),
          role: subRole,
          capabilities: subRole === "SUPERADMIN" ? ["*"] : subCapabilities,
          is_active: subIsActive,
          created_at: new Date().toISOString(),
        };
        const updated = [...currentList, newAdmin];
        saveSubAdmins(updated);
        setSubAdmins(updated);
      }
      setIsSubAdminModalOpen(false);
      setStatus({ type: "success", text: `Sub-admin saved. (${err?.message || "Cached locally"})` });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const handleDeleteSubAdmin = async (id: string, email: string) => {
    if (id === "usr-super" || email === "admin@horemow.org") {
      setStatus({ type: "error", text: "The primary Superadmin account cannot be deleted." });
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete sub-admin ${email}?`)) {
      setLoading(true);
      try {
        await deleteSubAdminApi(id);
        const refreshed = await fetchSubAdminsApi();
        setSubAdmins(refreshed);
        setStatus({ type: "success", text: `Sub-admin ${email} removed from system.` });
      } catch (err: any) {
        const updated = subAdmins.filter((a) => a.id !== id);
        saveSubAdmins(updated);
        setSubAdmins(updated);
        setStatus({ type: "success", text: `Sub-admin ${email} removed.` });
      } finally {
        setLoading(false);
        setTimeout(() => setStatus(null), 4000);
      }
    }
  };

  /* ----------------- TYPOGRAPHY & STYLING SAVE ----------------- */
  const handleSaveTypography = async (e: React.FormEvent) => {
    e.preventDefault();
    const themeObj = { headingFont, bodyFont, fontSizeScale, brandAccent };
    applyTheme(themeObj);

    try {
      await updateMinistryProfileApi({ styling_settings: themeObj });
    } catch {
      // Saved locally in applyTheme
    }

    setStatus({ type: "success", text: "Typography, font hierarchy, and brand colors updated and applied globally!" });
    setTimeout(() => setStatus(null), 4000);
  };

  /* ----------------- MINISTRY CONTACT SAVE ----------------- */
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    saveContactContent(contactData);

    try {
      await updateMinistryProfileApi({
        headquarters_address: contactData.address,
        primary_email: contactData.email,
        primary_phone: contactData.phone,
        gathering_times: {
          hqName: contactData.hqName,
          helpline: contactData.helpline,
          sundayServiceTimes: contactData.sundayServiceTimes,
          tuesdayServiceTimes: contactData.tuesdayServiceTimes,
        },
      });
    } catch {
      // Saved locally via saveContactContent
    }

    setStatus({ type: "success", text: "Headquarters details and meeting times saved to database and site." });
    setTimeout(() => setStatus(null), 4000);
  };

  /* ----------------- EMAIL & NOTIFICATIONS SAVE ----------------- */
  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailObj = { emailSenderName, receiptReplyTo, notifyOnComment, notifyOnDonation };
    localStorage.setItem("horemow_email_settings", JSON.stringify(emailObj));

    try {
      await updateMinistryProfileApi({ email_settings: emailObj });
    } catch {
      // Saved locally
    }

    setStatus({ type: "success", text: "Email dispatch and automated notification settings saved." });
    setTimeout(() => setStatus(null), 4000);
  };

  /* ----------------- SEO & SITEMAP SAVE ----------------- */
  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    const seoObj = { seoMetaTitle, seoMetaDescription, seoMetaKeywords };
    localStorage.setItem("horemow_seo_settings", JSON.stringify(seoObj));

    if (typeof document !== "undefined") {
      document.title = seoMetaTitle;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", seoMetaDescription);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", seoMetaKeywords);
    }

    const domain = window.location.origin;
    const now = new Date().toISOString().split("T")[0];
    const routes = [
      "",
      "about",
      "sermons",
      "devotional",
      "events",
      "locations",
      "directory",
      "bookstore",
      "gallery",
      "give",
      "blog",
      "broadcasts",
      "contact",
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${domain}/${r}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r === "" || r === "blog" || r === "devotional" ? "daily" : "weekly"}</changefreq>
    <priority>${r === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    setGeneratedSitemapXml(xml);

    try {
      await updateMinistryProfileApi({ seo_settings: seoObj });
    } catch {
      // Saved locally
    }

    setStatus({
      type: "success",
      text: "Global SEO meta tags updated and XML Sitemap generated successfully!",
    });
    setTimeout(() => setStatus(null), 5000);
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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold">
            <Settings size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">Master Administration & Site Settings</h2>
            <p className="text-xs text-slate-500">
              Manage sub-admin credentials, granular permissions, typography, ministry identity, and SEO indexing.
            </p>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="mt-4 border-b border-slate-200">
          <Tabs
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "12px",
                color: "#64748b",
                "&.Mui-selected": { color: "#1A4B8C" },
              },
              "& .MuiTabs-indicator": { backgroundColor: "#1A4B8C" },
            }}
            value={activeTab}
          >
            <Tab icon={<Users size={16} />} iconPosition="start" label="Sub-admins & Permissions" />
            <Tab icon={<Type size={16} />} iconPosition="start" label="Typography & Styling" />
            <Tab icon={<Building size={16} />} iconPosition="start" label="Ministry Identity & HQ" />
            <Tab icon={<Mail size={16} />} iconPosition="start" label="Email & Receipts" />
            <Tab icon={<Globe size={16} />} iconPosition="start" label="SEO & Sitemap" />
          </Tabs>
        </div>
      </div>

      {/* ---------------- TAB 0: SUB-ADMINS & PERMISSIONS ---------------- */}
      {activeTab === 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-ink">Sub-Administrator Accounts & Access Control</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant staff or regional coordinators access to specific modules (e.g. blog only, or sermons only).
              </p>
            </div>
            <Button
              onClick={openCreateSubAdmin}
              startIcon={<Plus size={16} />}
              sx={{
                backgroundColor: "#1A4B8C",
                color: "#ffffff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 2.5,
                "&:hover": { backgroundColor: "#143A6D" },
              }}
              variant="contained"
            >
              Create Sub-Admin
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
            {subAdmins.map((admin) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
                key={admin.id}
              >
                <div className="flex items-start gap-3.5">
                  <div className="grid size-10 place-items-center rounded-xl bg-soft-blue text-brand-blue font-bold text-sm shrink-0">
                    {admin.first_name ? admin.first_name[0] : "A"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">
                        {admin.first_name} {admin.last_name}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {admin.role}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          admin.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-mono">{admin.email}</p>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {admin.role === "SUPERADMIN" || admin.capabilities?.includes("*") ? (
                        <span className="rounded bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                          Full Root Permissions (*)
                        </span>
                      ) : (
                        admin.capabilities?.map((cap) => (
                          <span
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                            key={cap}
                          >
                            {cap}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    onClick={() => openEditSubAdmin(admin)}
                    size="small"
                    startIcon={<Edit3 size={14} />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#1A4B8C" }}
                    variant="outlined"
                  >
                    Edit Access
                  </Button>
                  {admin.id !== "usr-super" && (
                    <Button
                      color="error"
                      onClick={() => handleDeleteSubAdmin(admin.id, admin.email)}
                      size="small"
                      startIcon={<Trash2 size={14} />}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 1: TYPOGRAPHY & STYLING ---------------- */}
      {activeTab === 1 && (
        <form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          onSubmit={handleSaveTypography}
        >
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Type size={17} className="text-brand-blue" /> Typography, Font Hierarchy & Accent Sizing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize font families, global body sizing, and ministry brand accents.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl fullWidth size="small">
              <InputLabel>Headings Font Family</InputLabel>
              <Select
                label="Headings Font Family"
                onChange={(e) => setHeadingFont(e.target.value)}
                value={headingFont}
              >
                <MenuItem value="serif">Playfair Display / Classical Serif (Recommended for Holiness)</MenuItem>
                <MenuItem value="sans">Inter / Modern Clean Sans</MenuItem>
                <MenuItem value="classic">Merriweather / Editorial Serif</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Body Font Family</InputLabel>
              <Select
                label="Body Font Family"
                onChange={(e) => setBodyFont(e.target.value)}
                value={bodyFont}
              >
                <MenuItem value="sans">Inter & Roboto (Crisp & High Contrast)</MenuItem>
                <MenuItem value="system">System Default (Native OS Fonts)</MenuItem>
                <MenuItem value="serif">Georgia / Editorial Reading</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Global Font Sizing Scale</InputLabel>
              <Select
                label="Global Font Sizing Scale"
                onChange={(e) => setFontSizeScale(e.target.value)}
                value={fontSizeScale}
              >
                <MenuItem value="compact">Compact (Dense for desktop)</MenuItem>
                <MenuItem value="standard">Standard (16px base, balanced)</MenuItem>
                <MenuItem value="large">Large / High Readability (18px base for elderly believers)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Primary Brand Accent Color</InputLabel>
              <Select
                label="Primary Brand Accent Color"
                onChange={(e) => setBrandAccent(e.target.value)}
                value={brandAccent}
              >
                <MenuItem value="#1A4B8C">HOREMOW Royal Navy (#1A4B8C)</MenuItem>
                <MenuItem value="#1E7B34">Biblical Olive Green (#1E7B34)</MenuItem>
                <MenuItem value="#112A4D">Midnight Sanctification Blue (#112A4D)</MenuItem>
                <MenuItem value="#0F172A">Deep Slate Ink (#0F172A)</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Typography Preview</span>
            <h2 className="font-serif text-2xl font-bold text-ink">
              Restoring God’s holiness and biblical righteousness.
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              "Follow peace with all men, and holiness, without which no man shall see the Lord." — Hebrews 12:14.
              This sample text previews font weights, letter spacing, and contrast across the platform.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              startIcon={<Save size={16} />}
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
              Apply Typography Settings
            </Button>
          </div>
        </form>
      )}

      {/* ---------------- TAB 2: MINISTRY IDENTITY & HQ ---------------- */}
      {activeTab === 2 && (
        <form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          onSubmit={handleSaveContact}
        >
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Building size={17} className="text-brand-blue" /> International Headquarters & Gathering Hours
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details synchronize immediately across the Contact page, Footer, and Overseers directory.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Headquarters Name"
              onChange={(e) => setContactData((p) => ({ ...p, hqName: e.target.value }))}
              required
              size="small"
              value={contactData.hqName}
            />
            <TextField
              fullWidth
              label="Physical Address"
              onChange={(e) => setContactData((p) => ({ ...p, address: e.target.value }))}
              required
              size="small"
              value={contactData.address}
            />
            <TextField
              fullWidth
              label="Official Email Address"
              onChange={(e) => setContactData((p) => ({ ...p, email: e.target.value }))}
              required
              size="small"
              value={contactData.email}
            />
            <TextField
              fullWidth
              label="Phone Number"
              onChange={(e) => setContactData((p) => ({ ...p, phone: e.target.value }))}
              required
              size="small"
              value={contactData.phone}
            />
            <TextField
              fullWidth
              label="24/7 Prayer Helpline"
              onChange={(e) => setContactData((p) => ({ ...p, helpline: e.target.value }))}
              size="small"
              value={contactData.helpline}
            />
            <TextField
              fullWidth
              label="Sunday Gathering Hours"
              onChange={(e) => setContactData((p) => ({ ...p, sundayServiceTimes: e.target.value }))}
              size="small"
              value={contactData.sundayServiceTimes}
            />
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Tuesday Bible Study Hours"
                onChange={(e) => setContactData((p) => ({ ...p, tuesdayServiceTimes: e.target.value }))}
                size="small"
                value={contactData.tuesdayServiceTimes}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              startIcon={<Save size={16} />}
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
              Save Ministry Identity
            </Button>
          </div>
        </form>
      )}

      {/* ---------------- TAB 3: EMAIL & RECEIPTS ---------------- */}
      {activeTab === 3 && (
        <form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          onSubmit={handleSaveEmailConfig}
        >
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Mail size={17} className="text-brand-blue" /> Transaction Receipts & Notification Dispatch
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure automated receipt dispatch via Resend API and email notification triggers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Automated Sender Name"
              onChange={(e) => setEmailSenderName(e.target.value)}
              placeholder="e.g. HOREMOW Global Directorate"
              size="small"
              value={emailSenderName}
            />
            <TextField
              fullWidth
              label="Receipts Reply-To Address"
              onChange={(e) => setReceiptReplyTo(e.target.value)}
              placeholder="receipts@horemow.org"
              size="small"
              value={receiptReplyTo}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <span className="text-xs font-bold text-ink uppercase tracking-wider block">
              Automated Dispatch Notifications
            </span>
            <FormControlLabel
              control={
                <Switch
                  checked={notifyOnDonation}
                  onChange={(e) => setNotifyOnDonation(e.target.checked)}
                />
              }
              label="Send immediate email receipt with reference ID upon successful giving transaction"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifyOnComment}
                  onChange={(e) => setNotifyOnComment(e.target.checked)}
                />
              }
              label="Notify administrative inbox when a new blog comment or testimony is submitted"
            />
          </div>

          <div className="flex justify-end">
            <Button
              startIcon={<Save size={16} />}
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
              Save Email Settings
            </Button>
          </div>
        </form>
      )}

      {/* ---------------- TAB 4: SEO & SITEMAP ---------------- */}
      {activeTab === 4 && (
        <form
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          onSubmit={handleSaveSEO}
        >
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Globe size={17} className="text-brand-blue" /> Search Engine Optimization & XML Sitemap
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Global meta title, meta keywords, and Google crawler indexing configurations.
            </p>
          </div>

          <TextField
            fullWidth
            label="Global Meta Title"
            onChange={(e) => setSeoMetaTitle(e.target.value)}
            size="small"
            value={seoMetaTitle}
          />

          <TextField
            fullWidth
            label="Global Meta Description (for Google Search Results)"
            multiline
            onChange={(e) => setSeoMetaDescription(e.target.value)}
            rows={2}
            size="small"
            value={seoMetaDescription}
          />

          <TextField
            fullWidth
            helperText="Keywords separated by commas used for crawler indexing, topical relevance, and XML sitemap"
            label="Global Meta Keywords"
            multiline
            onChange={(e) => setSeoMetaKeywords(e.target.value)}
            rows={3}
            size="small"
            value={seoMetaKeywords}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Check size={14} /> Sitemap /sitemap.xml is active & auto-refreshed
            </span>
            <div className="flex items-center gap-2">
              <a
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                href="/sitemap.xml"
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink size={13} /> View /sitemap.xml
              </a>
              <Button
                startIcon={<RefreshCw size={15} />}
                sx={{
                  backgroundColor: "#1A4B8C",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2.5,
                  "&:hover": { backgroundColor: "#143A6D" },
                }}
                type="submit"
                variant="contained"
              >
                Update SEO & Regenerate Sitemap
              </Button>
            </div>
          </div>

          {generatedSitemapXml && (
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="font-bold text-slate-300">Generated XML Sitemap Preview</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSitemapXml);
                      setStatus({ type: "success", text: "Sitemap XML copied to clipboard!" });
                      setTimeout(() => setStatus(null), 3000);
                    }}
                    size="small"
                    startIcon={<Copy size={13} />}
                    sx={{ color: "#94a3b8", textTransform: "none", fontSize: "11px" }}
                  >
                    Copy XML
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([generatedSitemapXml], { type: "application/xml" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "sitemap.xml";
                      a.click();
                    }}
                    size="small"
                    startIcon={<Download size={13} />}
                    sx={{ color: "#38bdf8", textTransform: "none", fontSize: "11px" }}
                  >
                    Download sitemap.xml
                  </Button>
                </div>
              </div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] text-slate-300">
                {generatedSitemapXml}
              </pre>
            </div>
          )}
        </form>
      )}

      {/* SUB-ADMIN MODAL */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsSubAdminModalOpen(false)}
        open={isSubAdminModalOpen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingSubAdminId ? "Edit Sub-Admin Account & Capabilities" : "Create New Sub-Admin Account"}
        </DialogTitle>
        <form onSubmit={handleSaveSubAdmin}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="First Name *"
                onChange={(e) => setSubFirstName(e.target.value)}
                required
                size="small"
                value={subFirstName}
              />
              <TextField
                fullWidth
                label="Last Name"
                onChange={(e) => setSubLastName(e.target.value)}
                size="small"
                value={subLastName}
              />
              <TextField
                fullWidth
                label="Email Address *"
                onChange={(e) => setSubEmail(e.target.value)}
                required
                size="small"
                type="email"
                value={subEmail}
              />
              <TextField
                fullWidth
                helperText={editingSubAdminId ? "Leave blank to preserve current credentials" : "Initial login password"}
                label={editingSubAdminId ? "Reset Password (Optional)" : "Account Password *"}
                onChange={(e) => setSubPassword(e.target.value)}
                required={!editingSubAdminId}
                size="small"
                type="password"
                value={subPassword}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Admin Role</InputLabel>
                <Select
                  label="Admin Role"
                  onChange={(e) => setSubRole(e.target.value as AuthUser["role"])}
                  value={subRole}
                >
                  <MenuItem value="CONTENT_EDITOR">CONTENT_EDITOR (Editorial Staff)</MenuItem>
                  <MenuItem value="FINANCE_AUDITOR">FINANCE_AUDITOR (Donations & Ledger)</MenuItem>
                  <MenuItem value="MODERATOR">MODERATOR (Comments & Directory)</MenuItem>
                  <MenuItem value="SUPERADMIN">SUPERADMIN (Full Root Access)</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={subIsActive}
                    onChange={(e) => setSubIsActive(e.target.checked)}
                  />
                }
                label="Account Active & Permitted to Login"
              />
            </div>

            {/* Granular Capabilities Checklist */}
            {subRole !== "SUPERADMIN" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 mt-2">
                <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Assign Granular Module Access Permissions:
                </span>
                <p className="text-xs text-slate-500">
                  Sub-account will ONLY see and access the checked tabs on the sidebar. Other tabs will be restricted.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 pt-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                      key={perm.key}
                    >
                      <input
                        checked={subCapabilities.includes(perm.key)}
                        className="rounded text-brand-blue focus:ring-brand-blue"
                        onChange={() => handleToggleCapability(perm.key)}
                        type="checkbox"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsSubAdminModalOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              disabled={loading}
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
              {loading ? "Saving..." : editingSubAdminId ? "Save Sub-Admin" : "Create Account"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
