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

  // Calendly v2 API webhooks: payload.invitee and payload.event may be
  // inline objects OR URI strings depending on the webhook format.
  const inviteeRaw = payload?.invitee;
  const invitee = typeof inviteeRaw === "object" && inviteeRaw !== null
    ? (inviteeRaw as Record<string, unknown>)
    : undefined;

  const eventRaw = payload?.event;
  const meeting = typeof eventRaw === "object" && eventRaw !== null
    ? (eventRaw as Record<string, unknown>)
    : undefined;

  // questions_and_answers — array format: [{question, answer}, ...]
  // Populated for custom questions added to the Calendly event type.
  const qas = (payload?.questions_and_answers ?? []) as Array<{ question: string; answer: string }>;

  // questions_and_responses — flat format: {"1_question": "Email", "1_response": "...", ...}
  // Used for standard fields (name/email) when invitee is a URI reference.
  const qrs = (payload?.questions_and_responses ?? {}) as Record<string, string>;

  // Helper: search questions_and_answers by keyword
  const findInQAS = (keyword: RegExp): string =>
    qas.find(qa => keyword.test(qa.question ?? ""))?.answer?.trim() ?? "";

  // Helper: search questions_and_responses (flat numbered object) by keyword
  const findInQRS = (keyword: RegExp): string => {
    const keys = Object.keys(qrs);
    for (const key of keys) {
      if (key.endsWith("_question") && keyword.test(qrs[key] ?? "")) {
        return qrs[key.replace("_question", "_response")] ?? "";
      }
    }
    return "";
  };

  console.log("🔑 QAs count:", qas.length, "| QRS keys:", Object.keys(qrs).length,
              "| invitee type:", typeof inviteeRaw, "| event type:", typeof eventRaw);

  // ── Extract standard fields — try all possible locations ─────────────────────
  const emailRaw =
    (invitee?.email as string | null | undefined) ||
    findInQAS(/email/i) ||
    findInQRS(/email/i) ||
    "";
  const email = emailRaw.trim().toLowerCase();

  const name =
    (invitee?.name as string) ||
    `${(invitee?.first_name as string) || ""} ${(invitee?.last_name as string) || ""}`.trim() ||
    findInQAS(/^name$/i) ||
    findInQRS(/name/i) ||
    "Unknown";

  const timezone = (invitee?.timezone as string) || "";

  // cancel_url and reschedule_url are always directly in the payload (no API call needed)
  const cancelUrl     = (payload?.cancel_url     as string) || "";
  const rescheduleUrl = (payload?.reschedule_url as string) || "";

  // ── Extract custom Calendly question answers ──────────────────────────────────
  const company   = findInQAS(/company/i);
  const website   = findInQAS(/website/i);
  const challenge = findInQAS(/challenge/i);
  const service   = findInQAS(/service/i);
  const timeline  = findInQAS(/timeline/i);
  const referral  = findInQAS(/referral|hear about/i);

  console.log("📌 Extracted — name:", name, "| email:", email);
  console.log("📋 Custom answers — company:", company, "| service:", service, "| timeline:", timeline);

  // ── Guard: skip only if we have absolutely nothing useful (true test ping) ───
  if (!email && name === "Unknown") {
    console.log("⚠️ No usable data — Calendly test ping, skipping");
    return NextResponse.json({ ok: true, skipped: true, reason: "empty_payload" });
  }

  // ── Fetch full event details from Calendly API ────────────────────────────────
  // payload.event is a URI string in v2 webhooks, so start_time / end_time / join_url
  // are NOT in the payload directly — we must call the Calendly API to get them.
  let startTime = (meeting?.start_time as string) || "";
  let endTime   = (meeting?.end_time   as string) || "";
  let joinUrl   = "";

  if (typeof eventRaw === "string" && process.env.CALENDLY_TOKEN) {
    try {
      const eventUuid = (eventRaw as string).split("/").pop();
      const evRes = await fetch(
        `https://api.calendly.com/scheduled_events/${eventUuid}`,
        { headers: { Authorization: `Bearer ${process.env.CALENDLY_TOKEN}` } }
      );
      console.log("📅 Calendly event fetch status:", evRes.status);
      if (evRes.ok) {
        const evData = await evRes.json() as { resource?: Record<string, unknown> };
        const r = evData.resource ?? {};
        startTime = startTime || (r.start_time as string) || "";
        endTime   = endTime   || (r.end_time   as string) || "";
        const loc = r.location as Record<string, unknown> | undefined;
        joinUrl   = (loc?.join_url  as string)
                 || (loc?.location  as string)
                 || "";
        console.log("✅ Calendly event — start:", startTime, "| joinUrl:", joinUrl || "(none)");
      }
    } catch (err) {
      console.error("❌ Calendly event fetch threw:", err);
    }
  } else if (!process.env.CALENDLY_TOKEN) {
    console.warn("⚠️ CALENDLY_TOKEN not set — cannot fetch meeting time or join URL");
  }

  // Format the meeting time nicely (Mountain/Edmonton time)
  const formatTime = (iso: string) => {
    if (!iso) return "—";
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

  // ── Create / update HubSpot contact from Calendly booking data ───────────────
  if (process.env.HUBSPOT_TOKEN && email) {
    try {
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || name;
      const lastName  = nameParts.slice(1).join(" ") || "";

      const contactProps: Record<string, string> = {
        email,
        firstname:        firstName,
        lastname:         lastName,
        lifecyclestage:   "lead",
        contact_type:     "Prospect",
        hs_lead_status:   "NEW",
      };
      if (company)   contactProps.company = company;
      if (website)   contactProps.website = website;
      if (challenge || service || timeline || referral) {
        contactProps.message =
          `Challenge: ${challenge}\n\nService interest: ${service}\nTimeline: ${timeline}\nReferral: ${referral}`;
      }

      // Try to create — if contact already exists (409) fall back to PATCH
      const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
        },
        body: JSON.stringify({ properties: contactProps }),
      });

      console.log("🏗️ HubSpot create status:", createRes.status);

      if (createRes.status === 409) {
        // Contact already exists — look up their ID then patch
        const searchRes = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            },
            body: JSON.stringify({
              filterGroups: [{
                filters: [{ propertyName: "email", operator: "EQ", value: email }],
              }],
              properties: ["hs_object_id"],
              limit: 1,
            }),
          }
        );
        if (searchRes.ok) {
          const sd = await searchRes.json();
          const contactId = sd.results?.[0]?.id as string | undefined;
          if (contactId) {
            const patchRes = await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
                },
                body: JSON.stringify({ properties: contactProps }),
              }
            );
            console.log("✅ HubSpot contact updated:", contactId, "status:", patchRes.status);
          }
        }
      } else if (createRes.ok) {
        const created = await createRes.json() as { id?: string };
        console.log("✅ HubSpot contact created:", created.id);
      } else {
        const errText = await createRes.text();
        console.error("❌ HubSpot create failed:", createRes.status, errText);
      }
    } catch (err) {
      console.error("❌ HubSpot create/update threw:", err);
    }
  }

  // ── Send Jeff the notification email ────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {

    // ── Application / booking form section ───────────────────────────────────
    const hasFormData = !!(company || website || challenge || service || timeline || referral);

    const formSection = hasFormData
      ? `
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <h3 style="margin:0 0 16px 0;color:#111;font-size:16px">📋 Booking Form Answers</h3>

        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#888;width:140px;vertical-align:top">Company</td>
            <td style="padding:8px 0;font-weight:600">${company || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Website</td>
            <td style="padding:8px 0">
              ${website
                ? `<a href="${website}" style="color:#C87941">${website}</a>`
                : "—"}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Service</td>
            <td style="padding:8px 0">${service || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Timeline</td>
            <td style="padding:8px 0">${timeline || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Referral</td>
            <td style="padding:8px 0">${referral || "—"}</td>
          </tr>
        </table>

        <p style="margin:16px 0 6px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888">
          Their Biggest Challenge
        </p>
        <div style="background:#f9f9f9;padding:14px 16px;border-left:3px solid #C87941;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap">
${challenge || "—"}
        </div>
      `
      : `
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <div style="background:#fff8f0;padding:12px 16px;border-left:3px solid #f0a060;border-radius:4px;color:#555;font-size:13px">
          ⚠️ <strong>No custom form answers found.</strong><br/>
          They may have booked without answering the custom questions, or the answers were in an unexpected format.
          Check HubSpot for the contact record.
        </div>
      `;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">

        <!-- Header -->
        <h2 style="color:#C87941;margin:0 0 4px 0">📅 Discovery Call Booked</h2>
        <p style="color:#666;margin:0 0 24px 0;font-size:14px">
          ${name} just confirmed their Calendly slot. Their full application is below.
        </p>

        <!-- ── Meeting time block ── -->
        <div style="background:#fff8f2;border:1px solid #f0d0b0;border-radius:8px;padding:20px 24px;margin-bottom:24px">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C87941">Scheduled For</p>
          <p style="margin:0 0 2px 0;font-size:20px;font-weight:800;color:#111">${formatTime(startTime)}</p>
          ${endTime ? `<p style="margin:0;font-size:13px;color:#888">Ends: ${formatTime(endTime)}${timezone ? " · " + timezone : ""}</p>` : ""}
        </div>

        <!-- ── Join / action buttons ── -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            ${joinUrl ? `
            <td style="padding-right:8px">
              <a href="${joinUrl}" style="display:block;background:#C87941;color:#fff;font-weight:700;font-size:14px;text-align:center;padding:12px 16px;border-radius:6px;text-decoration:none">
                🎥 Join Meeting
              </a>
            </td>` : ""}
            ${cancelUrl ? `
            <td style="padding-right:8px">
              <a href="${cancelUrl}" style="display:block;background:#f5f5f5;color:#555;font-weight:600;font-size:14px;text-align:center;padding:12px 16px;border-radius:6px;text-decoration:none;border:1px solid #ddd">
                ✕ Cancel
              </a>
            </td>` : ""}
            ${rescheduleUrl ? `
            <td>
              <a href="${rescheduleUrl}" style="display:block;background:#f5f5f5;color:#555;font-weight:600;font-size:14px;text-align:center;padding:12px 16px;border-radius:6px;text-decoration:none;border:1px solid #ddd">
                ↺ Reschedule
              </a>
            </td>` : ""}
          </tr>
        </table>

        <!-- ── Contact details ── -->
        <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px 0"/>
        <h3 style="margin:0 0 12px 0;color:#111;font-size:15px">👤 Contact Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr>
            <td style="padding:7px 0;color:#888;width:130px">Name</td>
            <td style="padding:7px 0;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#888">Email</td>
            <td style="padding:7px 0"><a href="mailto:${email}" style="color:#C87941">${email || "—"}</a></td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#888">Company</td>
            <td style="padding:7px 0;font-weight:600">${company || "—"}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#888">Website</td>
            <td style="padding:7px 0">${website ? `<a href="${website}" style="color:#C87941">${website}</a>` : "—"}</td>
          </tr>
        </table>

        ${formSection}

        <!-- Footer -->
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 12px 0"/>
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
          subject: `📅 Call Booked: ${name}${startTime ? " — " + formatTime(startTime) : ""}`,
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
