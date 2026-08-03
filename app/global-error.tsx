"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/monitoring/errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Error inesperado",
        source: error.stack?.slice(0, 500),
        path: location.pathname,
        severity: "fatal",
        metadata: { digest: error.digest },
      }),
    });
  }, [error]);
  return (
    <html lang="es">
      <body className="grid min-h-dvh place-items-center bg-[#09090c] p-6 text-white">
        <main className="max-w-lg text-center">
          <p className="text-sm text-violet-300">
            Código de recuperación · {error.digest ?? "cliente"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em]">
            Algo no salió como esperábamos.
          </h1>
          <p className="mt-4 text-white/55">
            El error ya fue registrado. Puedes reintentar sin perder tu trabajo
            guardado.
          </p>
          <button
            onClick={reset}
            className="mt-8 min-h-12 rounded-xl bg-violet-500 px-6 font-semibold hover:bg-violet-400"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
