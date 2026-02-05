"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const EQUIPMENT_TYPE_MAX_LENGTH = 100;

export default function MainScreen() {
  const router = useRouter();
  const [equipmentType, setEquipmentType] = useState("");
  const [serviceMinutes, setServiceMinutes] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleEquipmentTypeChange(e) {
    const value = e.target.value;
    if (value.length <= EQUIPMENT_TYPE_MAX_LENGTH) {
      setEquipmentType(value);
    }
  }

  function handleServiceMinutesChange(e) {
    const value = e.target.value;
    if (value === "" || /^-?\d+$/.test(value)) {
      setServiceMinutes(value);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSave() {
    setSaveStatus(null);
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaveStatus({ error: "Not signed in." });
      setSaving(false);
      return;
    }
    const minutes =
      serviceMinutes === "" || serviceMinutes === "-"
        ? null
        : parseInt(serviceMinutes, 10);
    const { error } = await supabase.from("equipment_entries").insert({
      user_id: user.id,
      equipment_type: equipmentType.trim() || null,
      service_minutes: minutes,
      IsActive: true,
    });
    setSaving(false);
    if (error) {
      setSaveStatus({ error: error.message });
      return;
    }
    setSaveStatus({ success: true });
  }

  const serviceMinutesNum =
    serviceMinutes === "" || serviceMinutes === "-"
      ? null
      : parseInt(serviceMinutes, 10);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Authent
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/settings/security"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Security
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Enter equipment type and service minutes.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <label
              htmlFor="equipment-type"
              className="block text-sm font-medium text-slate-700"
            >
              Equipment Type
            </label>
            <input
              id="equipment-type"
              type="text"
              maxLength={EQUIPMENT_TYPE_MAX_LENGTH}
              value={equipmentType}
              onChange={handleEquipmentTypeChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="e.g. Pump unit A"
            />
            <p className="mt-1 text-xs text-slate-500">
              {equipmentType.length} / {EQUIPMENT_TYPE_MAX_LENGTH} characters
            </p>
          </div>

          <div>
            <label
              htmlFor="service-minutes"
              className="block text-sm font-medium text-slate-700"
            >
              Service Minutes
            </label>
            <input
              id="service-minutes"
              type="text"
              inputMode="numeric"
              value={serviceMinutes}
              onChange={handleServiceMinutesChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="e.g. 45"
            />
            <p className="mt-1 text-xs text-slate-500">
              Integer only (whole minutes)
            </p>
          </div>

          {saveStatus?.error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {saveStatus.error}
            </div>
          )}
          {saveStatus?.success && (
            <div
              role="status"
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
            >
              Saved.
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}
