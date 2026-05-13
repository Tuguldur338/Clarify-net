import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const email = url.searchParams.get("email");
    const name = url.searchParams.get("name");

    if (!id && !email && !name) {
      return NextResponse.json(
        { error: "id, email, or name is required" },
        { status: 400 },
      );
    }

    let data: any = null;
    let error: any = null;

    if (id || email) {
      const query = supabase
        .from("users")
        .select("id, email, name, profile_picture_url, role")
        .limit(1);

      const response = id
        ? await query.eq("id", id).single()
        : await query.eq("email", email).single();

      data = response.data;
      error = response.error;
    } else {
      const response = await supabase
        .from("users")
        .select("id, email, name, profile_picture_url, role")
        .ilike("name", `%${name}%`)
        .limit(1);

      data = Array.isArray(response.data) ? response.data[0] : response.data;
      error = response.error;
    }

    if (error) {
      console.error("/api/user GET error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("/api/user GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
