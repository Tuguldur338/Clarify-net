import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Get user info
    const userRes = await supabase
      .from("users")
      .select("id,email,name,profile_picture_url")
      .eq("id", userId)
      .single();

    if (userRes?.error || !userRes?.data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get post count for this user
    const postsRes = await supabase
      .from("knowledge_posts")
      .select("id", { count: "exact" })
      .eq("owner", userId);

    const postCount = postsRes.count || 0;

    return NextResponse.json({
      data: {
        ...userRes.data,
        postCount,
      },
    });
  } catch (err) {
    console.error("API /api/user/author error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
