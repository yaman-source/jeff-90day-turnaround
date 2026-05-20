import { NextRequest, NextResponse } from "next/server";

// ── Calendly sends a POST here every time someone books a meeting ─────────────
// Webhook event: invitee.created
// Setup: Calendly → Integrations → Webhooks → add this URL:
//   https://jeff-90days.vercel.app/api/calendly-webhook

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle booking events (ignore cancellations etc.)
  const event = body.event as string | undefined;
  if (event !== "invitee.created") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const payload = body.payload as Record<string, unknown>;
  const invitee = payload?.invitee as Record<string, string> | undefined;
  const meeting = payload?.event as Record<string, string> | undefined;

  const name = invitee?.name ?? "Unknown";
  const email = invitee?.email ?? "";
  const timezone = invitee?.timezone ?? "";
  const startTime = meeting?.start_time ?? "";
  const endTime = meeting?.end_time ?? "";

  // Format the meeting time nicely
  const formatTime = (iso: string) => {
    if (!iso) return "Unknown";
    try {
      return new Date(iso).toLocaleString("en-CA", {
        timeZone: "America/Edmonton",
        dateStyle: "full",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  // ── 1. Look up this person in HubSpot by email ──────────────────────────────
  let formData: {
    company?: string;
    website?: string;
    challenge?: string;
    service?: string;
    timeline?: string;
    referral?: string;
    firstname?: string;
    lastname?: string;
  } | null = null;

  if (process.env.HUBSPOT_TOKEN && email) {
    try {
      const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "email", operator: "EQ", value: email },
              ],
            },
          ],
          properties: [
            "firstname",
            "lastname",
            "company",
            "website",
            "message",
          ],
          limit: 1,
        }),
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.results?.length > 0) {
          const props = data.results[0].properties as Record<string, string>;

          // The "message" field holds: "Challenge: ...\n\nService interest: ...\nTimeline: ...\nReferral: ..."
          // Parse it back out
          const msg = props.message ?? "";
          const extract = (label: string) => {
            const match = msg.match(new RegExp(`${label}:\\s*(.+?)(?:\\n|$)`, "i"));
            return match?.[1]?.trim() ?? "";
          };

          formData = {
            firstname: props.firstname,
            lastname: props.lastname,
            company: props.company,
            website: props.website,
            challenge: extract("Challenge"),
            service: extract("Service interest"),
            timeline: extract("Timeline"),
            referral: extract("Referral"),
          };
        }
      }
    } catch {
      // Non-fatal — still send the notification without form data
    }
  }

  // ── 2. Send Jeff the combined notification email ────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const formSection = formData
      ? `
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <h3 style="margin-bottom:8px;color:#111">📋 Form They Filled on the Website</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#888;width:140px">Company</td><td style="padding:8px 0;font-weight:600">${formData.company ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Website</td><td style="padding:8px 0"><a href="${formData.website}" style="color:#C87941">${formData.website ?? "—"}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888">Service</td><td style="padding:8px 0">${formData.service ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Timeline</td><td style="padding:8px 0">${formData.timeline ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Referral</td><td style="padding:8px 0">${formData.referral ?? "—"}</td></tr>
        </table>
        <h3 style="margin:16px 0 8px;color:#111">Their Biggest Challenge</h3>
        <p style="background:#f9f9f9;padding:16px;border-left:3px solid #C87941;margin:0;border-radius:4px">${formData.challenge ?? "—"}</p>
      `
      : `
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="background:#fff8f0;padding:12px 16px;border-left:3px solid #f0a060;border-radius:4px;color:#555;margin:0">
          ⚠️ <strong>No form submission found</strong> for this email address — they booked directly via Calendly without filling the website form.
        </p>
      `;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="color:#C87941;margin-bottom:4px">📅 Discovery Call Booked</h2>
        <p style="color:#666;margin-top:0">Someone just scheduled a call with you on Calendly.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <h3 style="margin-bottom:8px;color:#111">📆 Meeting Details</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#888;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C87941">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888">Time</td><td style="padding:8px 0;font-weight:600">${formatTime(startTime)}</td></tr>
          <tr><td style="padding:8px 0;color:#888">End Time</td><td style="padding:8px 0">${formatTime(endTime)}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Timezone</td><td style="padding:8px 0">${timezone}</td></tr>
        </table>

        ${formSection}

        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="color:#aaa;font-size:12px">90 Day Turnaround · jeff-90days.vercel.app</p>
      </div>
    `;

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "90 Day Turnaround <onboarding@resend.dev>",
          to: [process.env.NOTIFY_EMAIL ?? "jeff@90dayturnaround.ca"],
          subject: `📅 Call Booked: ${name} — ${formatTime(startTime)}`,
          html,
        }),
      });
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({ ok: true });
}
