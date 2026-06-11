import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), "public", "music", safeFile);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(safeFile).toLowerCase();
  const contentType = ext === ".mp3" ? "audio/mpeg" : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
    },
  });
}
