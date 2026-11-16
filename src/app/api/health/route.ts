import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/db";
import { checkHealth } from "@/lib/health";

export async function GET() {
  // Always run at request time; a health check must never be prerendered.
  await connection();
  const result = await checkHealth(() => getDb().execute(sql`select 1`));
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
