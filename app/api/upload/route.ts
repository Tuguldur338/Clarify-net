import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.",
        },
        { status: 400 },
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `knowledge-images/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Handle local/mock mode where storage is not configured
    if (
      !supabase ||
      !(supabase as any).storage ||
      typeof (supabase as any).storage.from !== "function"
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase storage not configured (mock mode). Image upload is disabled.",
        },
        { status: 501 },
      );
    }

    const { error: uploadError } = await (supabase as any).storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        {
          error:
            "Upload failed. Make sure Supabase Storage bucket 'images' exists.",
        },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = (supabase as any).storage
      .from("images")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("API /api/upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
