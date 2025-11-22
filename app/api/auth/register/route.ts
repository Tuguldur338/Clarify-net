import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password required" },
        { status: 400 }
      );
    }

    // check existing
    const existing = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (existing && existing.data) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // simple server-side hashing (dev only)
    const crypto = require("crypto");
    const salt = crypto.randomBytes(8).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    const password_hash = `${salt}:${hash}`;

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const insert = await supabase
      .from("users")
      .insert({ id, email, name: name || null, password_hash })
      .select()
      .single();
    if (insert?.error) {
      return NextResponse.json({ error: insert.error }, { status: 500 });
    }
    const user = insert.data;
    // return a safe payload (no password)
    return NextResponse.json({
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("/api/auth/register error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
