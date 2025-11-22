import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, topic, content, video_url, owner } = body;

    const res = await supabase
      .from("knowledge_posts")
      .insert({ id, title, topic, content, video_url, owner })
      .select()
      .single();

    if (res?.error) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ data: res.data });
  } catch (err) {
    console.error("API /api/posts error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const owner = url.searchParams.get("owner");
    const q = url.searchParams.get("q");
    if (id) {
      const r = await supabase
        .from("knowledge_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (r?.error)
        return NextResponse.json({ error: r.error }, { status: 500 });
      return NextResponse.json({ data: r.data });
    }
    let query = supabase.from("knowledge_posts").select("*");
    if (owner) query = query.eq("owner", owner);
    if (q) query = query.ilike("title", `%${q}%`);
    const res = await query.limit(200);
    if (res?.error)
      return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ data: res.data });
  } catch (err) {
    console.error("API /api/posts GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, topic, content, video_url, owner } = body;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    // fetch existing
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

    const upd = await supabase
      .from("knowledge_posts")
      .update({ title, topic, content, video_url })
      .eq("id", id)
      .select()
      .single();
    if (upd?.error)
      return NextResponse.json({ error: upd.error }, { status: 500 });
    return NextResponse.json({ data: upd.data });
  } catch (err) {
    console.error("API /api/posts PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, owner } = body;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

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

    const d = await supabase
      .from("knowledge_posts")
      .del()
      .eq("id", id)
      .single();
    if (d?.error) return NextResponse.json({ error: d.error }, { status: 500 });
    return NextResponse.json({ data: d.data });
  } catch (err) {
    console.error("API /api/posts DELETE error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
// Note: GET implemented earlier above (supports id, owner, q)
