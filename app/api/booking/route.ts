import { NextRequest, NextResponse } from "next/server";

// ── Browser-triggered booking notification ───────────────────────────────────
// Called from page.tsx when the Calendly widget fires `calendly.event_scheduled`
// in the browser. We receive the event URI and invitee URI, then call the
// Calendly API to get full meeting details (time, join URL, custom answers).
//
// This is the primary notification path — more reliable than relying on the
// Calendly server-to-server webhook, which may be subscribed to the wrong events.

export async function POST(req: NextRequest) {
  let body: { eventUri?: string; inviteeUri?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventUri, inviteeUri } = body;

  if (!eventUri || !inviteeUri) {
    console.error("❌ /api/booking: missing eventUri or inviteeUri");
    return NextResponse.json({ error: "Missing eventUri or inviteeUri" }, { status: 400 });
  }

  console.log("📅 /api/booking triggered — event:", eventUri);

  if (!process.env.CALENDLY_TOKEN) {
    console.error("❌ CALENDLY_TOKEN not set — cannot fetch Calendly details");
    return NextResponse.json({ error: "CALENDLY_TOKEN not configured" }, { status: 500 });
  }

  const calHeaders = {
    Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
    "Content-Type": "application/json",
  };

  // ── 1. Fetch event details (time, join URL) ────────────────────────────────
  let startTime   = "";
  let endTime     = "";
  let joinUrl     = "";

  try {
    const evRes = await fetch(eventUri, { headers: calHeaders });
    console.log("📅 Calendly event fetch status:", evRes.status);
    if (evRes.ok) {
      const evData = await evRes.json() as { resource?: Record<string, unknown> };
      const r = evData.resource ?? {};
      startTime = (r.start_time as string) || "";
      endTime   = (r.end_time   as string) || "";
      const loc = r.location as Record<string, unknown> | undefined;
      joinUrl   = (loc?.join_url  as string)
               || (loc?.location  as string)
               || "";
      console.log("✅ Event — start:", startTime, "| joinUrl:", joinUrl || "(none)");
    } else {
      console.error("❌ Calendly event fetch failed:", evRes.status, await evRes.text());
    }
  } catch (err) {
    console.error("❌ Calendly event fetch threw:", err);
  }

  // ── 2. Fetch invitee details (name, email, answers, cancel/reschedule URLs) ─
  let name          = "Unknown";
  let email         = "";
  let cancelUrl     = "";
  let rescheduleUrl = "";
  let company       = "";
  let website       = "";
  let challenge     = "";
  let service       = "";
  let timeline      = "";
  let referral      = "";

  try {
    const invRes = await fetch(inviteeUri, { headers: calHeaders });
    console.log("👤 Calendly invitee fetch status:", invRes.status);
    if (invRes.ok) {
      const invData = await invRes.json() as { resource?: Record<string, unknown> };
      const r = invData.resource ?? {};
      name          = (r.name  as string) || "Unknown";
      email         = ((r.email as string) || "").toLowerCase().trim();
      cancelUrl     = (r.cancel_url     as string) || "";
      rescheduleUrl = (r.reschedule_url as string) || "";

      // Custom question answers (array of {question, answer})
      const qas = (r.questions_and_answers ?? []) as Array<{ question: string; answer: string }>;
      const findQ = (kw: RegExp) =>
        qas.find(q => kw.test(q.question ?? ""))?.answer?.trim() ?? "";

      company   = findQ(/company/i);
      website   = findQ(/website/i);
      challenge = findQ(/challenge/i);
      service   = findQ(/service/i);
      timeline  = findQ(/timeline/i);
      referral  = findQ(/referral|hear about/i);

      console.log("✅ Invitee — name:", name, "| email:", email);
      console.log("📋 Answers — company:", company, "| service:", service, "| timeline:", timeline);
    } else {
      console.error("❌ Calendly invitee fetch failed:", invRes.status, await invRes.text());
    }
  } catch (err) {
    console.error("❌ Calendly invitee fetch threw:", err);
  }

  // ── 3. Create / update HubSpot contact ───────────────────────────────────
  if (process.env.HUBSPOT_TOKEN && email) {
    try {
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || name;
      const lastName  = nameParts.slice(1).join(" ") || "";

      const contactProps: Record<string, string> = {
        email,
        firstname:      firstName,
        lastname:       lastName,
        lifecyclestage: "lead",
        contact_type:   "Prospect",
        hs_lead_status: "NEW",
      };
      if (company)   contactProps.company = company;
      if (website)   contactProps.website = website;
      if (challenge || service || timeline || referral) {
        contactProps.message =
          `Challenge: ${challenge}\n\nService interest: ${service}\nTimeline: ${timeline}\nReferral: ${referral}`;
      }

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
        // Contact exists — search by email then PATCH
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
          const sd = await searchRes.json() as { results?: Array<{ id: string }> };
          const contactId = sd.results?.[0]?.id;
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
        console.error("❌ HubSpot create failed:", createRes.status, await createRes.text());
      }
    } catch (err) {
      console.error("❌ HubSpot error:", err);
    }
  }

  // ── 4. Send Jeff the notification email ──────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set — skipping email");
    return NextResponse.json({ ok: true, emailSkipped: true });
  }

  const formatTime = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-CA", {
        timeZone:  "America/Edmonton",
        dateStyle: "full",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

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
            ${website ? `<a href="${website}" style="color:#C87941">${website}</a>` : "—"}
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
      <div style="background:#f9f9f9;padding:14px 16px;border-left:3px solid #C87941;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap">${challenge || "—"}</div>
    `
    : `
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <div style="background:#fff8f0;padding:12px 16px;border-left:3px solid #f0a060;border-radius:4px;color:#555;font-size:13px">
        ⚠️ <strong>No custom form answers found.</strong><br/>
        The invitee may not have answered all custom questions. Check HubSpot for their record.
      </div>
    `;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">

      <h2 style="color:#C87941;margin:0 0 4px 0">📅 Discovery Call Booked</h2>
      <p style="color:#666;margin:0 0 24px 0;font-size:14px">
        ${name} just confirmed their Calendly slot. Their full application is below.
      </p>

      <!-- Meeting time block -->
      <div style="background:#fff8f2;border:1px solid #f0d0b0;border-radius:8px;padding:20px 24px;margin-bottom:24px">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C87941">Scheduled For</p>
        <p style="margin:0 0 2px 0;font-size:20px;font-weight:800;color:#111">${formatTime(startTime)}</p>
        ${endTime ? `<p style="margin:0;font-size:13px;color:#888">Ends: ${formatTime(endTime)}</p>` : ""}
      </div>

      <!-- Action buttons -->
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

      <!-- Contact details -->
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
        from:    process.env.RESEND_FROM ?? "90 Day Turnaround <onboarding@resend.dev>",
        to:      [process.env.NOTIFY_EMAIL ?? "jeff@90dayturnaround.ca"],
        subject: `📅 Call Booked: ${name}${startTime ? " — " + formatTime(startTime) : ""}`,
        html,
      }),
    });
    console.log("📧 Resend status:", emailRes.status);
    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("❌ Resend error:", errText);
      return NextResponse.json({ ok: false, resendError: errText }, { status: 500 });
    }
    console.log("✅ Email sent to Jeff");
  } catch (err) {
    console.error("❌ Resend threw:", err);
  }

  return NextResponse.json({ ok: true });
}
