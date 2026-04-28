import { google } from "googleapis";
import { EmailMessage } from "@/types";

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function fetchRecentEmails(
  accessToken: string,
  maxResults = 50
): Promise<EmailMessage[]> {
  const gmail = getGmailClient(accessToken);

  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "is:unread OR newer_than:7d",
  });

  const messages = listRes.data.messages ?? [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });

      const headers = detail.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name)?.value ?? "";

      const body = extractBody(detail.data.payload);

      return {
        id: msg.id!,
        subject: get("subject"),
        from: get("from"),
        date: get("date"),
        snippet: detail.data.snippet ?? "",
        body,
      } satisfies EmailMessage;
    })
  );

  return emails;
}

function extractBody(payload: any): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return "";
}
