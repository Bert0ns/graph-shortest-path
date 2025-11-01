import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";


export interface GraphsResponse {
  files: string[];
  error?: string;
}

/**
 * GET handler: lists all `.json` files under `public/graphs` and returns
 * a JSON response with the public paths of the files.
 *
 * - Success: 200 OK with `{ files: string[] }`.
 * - Error: 500 with `{ files: [], error: string }`.
 *
 * The response shape is `GraphsResponse`.
 */
export async function GET(): Promise<NextResponse<GraphsResponse>> {
  try {
    const dir = path.join(process.cwd(), "public", "graphs");
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
      .map((e) => `/graphs/${e.name}`)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json(
      { files: [], error: String(err) },
      { status: 500 }
    );
  }
}

