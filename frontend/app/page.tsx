"use client";

import { useCallback, useEffect, useState } from "react";

type DatabaseStatus = {
  status: string;
  databaseConnected: boolean;
  hasResult: boolean;
  result: string | null;
  checkedAtUtc: string;
  elapsedMilliseconds: number;
  message: string;
  error: string | null;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5094/api").replace(/\/$/, "");

export default function Home() {
  const [data, setData] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = `${apiBaseUrl}/database/status`;

  const requestStatus = useCallback(async () => {
    const response = await fetch(endpoint, { cache: "no-store" });
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(text || `Request failed with ${response.status}`);
    }

    return {
      response,
      payload: (await response.json()) as DatabaseStatus,
    };
  }, [endpoint]);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { response, payload } = await requestStatus();

      setData(payload);
      if (!response.ok) {
        setError(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
      }
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "API request failed.");
    } finally {
      setLoading(false);
    }
  }, [requestStatus]);

  useEffect(() => {
    let active = true;

    async function loadInitialStatus() {
      try {
        const { response, payload } = await requestStatus();

        if (!active) return;

        setData(payload);
        if (!response.ok) {
          setError(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
        }
      } catch (err) {
        if (!active) return;

        setData(null);
        setError(err instanceof Error ? err.message : "API request failed.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialStatus();

    return () => {
      active = false;
    };
  }, [requestStatus]);

  const online = data?.databaseConnected === true && data?.hasResult === true && !error;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-cyan-300">
              Basic Web Template
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              API ve veritabani durumu
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void refreshStatus()}
            disabled={loading}
            className="h-11 rounded-md border border-cyan-400/40 bg-cyan-400 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor" : "Yenile"}
          </button>
        </header>

        <div className="grid flex-1 gap-5 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-zinc-950/40">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-zinc-400">Genel durum</p>
                <p className={`mt-2 text-2xl font-semibold ${online ? "text-emerald-300" : "text-rose-300"}`}>
                  {online ? "Calisiyor" : loading ? "Bekleniyor" : "Kontrol gerekli"}
                </p>
              </div>

              <span
                className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-medium ${
                  online
                    ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30"
                    : "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30"
                }`}
              >
                {online ? "DB sonucu alindi" : "DB sonucu yok"}
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="API endpoint" value={endpoint} />
              <Metric label="DB cevabi" value={data?.result ?? "-"} />
              <Metric
                label="Sure"
                value={data ? `${data.elapsedMilliseconds} ms` : loading ? "..." : "-"}
              />
            </div>

            <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-medium text-zinc-300">Son mesaj</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {error ?? data?.message ?? "API cevabi bekleniyor."}
              </p>
            </div>
          </section>

          <aside className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">Kontrol detaylari</h2>
            <dl className="mt-5 space-y-4">
              <Detail label="API durumu" value={data?.status ?? "-"} />
              <Detail label="Veritabani baglantisi" value={data?.databaseConnected ? "Var" : "Yok"} />
              <Detail label="Sorgu sonucu" value={data?.hasResult ? "Var" : "Yok"} />
              <Detail
                label="Kontrol zamani"
                value={data ? new Date(data.checkedAtUtc).toLocaleString("tr-TR") : "-"}
              />
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950/80 p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-sm font-medium text-zinc-100" title={value}>
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-100">{value}</dd>
    </div>
  );
}
