import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { fetchRecentEmails } from "@/lib/gmail";
import { extractTasksFromEmail } from "@/lib/claude";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST() {
  const session = await getServerSession();
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const emails = await fetchRecentEmails(session.accessToken);

  let inserted = 0;

  for (const email of emails) {
    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("email_id", email.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (existing) continue;

    const tasks = await extractTasksFromEmail(email, session.user.id);
    if (tasks.length === 0) continue;

    await supabase.from("tasks").insert(
      tasks.map((t) => ({ ...t, status: "pending" }))
    );
    inserted += tasks.length;
  }

  return NextResponse.json({ synced: emails.length, inserted });
}
