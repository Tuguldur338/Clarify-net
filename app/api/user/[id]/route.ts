import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch user from database
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, profile_picture_url, role")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database fetch error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data (without password)
    return NextResponse.json({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        profile_picture_url: data.profile_picture_url,
        role: data.role || "USER",
      },
    });
  } catch (err) {
    console.error("/api/user/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
