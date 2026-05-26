import { NextRequest, NextResponse } from "next/server";

// ── Called from the browser the moment someone confirms their Calendly slot ──
// Triggered by the `calendly.event_scheduled` postMessage event.
// Uses Step 1 form data (passed from the frontend) to notify Jeff immediately.

export async function POST(req: NextRequest) {
  const {
    fname = "", lname = "", email = "", company = "",
    website = "", challenge = "", service = "", timeline = "", referral = "",
  } = await req.json();

  const name = `${fname} ${lname}`.trim() || "Unknown";

  const serviceLabel: Record<string, string> = {
    "90-day-turnaround-sprint":      "90-Day Turnaround Sprint",
    "growth-accelerator-advisory":   "Growth Accelerator Advisory",
    "ai-leverage-implementation":    "AI Leverage Implementation",
    "expansion-readiness-blueprint": "Expansion Readiness Blueprint",
    "not-sure":                      "Not sure yet",
  };
  const timelineLabel: Record<string, string> = {
    "immediately": "Immediately",
    "30-days":     "Within 30 days",
    "90-days":     "Within 90 days",
    "exploring":   "Just exploring",
  };
  const referralLabel: Record<string, string> = {
    "linkedin": "LinkedIn",
    "referral": "Referral",
    "google":   "Google",
    "other":    "Other",
  };

  const serviceText  = serviceLabel[service]   ?? service   ?? "—";
  const timelineText = timelineLabel[timeline]  ?? timeline  ?? "—";
  const referralText = referralLabel[referral]  ?? referral  ?? "—";

  // ── Update HubSpot contact: mark lifecycle as salesqualifiedlead ──────────
  if (process.env.HUBSPOT_TOKEN && email) {
    try {
      // Search for the contact by email
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
          await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
              },
              body: JSON.stringify({
                properties: { lifecyclestage: "salesqualifiedlead" },
              }),
            }
          );
          console.log("✅ HubSpot contact updated to salesqualifiedlead:", contactId);
        }
      }
    } catch (err) {
      console.error("❌ HubSpot update threw:", err);
    }
  }

  // ── Send Jeff the booking notification email ──────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">

        <h2 style="color:#C87941;margin-bottom:4px">📅 Discovery Call Booked</h2>
        <p style="color:#666;margin-top:0;font-size:14px">
          ${name} just confirmed their Calendly slot. Their full application is below.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <h3 style="margin:0 0 14px 0;color:#111;font-size:16px">👤 Contact Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#888;width:140px">Name</td>
            <td style="padding:8px 0;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Email</td>
            <td style="padding:8px 0">
              <a href="mailto:${email}" style="color:#C87941">${email || "—"}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Company</td>
            <td style="padding:8px 0;font-weight:600">${company || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888">Website</td>
            <td style="padding:8px 0">
              ${website
                ? `<a href="${website}" style="color:#C87941">${website}</a>`
                : "—"}
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <h3 style="margin:0 0 14px 0;color:#111;font-size:16px">📋 Application Answers</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#888;width:140px;vertical-align:top">Service</td>
            <td style="padding:8px 0">${serviceText}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Timeline</td>
            <td style="padding:8px 0">${timelineText}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top">Referral</td>
            <td style="padding:8px 0">${referralText}</td>
          </tr>
        </table>

        <p style="margin:20px 0 6px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888">
          Their Biggest Challenge
        </p>
        <div style="background:#f9f9f9;padding:14px 16px;border-left:3px solid #C87941;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap">
${challenge || "—"}
        </div>

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
          to:   [process.env.NOTIFY_EMAIL ?? "jeff@90dayturnaround.ca"],
          subject: `📅 Call Booked: ${name} — ${company || "Unknown Company"}`,
          html,
        }),
      });
      console.log("📧 Booking notification sent — Resend status:", emailRes.status);
      if (!emailRes.ok) {
        console.error("❌ Resend error:", await emailRes.text());
      }
    } catch (err) {
      console.error("❌ Resend threw:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
