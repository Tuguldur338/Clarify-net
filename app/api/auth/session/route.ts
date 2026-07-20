import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";
import {
  getSessionTokenFromRequest,
  verifySessionToken,
} from "@/utils/authCookies";

export async function GET(req: Request) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ data: null });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ data: null });
    }

    const userResult = await supabase
      .from("users")
      .select("id, email, name, profile_picture_url, role")
      .eq("id", session.id)
      .single();

    if (!userResult?.data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: userResult.data });
  } catch (err) {
    console.error("/api/auth/session error:", err);
    return NextResponse.json({ data: null });
  }
}
