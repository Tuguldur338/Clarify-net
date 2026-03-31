import { supabase } from "@/utils/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, profile_picture_url, role, actingUserId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // If role update is requested, verify acting user has admin permissions
    if (role) {
      if (!actingUserId) {
        return NextResponse.json(
          { error: "actingUserId is required to change roles" },
          { status: 400 },
        );
      }

      const acting = await supabase
        .from("users")
        .select("id, role")
        .eq("id", actingUserId)
        .single();

      if (acting.error || !acting.data) {
        return NextResponse.json(
          { error: "Acting user not found" },
          { status: 404 },
        );
      }

      const actingRole = (acting.data.role || "USER").toUpperCase();
      const allowedActors = ["ADMIN", "DEVELOPER"];

      if (!allowedActors.includes(actingRole)) {
        return NextResponse.json(
          { error: "Permission denied: only ADMIN/DEVELOPER can set role" },
          { status: 403 },
        );
      }

      // Only the privileged roles can assign the top-tier badges
      const restrictedBadges = ["DEVELOPER", "ADMIN", "CONTENT_CREATOR"];
      if (
        restrictedBadges.includes(role.toUpperCase()) &&
        !allowedActors.includes(actingRole)
      ) {
        return NextResponse.json(
          { error: "Permission denied for restricted badge assignment" },
          { status: 403 },
        );
      }
    }

    // Build update record.
    const updatePayload: any = {};
    if (profile_picture_url !== undefined)
      updatePayload.profile_picture_url = profile_picture_url;
    if (role !== undefined) updatePayload.role = role;

    // Update user profile in database
    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    // Return updated user data (without password)
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
    console.error("/api/user/update error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
