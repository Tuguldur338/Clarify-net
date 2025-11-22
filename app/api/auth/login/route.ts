import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password required" },
        { status: 400 }
      );
    }

    const res = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (!res || !res.data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = res.data;
    const crypto = require("crypto");
    const [salt, stored] = (user.password_hash || "").split(":");
    if (!salt || !stored) {
      return NextResponse.json(
        { error: "Invalid stored password" },
        { status: 500 }
      );
    }
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    if (hash !== stored) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("/api/auth/login error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
