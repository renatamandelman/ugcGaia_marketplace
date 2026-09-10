import { NextRequest, NextResponse } from "next/server";

// ============================================
// GaiaUGC — oEmbed proxy para portadas de video
// GET /api/oembed?url=<video-url>
// Soporta: TikTok y YouTube (incluye Shorts)
// Instagram NO tiene oEmbed gratis → 400 con
// instrucción de subir portada manual.
// ============================================

export const dynamic = "force-dynamic";

function detectSource(rawUrl: string): "tiktok" | "youtube" | null {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  ) {
    return "youtube";
  }
  return null;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Falta el parámetro ?url=" }, { status: 400 });
  }

  const source = detectSource(raw);
  if (!source) {
    return NextResponse.json(
      {
        error:
          "Solo se soportan links de TikTok o YouTube. Para Instagram subí la portada manualmente.",
      },
      { status: 400 }
    );
  }

  const oembedUrl =
    source === "tiktok"
      ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(raw)}`
      : `https://www.youtube.com/oembed?url=${encodeURIComponent(raw)}&format=json`;

  try {
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "GaiaUGC/1.0 (+portfolio covers)" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `La plataforma no devolvió datos (${res.status}). Probá subir la portada manualmente.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const thumbnail = typeof data.thumbnail_url === "string" ? data.thumbnail_url : null;

    if (!thumbnail) {
      return NextResponse.json(
        { error: "La plataforma no expuso portada para ese link. Subila manualmente." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      source,
      thumbnail_url: thumbnail,
      title: typeof data.title === "string" ? data.title : null,
      author_name: typeof data.author_name === "string" ? data.author_name : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Error consultando la plataforma: ${err instanceof Error ? err.message : "timeout"}` },
      { status: 502 }
    );
  }
}