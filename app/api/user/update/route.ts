import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, profile_picture_url } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user profile in database
    const { data, error } = await supabase
      .from("users")
      .update({ profile_picture_url })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Return updated user data (without password)
    return NextResponse.json({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        profile_picture_url: data.profile_picture_url,
      },
    });
  } catch (err) {
    console.error("/api/user/update error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
