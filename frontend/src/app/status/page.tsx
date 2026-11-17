import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { backendFetch } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Systemstatus",
  robots: { index: false },
};

async function readStatus(): Promise<string> {
  try {
    const response = await backendFetch("/health");
    const body = (await response.json()) as { database?: string };
    return response.ok && body.database === "reachable"
      ? "Alt kører"
      : "Databasen svarer ikke";
  } catch {
    return "Backend svarer ikke";
  }
}

async function BackendStatus() {
  // Always check at request time, even if the build had no BACKEND_URL.
  await connection();
  const status = await readStatus();
  return <p data-testid="backend-status">{status}</p>;
}

export default function StatusPage() {
  return (
    <main>
      <h1>Systemstatus</h1>
      <Suspense fallback={<p>Tjekker…</p>}>
        <BackendStatus />
      </Suspense>
    </main>
  );
}
