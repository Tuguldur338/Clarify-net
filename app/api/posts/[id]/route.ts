import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

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

export async function PATCH(req: Request, { params }: { params: any }) {
  try {
    const id = params?.id;
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
