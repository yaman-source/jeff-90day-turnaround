import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { fname, lname, email, company, website, challenge, service, timeline, referral } =
    await req.json();

  const errors: string[] = [];

  // ── 1. HubSpot — create / update contact ──────────────────────────────────
  if (process.env.HUBSPOT_TOKEN) {
    try {
      const hsBody = {
        properties: {
          email,
          firstname: fname,
          lastname: lname,
          company,
          website,
          message: `Challenge: ${challenge}\n\nService interest: ${service}\nTimeline: ${timeline}\nReferral: ${referral}`,
        },
      };

      const hsRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
        },
        body: JSON.stringify(hsBody),
      });

      // 409 = contact already exists → patch instead
      if (hsRes.status === 409) {
        const existing = await hsRes.json();
        const contactId = existing?.message?.match(/ID: (\d+)/)?.[1];
        if (contactId) {
          await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            },
            body: JSON.stringify(hsBody),
          });
        }
      } else if (!hsRes.ok) {
        const err = await hsRes.text();
        errors.push(`HubSpot: ${err}`);
      }
    } catch (e) {
      errors.push(`HubSpot error: ${String(e)}`);
    }
  }

  // ── 2. Email notification via Resend ──────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="color:#C87941;margin-bottom:4px">New Discovery Call Application</h2>
          <p style="color:#666;margin-top:0">Submitted via jeff-90days.vercel.app</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${fname} ${lname}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C87941">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#888">Company</td><td style="padding:8px 0">${company}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Website</td><td style="padding:8px 0"><a href="${website}" style="color:#C87941">${website}</a></td></tr>
            <tr><td style="padding:8px 0;color:#888">Service</td><td style="padding:8px 0">${service}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Timeline</td><td style="padding:8px 0">${timeline}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Referral</td><td style="padding:8px 0">${referral}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <h3 style="margin-bottom:8px">Biggest Challenge</h3>
          <p style="background:#f9f9f9;padding:16px;border-left:3px solid #C87941;margin:0;border-radius:4px">${challenge}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#aaa;font-size:12px">90 Day Turnaround · jeff-90days.vercel.app</p>
        </div>
      `;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "90 Day Turnaround <onboarding@resend.dev>",
          to: [process.env.NOTIFY_EMAIL ?? "jeff@90dayturnaround.ca"],
          subject: `New Application: ${fname} ${lname} — ${company}`,
          html: emailHtml,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        errors.push(`Resend: ${err}`);
      }
    } catch (e) {
      errors.push(`Resend error: ${String(e)}`);
    }
  }

  // Always return 200 to the browser — errors are logged server-side only
  return NextResponse.json({ ok: true, errors: errors.length ? errors : undefined });
}
