import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { fname, lname, email, company, website, challenge, service, timeline, referral } =
    await req.json();

  // ── HubSpot — create / update contact ────────────────────────────────────────
  // Called when a visitor submits Step 1 of the booking form.
  // Goal: capture the lead in HubSpot even if they don't complete the Calendly booking.
  // No email notification here — that comes from the Calendly webhook on actual booking.
  if (process.env.HUBSPOT_TOKEN) {
    try {
      const hsBody = {
        properties: {
          email,
          firstname:        fname,
          lastname:         lname,
          company,
          website,
          message:          `Challenge: ${challenge}\n\nService interest: ${service}\nTimeline: ${timeline}\nReferral: ${referral}`,
          lifecyclestage:   "lead",
          contact_type:     "Prospect",
          hs_lead_status:   "NEW",
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

      console.log("🏗️ HubSpot /submit create status:", hsRes.status);

      // 409 = contact already exists → patch instead
      if (hsRes.status === 409) {
        // Extract ID from error message or do a search
        const errJson = await hsRes.json().catch(() => ({})) as Record<string, unknown>;
        let contactId = (errJson?.message as string)?.match(/ID: (\d+)/)?.[1];

        if (!contactId) {
          // Fallback: search by email
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
            contactId = sd.results?.[0]?.id;
          }
        }

        if (contactId) {
          const patchRes = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
              },
              body: JSON.stringify(hsBody),
            }
          );
          console.log("✅ HubSpot contact updated (submit):", contactId, "status:", patchRes.status);
        } else {
          console.error("❌ HubSpot 409 but could not find contact ID");
        }
      } else if (hsRes.ok) {
        const created = await hsRes.json() as { id?: string };
        console.log("✅ HubSpot contact created (submit):", created.id);
      } else {
        const err = await hsRes.text();
        console.error("❌ HubSpot create failed (submit):", hsRes.status, err);
      }
    } catch (e) {
      console.error("❌ HubSpot error (submit):", String(e));
    }
  }

  return NextResponse.json({ ok: true });
}
