import Anthropic from "@anthropic-ai/sdk";
import { EmailMessage, Task, TaskCategory, TaskPriority } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ExtractedTask {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: string | null;
}

export async function extractTasksFromEmail(
  email: EmailMessage,
  userId: string
): Promise<Omit<Task, "id" | "created_at" | "updated_at" | "status">[]> {
  const content = `Subject: ${email.subject}\nFrom: ${email.from}\nDate: ${email.date}\n\n${email.snippet}\n\n${email.body.slice(0, 2000)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You extract actionable tasks from emails. Return a JSON array of tasks.
Each task must have:
- title: short action title (e.g. "Submit CS homework 3")
- description: brief detail of what needs to be done
- category: "school" | "job_application" | "general"
- priority: "high" | "medium" | "low"  (high = deadline within 3 days or urgent language)
- deadline: ISO date string if mentioned, else null

Return [] if the email has no actionable tasks. Return only valid JSON, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Extract tasks from this email:\n\n${content}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "[]";

  let extracted: ExtractedTask[] = [];
  try {
    extracted = JSON.parse(text);
  } catch {
    return [];
  }

  return extracted.map((t) => ({
    user_id: userId,
    email_id: email.id,
    email_subject: email.subject,
    email_from: email.from,
    email_date: email.date,
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    deadline: t.deadline,
  }));
}
