import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { owner } = body;
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const existing = await supabase
      .from("knowledge_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (existing?.error)
      return NextResponse.json({ error: existing.error }, { status: 500 });
    if (!existing?.data)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    if (owner && existing.data.owner && owner !== existing.data.owner) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const res = await supabase
      .from("knowledge_posts")
      .eq("id", id)
      .delete()
      .single();
    if (res?.error)
      return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ data: res.data });
  } catch (err) {
    console.error("API DELETE /api/posts/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const res = await supabase
      .from("knowledge_posts")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (res?.error)
      return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ data: res.data });
  } catch (err) {
    console.error("API PATCH /api/posts/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
