"use client";

import { useState } from "react";

const EQUIPMENT_TYPE_MAX_LENGTH = 100;

export default function AuthentPage() {
  const [equipmentType, setEquipmentType] = useState("");
  const [serviceMinutes, setServiceMinutes] = useState("");

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

  const serviceMinutesNum =
    serviceMinutes === "" || serviceMinutes === "-"
      ? null
      : parseInt(serviceMinutes, 10);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Authent
        </h1>
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
        </div>
      </div>
    </main>
  );
}
