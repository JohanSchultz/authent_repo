"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SecuritySettingsPage() {
  const [factors, setFactors] = useState({ totp: [], phone: [] });
  const [loadingFactors, setLoadingFactors] = useState(true);
  const [enrollQr, setEnrollQr] = useState(null);
  const [enrollFactorId, setEnrollFactorId] = useState(null);
  const [enrollSecret, setEnrollSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unenrollId, setUnenrollId] = useState(null);

  const supabase = createClient();

  async function loadFactors() {
    setLoadingFactors(true);
    setError(null);
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    setLoadingFactors(false);
    if (listError) {
      setError(listError.message);
      return;
    }
    setFactors({
      totp: data?.totp ?? [],
      phone: data?.phone ?? [],
    });
  }

  useEffect(() => {
    loadFactors();
  }, []);

  async function handleStartEnroll() {
    setError(null);
    setSuccess(null);
    setEnrollQr(null);
    setEnrollFactorId(null);
    setEnrollSecret(null);
    setVerifyCode("");
    setLoading(true);

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    setLoading(false);

    if (enrollError) {
      setError(enrollError.message);
      return;
    }

    setEnrollFactorId(data.id);
    setEnrollQr(data.totp?.qr_code ?? null);
    setEnrollSecret(data.totp?.secret ?? null);
  }

  function handleCancelEnroll() {
    setEnrollQr(null);
    setEnrollFactorId(null);
    setEnrollSecret(null);
    setVerifyCode("");
    setError(null);
  }

  async function handleVerifyEnroll(e) {
    e.preventDefault();
    if (!enrollFactorId || !verifyCode.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: challengeError, data: challengeData } =
      await supabase.auth.mfa.challenge({ factorId: enrollFactorId });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollFactorId,
      challengeId: challengeData.id,
      code: verifyCode.trim(),
    });

    setLoading(false);

    if (verifyError) {
      setError(
        verifyError.message ||
          "Invalid or expired code. Please try again with the latest code from your authenticator app."
      );
      setVerifyCode("");
      return;
    }

    setSuccess("Authenticator app enabled successfully.");
    handleCancelEnroll();
    loadFactors();
  }

  async function handleUnenroll(factorId) {
    if (!factorId) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    setLoading(false);
    setUnenrollId(null);

    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }

    setSuccess("Authenticator app removed.");
    loadFactors();
  }

  const totpFactors = factors.totp ?? [];

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Security
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage two-factor authentication (authenticator app).
        </p>

        <div className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          <section>
            <h2 className="text-sm font-medium text-slate-900">
              Authenticator app (TOTP)
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Use an app like Google Authenticator or Authy to get one-time
              codes.
            </p>

            {loadingFactors ? (
              <p className="mt-3 text-sm text-slate-500">Loading…</p>
            ) : (
              <>
                {totpFactors.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {totpFactors.map((factor) => (
                      <li
                        key={factor.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">
                          {factor.friendly_name || "Authenticator app"}
                        </span>
                        {unenrollId === factor.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              Remove?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnenroll(factor.id)}
                              disabled={loading}
                              className="text-red-600 hover:underline disabled:opacity-50"
                            >
                              Yes, remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnenrollId(null)}
                              className="text-slate-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUnenrollId(factor.id)}
                            className="text-slate-600 hover:text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {!enrollQr ? (
                  <button
                    type="button"
                    onClick={handleStartEnroll}
                    disabled={loading}
                    className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? "Setting up…" : "Add authenticator app"}
                  </button>
                ) : (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Scan with your authenticator app
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Or enter the secret manually if your app doesn’t support
                      QR codes.
                    </p>
                    {enrollQr && (
                      <div className="mt-3 flex justify-center bg-white p-3 rounded-lg inline-block">
                        <img
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(enrollQr)}`}
                          alt="QR code for authenticator app"
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      </div>
                    )}
                    {enrollSecret && (
                      <p className="mt-2 break-all font-mono text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                        {enrollSecret}
                      </p>
                    )}
                    <form
                      onSubmit={handleVerifyEnroll}
                      className="mt-4 flex flex-col gap-3"
                    >
                      <label
                        htmlFor="enroll-verify-code"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Enter the 6-digit code from your app
                      </label>
                      <input
                        id="enroll-verify-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setVerifyCode(v);
                        }}
                        className="w-full max-w-[8rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading || verifyCode.length !== 6}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {loading ? "Verifying…" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEnroll}
                          disabled={loading}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
