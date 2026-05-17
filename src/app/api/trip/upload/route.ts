import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/trip/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "trip", "uploads");

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const allowedExts = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm", "ogg", "m4a", "mp3"];
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Size limits: images 20MB, video 200MB, audio 10MB
  const isVideo = ["mp4", "mov"].includes(ext);
  const isAudio = ["webm", "ogg", "m4a", "mp3"].includes(ext);
  const maxBytes = isVideo ? 200 * 1024 * 1024 : isAudio ? 10 * 1024 * 1024 : 20 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const filename = `${nanoid(10)}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  // Try sharp optimization for images (optional — skip if not installed)
  let finalFilename = filename;
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    try {
      const sharp = (await import("sharp")).default;
      const optimizedName = `${nanoid(10)}.webp`;
      const optimizedPath = path.join(UPLOAD_DIR, optimizedName);
      await sharp(filepath)
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(optimizedPath);
      finalFilename = optimizedName;
    } catch {
      // sharp not available — serve original
    }
  }

  const url = `/trip/uploads/${finalFilename}`;
  return NextResponse.json({ url, originalName: file.name });
}
