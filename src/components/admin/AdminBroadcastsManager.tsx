import { Radio, Save, Check } from "lucide-react";
import { Alert, Button, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import {
  saveBroadcastsContent,
  useBroadcastsContent,
  type BroadcastSettings,
} from "../../lib/contentStore";

export default function AdminBroadcastsManager() {
  const current = useBroadcastsContent();
  const [formData, setFormData] = useState<BroadcastSettings>(current);
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBroadcastsContent(formData);
    setStatus("Broadcast streams and schedules updated successfully!");
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="space-y-6">
      {status && (
        <Alert icon={<Check size={18} />} severity="success">
          {status}
        </Alert>
      )}

      <form
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSave}
      >
        <h3 className="flex items-center gap-2 text-base font-bold text-brand-blue">
          <Radio size={18} /> Live Broadcast & Media Stream Settings
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Configure HOREMOW Live TV and Holiness Revival Radio stream channels and status.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* TV Stream */}
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <h4 className="font-bold text-ink">1. HOREMOW Live Television</h4>
            <TextField
              fullWidth
              label="TV Channel Title"
              onChange={(e) => setFormData((p) => ({ ...p, tvTitle: e.target.value }))}
              size="small"
              value={formData.tvTitle}
            />
            <TextField
              fullWidth
              label="Live TV Stream / HLS / YouTube URL"
              onChange={(e) => setFormData((p) => ({ ...p, tvStreamUrl: e.target.value }))}
              placeholder="https://..."
              size="small"
              value={formData.tvStreamUrl}
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">TV Stream Status</label>
              <Select
                fullWidth
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    tvStatus: e.target.value as "Online" | "Offline",
                  }))
                }
                size="small"
                value={formData.tvStatus}
              >
                <MenuItem value="Online">Online (Live Now)</MenuItem>
                <MenuItem value="Offline">Offline (Preview Mode)</MenuItem>
              </Select>
            </div>
            <TextField
              fullWidth
              label="TV Schedule Notice"
              multiline
              onChange={(e) => setFormData((p) => ({ ...p, tvSchedule: e.target.value }))}
              rows={2}
              size="small"
              value={formData.tvSchedule}
            />
          </div>

          {/* Radio Stream */}
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <h4 className="font-bold text-ink">2. Holiness Revival Radio</h4>
            <TextField
              fullWidth
              label="Radio Station Title"
              onChange={(e) => setFormData((p) => ({ ...p, radioTitle: e.target.value }))}
              size="small"
              value={formData.radioTitle}
            />
            <TextField
              fullWidth
              label="Audio Stream URL / Icecast / Shoutcast"
              onChange={(e) => setFormData((p) => ({ ...p, radioStreamUrl: e.target.value }))}
              placeholder="https://..."
              size="small"
              value={formData.radioStreamUrl}
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Radio Status</label>
              <Select
                fullWidth
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    radioStatus: e.target.value as "Online" | "Offline",
                  }))
                }
                size="small"
                value={formData.radioStatus}
              >
                <MenuItem value="Online">Online (Broadcasting)</MenuItem>
                <MenuItem value="Offline">Offline (Preview Mode)</MenuItem>
              </Select>
            </div>
            <TextField
              fullWidth
              label="Radio Schedule Notice"
              multiline
              onChange={(e) => setFormData((p) => ({ ...p, radioSchedule: e.target.value }))}
              rows={2}
              size="small"
              value={formData.radioSchedule}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button startIcon={<Save size={16} />} type="submit" variant="contained">
            Save Broadcast Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
