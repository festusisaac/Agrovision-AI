import { NextRequest, NextResponse } from "next/server";
import { handleUssdSession } from "@/lib/ussd";

// POST /api/ussd — the Africa's Talking USSD webhook. Their gateway POSTs
// application/x-www-form-urlencoded (not JSON): sessionId, serviceCode,
// phoneNumber, text (the FULL star-joined history of everything the caller
// has entered this session, not just the latest input). The response body
// itself is the reply — plain text starting with "CON " to show another
// screen or "END " to finish the session and hang up. Always respond 200
// with a CON/END-prefixed body; there's no documented handling for a
// non-2xx response from this webhook.
export async function POST(req: NextRequest) {
  let text = "";
  try {
    const form = await req.formData();
    text = String(form.get("text") ?? "");
  } catch {
    // malformed body — fall through with text="" (shows the first screen)
  }

  let reply: string;
  try {
    reply = await handleUssdSession(text);
  } catch (err) {
    console.error("[/api/ussd]", err);
    reply = "END Sorry, something went wrong. Please try again.";
  }

  return new NextResponse(reply, { headers: { "Content-Type": "text/plain" } });
}
