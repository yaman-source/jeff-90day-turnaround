import { NextRequest, NextResponse } from "next/server";

// ── Calendly sends a POST here every time someone books a meeting ─────────────
// Webhook event: invitee.created
// Webhook URL: https://90dayturnaround.ca/api/calendly-webhook

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Log full payload for debugging (visible in Vercel → Runtime Logs) ───────
  console.log("📩 Calendly webhook received:", JSON.stringify(body, null, 2));
  console.log("🔑 Top-level keys:", Object.keys(body));

  // Only handle booking events (ignore cancellations, reschedules etc.)
  const event = body.event as string | undefined;
  if (event !== "invitee.created") {
    console.log("⏭️ Skipping event type:", event);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const payload = body.payload as Record<string, unknown> | null | undefined;
  console.log("🔑 Payload keys:", payload ? Object.keys(payload) : "null/undefined");

  const invitee = payload?.invitee as Record<string, unknown> | undefined;
  const meeting = payload?.event   as Record<string, unknown> | undefined;

  // questions_and_answers array — Calendly may put email/name here instead of
  // (or in addition to) the invitee object, depending on the account plan/config.
  const qas = (payload?.questions_and_answers ?? []) as Array<{ question: string; answer: string }>;
  console.log("🔑 QAs count:", qas.length, "| invitee.email:", invitee?.email ?? "null");

  // Try invitee object first, fall back to questions_and_answers
  const emailRaw =
    (invitee?.email as string | null | undefined) ||
    qas.find(qa => /email/i.test(qa.question ?? ""))?.answer ||
    "";
  const email    = emailRaw.trim().toLowerCase();

  const name =
    (invitee?.name as string) ||
    `${(invitee?.first_name as string) || ""} ${(invitee?.last_name as string) || ""}`.trim() ||
    qas.find(qa => /name/i.test(qa.question ?? ""))?.answer ||
    "Unknown";

  const timezone  = (invitee?.timezone as string) || "";
  const startTime = (meeting?.start_time as string) || "";
  const endTime   = (meeting?.end_time   as string) || "";

  console.log("📌 Extracted — name:", name, "| email:", email, "| start:", startTime);

  // ── Guard: completely empty payload = Calendly test ping on webhook creation ─
  if (!email && !startTime && name === "Unknown") {
    console.log("⚠️ Empty payload — Calendly test ping, skipping");
    return NextResponse.json({ ok: true, skipped: true, reason: "empty_payload" });
  }

  // Format the meeting time nicely (Mountain/Edmonton time)
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

  // ── Look up this person in HubSpot by email to get landing page form data ───
  // The form saves: challenge, service interest, timeline, referral into the
  // HubSpot "message" field in a structured format when the user submits the
  // landing page application form.
  let formData: {
    company?:   string;
    website?:   string;
    challenge?: string;
    service?:   string;
    timeline?:  string;
    referral?:  string;
    firstname?: string;
    lastname?:  string;
  } | null = null;

  if (process.env.HUBSPOT_TOKEN && email) {
    try {
      const searchRes = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  { propertyName: "email", operator: "EQ", value: email.toLowerCase().trim() },
                ],
              },
            ],
            properties: ["firstname", "lastname", "company", "website", "message"],
            limit: 1,
          }),
        }
      );

      console.log("🔍 HubSpot search status:", searchRes.status);

      if (searchRes.ok) {
        const data = await searchRes.json();
        console.log("🔍 HubSpot results count:", data.results?.length ?? 0);

        if (data.results?.length > 0) {
          const props = data.results[0].properties as Record<string, string>;
          console.log("✅ HubSpot contact properties:", JSON.stringify(props, null, 2));

          // The message field was saved as:
          // "Challenge: <text>\n\nService interest: <value>\nTimeline: <value>\nReferral: <value>"
          //
          // Fix: normalise line endings (HubSpot may return \r\n) and use
          // robust regex so multi-line challenge text is fully captured.
          const raw = (props.message ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

          // Challenge: grab everything between "Challenge:" and the next blank line
          // (or the next labelled field), supporting multi-line answers.
          const challengeMatch = raw.match(/Challenge:\s*([\s\S]+?)(?=\n\nService interest:|\n\nTimeline:|\n\nReferral:|$)/i);
          const challenge = challengeMatch?.[1]?.trim() ?? "";

          // Single-line fields – stop at next newline
          const extractLine = (label: string): string => {
            const m = raw.match(new RegExp(`${label}:\\s*(.+?)(?:\n|$)`, "i"));
            return m?.[1]?.trim() ?? "";
          };

          formData = {
            firstname: props.firstname ?? "",
            lastname:  props.lastname  ?? "",
            company:   props.company   ?? "",
            website:   props.website   ?? "",
            challenge,
            service:  extractLine("Service interest"),
            timeline: extractLine("Timeline"),
            referral: extractLine("Referral"),
          };

          console.log("📋 Parsed form data:", JSON.stringify(formData, null, 2));
        } else {
          console.log("⚠️ No HubSpot contact found for email:", email);
        }
      } else {
        const errText = await searchRes.text();
        console.error("❌ HubSpot search failed:", searchRes.status, errText);
      }
    } catch (err) {
      console.error("❌ HubSpot lookup threw:", err);
    }
  }

  // ── Send Jeff the notification email ────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {

    // ── Application form section ─────────────────────────────────────────────
    const formSection = formData
      ? `
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <h3 style="margin:0 0 16px 0;color:#111;font-size:16px">📋 Landing Page Application</h3>

        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#888;width:140px;vertical-align:top">Name</td>
            <td style="padding:8px 0;font-weight:600">${(formData.firstname ?? "") + " " + (formData.lastname ?? "")}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Company</td>
            <td style="padding:8px 0;font-weight:600">${formData.company || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Website</td>
            <td style="padding:8px 0">
              ${formData.website
                ? `<a href="${formData.website}" style="color:#C87941">${formData.website}</a>`
                : "—"}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Service</td>
            <td style="padding:8px 0">${formData.service || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Timeline</td>
            <td style="padding:8px 0">${formData.timeline || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Referral</td>
            <td style="padding:8px 0">${formData.referral || "—"}</td>
          </tr>
        </table>

        <p style="margin:16px 0 6px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888">
          Their Biggest Challenge
        </p>
        <div style="background:#f9f9f9;padding:14px 16px;border-left:3px solid #C87941;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap">
${formData.challenge || "—"}
        </div>
      `
      : `
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <div style="background:#fff8f0;padding:12px 16px;border-left:3px solid #f0a060;border-radius:4px;color:#555;font-size:13px">
          ⚠️ <strong>No landing page form found for this email.</strong><br/>
          They may have booked directly via Calendly without submitting the website application first.
          Check HubSpot manually for any existing contact record.
        </div>
      `;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">

        <h2 style="color:#C87941;margin-bottom:4px">📅 Discovery Call Booked</h2>
        <p style="color:#666;margin-top:0;font-size:14px">Someone just scheduled a call with you on Calendly.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <h3 style="margin:0 0 14px 0;color:#111;font-size:16px">📆 Meeting Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#888;width:140px">Name</td>
            <td style="padding:8px 0;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Email</td>
            <td style="padding:8px 0">
              <a href="mailto:${email}" style="color:#C87941">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Time</td>
            <td style="padding:8px 0;font-weight:600">${formatTime(startTime)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">End Time</td>
            <td style="padding:8px 0">${formatTime(endTime)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Timezone</td>
            <td style="padding:8px 0">${timezone}</td>
          </tr>
        </table>

        ${formSection}

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px;margin:0">90 Day Turnaround · 90dayturnaround.ca</p>

      </div>
    `;

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
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
      console.log("📧 Resend status:", emailRes.status);
      if (!emailRes.ok) {
        console.error("❌ Resend error:", await emailRes.text());
      }
    } catch (err) {
      console.error("❌ Resend threw:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
