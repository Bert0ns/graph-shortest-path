import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// List all JSON graph files under public/graphs and return their public URLs
export async function GET() {
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

