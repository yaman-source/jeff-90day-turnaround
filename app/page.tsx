"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import LampHero from "@/components/ui/lamp-hero";

// ─── Lightweight CSS fade-up (no framer-motion, single IntersectionObserver) ──
const _observer =
  typeof window !== "undefined"
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).style.opacity = "1";
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (_observer as IntersectionObserver).unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

const FadeUp = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !_observer) return;
    _observer.observe(el);
    return () => _observer.unobserve(el);
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

// ─── SVG icons ────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 22 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#C87941" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const CheckIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#C87941" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Problem items ─────────────────────────────────────────────────────────────
const problems = [
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "You're the bottleneck.",
    body: "Every hire, every client escalation, every decision runs through you. Your team can't move without your approval, and that single point of failure is strangling your growth.",
  },
  {
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Revenue is unpredictable.",
    body: "Great months. Terrible months. No clear reason why either way. You can't forecast, can't plan, can't breathe. It's a slow grind.",
  },
  {
    icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    title: "No operating systems.",
    body: "Things get done by memory, heroics, and habit, not by documented, repeatable processes your team can actually own and execute without you.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 1 0-8 4 4 0 0 1 0 8z",
    title: "Your team isn't accountable.",
    body: "Deadlines slip, ownership is fuzzy, and you keep doing work your team should be handling, because it's faster than fighting for accountability.",
  },
  {
    icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    title: "Growth has stalled.",
    body: "You hit a ceiling you can't break past, and it's been months. Maybe years. You know something fundamental needs to change, but what?",
  },
  {
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
    title: "You're busy, not strategic.",
    body: "Your calendar is full but your business isn't moving forward. You're managing instead of leading, reacting instead of building, and the big picture keeps getting buried under today's noise.",
  },
];

// ─── Offer cards ──────────────────────────────────────────────────────────────
const offers = [
  {
    name: "Growth Accelerator Advisory",
    tag: "Ongoing Strategic Advisory",
    desc: "Ongoing strategic guidance and accountability for founders who need a seasoned operator's perspective on the big moves without full hands-on engagement.",
    features: [
      "Strategic guidance & decision support",
      "Weekly accountability sessions",
      "Expansion planning",
      "Team coaching",
    ],
    qualifies: [] as string[],
    investmentLine: "Package price to be determined after discovery call",
    note: "Bundleable with AI Leverage Implementation.",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    featured: false,
  },
  {
    name: "90-Day Turnaround Sprint",
    tag: "Flagship Engagement",
    desc: "Our team works inside your business, full hands-on engagement, not coaching from the sidelines. From discovery through locked-in momentum.",
    features: [
      "Business diagnostic & bottleneck analysis",
      "Leadership alignment session",
      "90-day execution roadmap",
      "KPI scorecard",
      "Weekly accountability cadence",
      "Execution coaching & hands-on support",
      "AI workflow opportunities audit",
    ],
    qualifies: [] as string[],
    investmentLine: "Package price to be determined after discovery call",
    note: "Priced as a complete 90-day bundled engagement.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    featured: true,
  },
  {
    name: "AI Leverage Implementation",
    tag: "AI Systems & Automation",
    desc: "We identify and implement AI-powered systems that save time, reduce cost, and create real leverage inside your business.",
    features: [
      "Sales follow-up automation",
      "CRM workflows & SOP creation",
      "Onboarding systems",
      "AI assistants & internal GPT tools",
      "Reporting automation",
    ],
    qualifies: [] as string[],
    investmentLine: "Package price to be determined after discovery call",
    note: "",
    icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18",
    featured: false,
  },
  {
    name: "Expansion Readiness Blueprint",
    tag: "Franchise & Multi-Unit Growth",
    desc: "For founder-led businesses ready to scale through franchising, multi-unit expansion, acquisitions, or structured geographic growth.",
    features: [
      "Expansion readiness diagnostic",
      "Business model and unit economics review",
      "Founder dependency and scalability assessment",
      "Systems, SOP, and operational repeatability review",
      "Leadership team readiness evaluation",
      "Franchise / licensing / corporate expansion pathway analysis",
      "Growth model decision framework",
      "Expansion roadmap with priorities, milestones, and execution strategy",
      "KPI and support model planning",
      "Optional implementation advisory for rollout execution",
    ],
    qualifies: [] as string[],
    investmentLine: "Package price to be determined after discovery call",
    note: "",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    featured: false,
  },
];

// ─── Form initial state ───────────────────────────────────────────────────────
const emptyForm = {
  fname: "", lname: "", email: "", company: "",
  website: "", challenge: "", service: "", timeline: "", referral: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled,  setScrolled]  = useState(false);
  const [step,      setStep]      = useState<"form" | "calendar">("form");
  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState<Record<string, boolean>>({});

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 48));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  // ── Initialize Calendly inline widget — all data passed via URL params ───────
  useEffect(() => {
    if (step !== "calendar") return;

    // Map slug values → human-readable labels so Calendly text fields show
    // proper sentences instead of raw slugs.
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
      "linkedin":  "LinkedIn",
      "referral":  "Referral",
      "google":    "Google",
      "other":     "Other",
    };

    // Build URL using encodeURIComponent (spaces → %20, not +).
    // URLSearchParams encodes spaces as + which Calendly shows literally.
    const p = (k: string, v: string) =>
      `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;

    const calendlyUrl = [
      "https://calendly.com/jt-sales/30min",
      "?",
      [
        p("background_color", "0D0D0D"),
        p("text_color",       "FFFFFF"),
        p("primary_color",    "C87941"),
        p("hide_gdpr_banner", "1"),
        p("name",  `${form.fname} ${form.lname}`.trim()),
        p("email", form.email),
        p("a1",    form.company),
        p("a2",    form.website),
        p("a3",    form.challenge),
        p("a4",    serviceLabel[form.service]  ?? form.service),
        p("a5",    timelineLabel[form.timeline] ?? form.timeline),
        p("a6",    referralLabel[form.referral] ?? form.referral),
      ].join("&"),
    ].join("");

    const init = () => {
      const w = window as typeof window & {
        Calendly?: { initInlineWidget: (o: unknown) => void };
      };
      if (!w.Calendly) return;
      const container = document.getElementById("calendly-container");
      if (!container) return;
      // Clear any previous widget render before re-initialising
      container.innerHTML = "";
      w.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: container,
      });
    };

    // Small delay ensures the calendly-container DOM node is painted
    const timer = setTimeout(() => {
      const w = window as typeof window & { Calendly?: unknown };
      if (w.Calendly) {
        init();
      } else {
        const existing = document.querySelector('script[src*="calendly"]');
        if (existing) {
          existing.addEventListener("load", init, { once: true });
        } else {
          const s = document.createElement("script");
          s.src = "https://assets.calendly.com/assets/external/widget.js";
          s.onload = init;
          document.body.appendChild(s);
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    Object.entries(form).forEach(([k, v]) => { if (!v.trim()) newErrors[k] = true; });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      document.getElementById(Object.keys(newErrors)[0])
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // Save to HubSpot + send pre-notification email (fire-and-forget)
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    // Switch to calendar step
    setStep("calendar");
    setTimeout(
      () => document.getElementById("qualify")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
  };

  return (
    <main className="bg-[#0D0D0D] text-white" style={{ overflowX: "clip" }}>

      {/* ════════════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════════════ */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          backgroundColor: scrolled ? "rgba(13,13,13,0.97)" : "rgba(13,13,13,0.72)",
          boxShadow: scrolled ? "0 1px 0 rgba(200,121,65,0.15)" : "none",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          transition: "background-color 0.25s ease, box-shadow 0.25s ease",
          transform: "translateZ(0)",
          willChange: "auto",
        }}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center">
          <img src="/logo.svg" alt="90 Day Turnaround" width={110} height={70} style={{ height: "64px", width: "auto" }} />
        </a>
        <button
          onClick={() => scrollTo("qualify")}
          className="bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-sm px-5 py-2.5 rounded-[6px] transition-colors duration-200"
        >
          Book a Discovery Call
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <LampHero
        headline={{ line1: "Your Business", line2: "Has Hit a Ceiling.", line3: "Let's Break Through It." }}
        subtitle="You've built something real, but growth has stalled, chaos is creeping in, and you're doing too much yourself. 90 days is all it takes to change that."
        buttons={{
          primary: { text: "Book a Discovery Call", onClick: () => scrollTo("qualify") },
          secondary: { text: "View Services →", onClick: () => scrollTo("offers") },
        }}
        note="No fluff. No generic advice. Serious founders only."
        identity={{ name: "Jeff Lawrence", title: "90-Day Business Turnaround Specialist · 90DayTurnaround.ca" }}
      />

      {/* ════════════════════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#111827] border-y border-[#C87941]/15">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { num: "30+", label: "Years of C-Suite Experience" },
            { num: "$7M→$47M", label: "Revenue Growth in Two Years" },
            { num: "$20M+", label: "Business Built, Scaled & Exited" },
            { num: "90-Day", label: "Locked-In Momentum Framework" },
          ].map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.08}>
              <div className={`flex flex-col items-center text-center px-6 py-10 ${i < 3 ? "border-r border-white/[0.05]" : ""} ${i < 2 ? "border-b border-white/[0.05] md:border-b-0" : ""}`}>
                <span className="text-4xl font-black text-[#C87941] tracking-tight leading-none mb-2.5">{s.num}</span>
                <p className="text-[13px] text-[#9CA3AF] font-medium leading-snug max-w-[140px]">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PROBLEM SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941]">
              Sound Familiar?
            </span>
          </FadeUp>

          <div className="mt-10 grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <FadeUp delay={0.05}>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                  You&apos;ve Got Revenue.
                  <br />
                  <span className="text-[#C87941]">You&apos;re Still Stuck.</span>
                </h2>
                <p className="text-[#9CA3AF] text-lg mb-10 leading-relaxed">
                  If any of these feel uncomfortably close to home, keep reading.
                </p>
              </FadeUp>

              <ul className="space-y-3">
                {problems.map((p, i) => (
                  <FadeUp key={p.title} delay={0.06 * i}>
                    <li className="group flex gap-4 p-5 rounded-lg bg-white/[0.018] border border-white/[0.055] hover:border-[#C87941]/25 hover:bg-[#C87941]/[0.025] transition-all duration-200">
                      <div className="flex-shrink-0 mt-0.5"><Icon path={p.icon} /></div>
                      <p className="text-[15px] text-[#9CA3AF] leading-relaxed">
                        <strong className="text-white font-semibold">{p.title}</strong>{" "}{p.body}
                      </p>
                    </li>
                  </FadeUp>
                ))}
              </ul>
            </div>

            <FadeUp delay={0.2}>
              <div className="sticky top-28 p-10 rounded-xl bg-gradient-to-br from-[#C87941]/10 to-[#C87941]/[0.03] border border-[#C87941]/30">
                <h3 className="text-2xl font-bold leading-snug mb-5">
                  If this sounds like you, keep reading.
                </h3>
                <p className="text-[#9CA3AF] text-[15px] leading-relaxed mb-4">
                  These aren&apos;t permanent problems. They&apos;re solvable. With the right
                  team in your corner, the right systems, and 90 focused days to execute.
                </p>
                <p className="text-[#9CA3AF] text-[15px] leading-relaxed mb-8">
                  Our team has been inside businesses just like yours. We don&apos;t coach from
                  the sidelines. We roll up our sleeves, find the breaks, and help you fix them. Fast.
                </p>
                <button
                  onClick={() => scrollTo("qualify")}
                  className="w-full bg-[#C87941] hover:bg-[#b06830] text-white font-bold py-4 rounded-[6px] transition-colors duration-200 text-center"
                >
                  Book a Discovery Call
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ANIMATED PATHS CTA
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 bg-[#111827] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[
            { dur: "9s", w: "1.2", op: "0.7", v: ["M-80,300 C180,100 380,520 600,240 C820,-20 1020,440 1200,200 C1380,-20 1440,340 1600,180","M-80,160 C180,440 380,60 600,400 C820,600 1020,100 1200,440 C1380,600 1440,140 1600,380","M-80,300 C180,100 380,520 600,240 C820,-20 1020,440 1200,200 C1380,-20 1440,340 1600,180"] },
            { dur: "12s", w: "0.8", op: "0.5", v: ["M-80,460 C240,230 480,560 700,280 C900,10 1100,480 1320,220 C1480,40 1560,380 1700,220","M-80,100 C240,400 480,50 700,420 C900,680 1100,100 1320,440 C1480,640 1560,100 1700,440","M-80,460 C240,230 480,560 700,280 C900,10 1100,480 1320,220 C1480,40 1560,380 1700,220"] },
            { dur: "15s", w: "1.8", op: "0.25", v: ["M-80,120 C200,340 460,60 660,360 C860,600 1100,80 1340,360 C1520,540 1600,180 1720,360","M-80,520 C200,60 460,560 660,80 C860,0 1100,580 1340,80 C1520,0 1600,520 1720,80","M-80,120 C200,340 460,60 660,360 C860,600 1100,80 1340,360 C1520,540 1600,180 1720,360"] },
            { dur: "7s", w: "0.5", op: "0.6", v: ["M0,380 Q360,40 720,380 T1440,380","M0,180 Q360,580 720,180 T1440,180","M0,380 Q360,40 720,380 T1440,380"] },
            { dur: "11s", w: "0.9", op: "0.3", v: ["M-100,560 C340,280 620,680 920,320 C1140,80 1360,480 1640,280","M-100,80 C340,420 620,0 920,420 C1140,620 1360,80 1640,440","M-100,560 C340,280 620,680 920,320 C1140,80 1360,480 1640,280"] },
          ].map((p, i) => (
            <path key={i} fill="none" stroke="#C87941" strokeWidth={p.w} strokeLinecap="round" opacity={p.op}>
              <animate attributeName="d" dur={p.dur} repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" values={p.v.join(";")} />
            </path>
          ))}
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-5">
              The Decision Point
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6">
              You Can Keep Running on Empty
              <br />
              <span className="text-[#C87941]">Or Change Everything in 90 Days.</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Businesses that break through aren&apos;t the ones with the most capital. They&apos;re
              the ones whose founders were willing to stop, fix what&apos;s broken, and execute
              with intention. That&apos;s what we build together.
            </p>
            <button
              onClick={() => scrollTo("qualify")}
              className="bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-[16px] px-14 py-4 rounded-[6px] transition-colors duration-200"
            >
              Book a Discovery Call
            </button>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          OFFERS / SERVICES
      ════════════════════════════════════════════════════════════════ */}
      <section id="offers" className="py-28 px-6 bg-[#0D0D0D]">
        <div className="max-w-[1600px] mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
              Four Ways to Work With Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Choose Your Engagement Level
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto leading-relaxed">
              From full hands-on execution to a focused standalone blueprint, there&apos;s a model
              built for where you are right now.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {offers.map((offer, i) => (
              <FadeUp key={offer.name} delay={i * 0.1}>
                <div className={`relative flex flex-col rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-1 ${offer.featured ? "bg-gradient-to-b from-[#C87941]/10 to-[#C87941]/[0.02] border-2 border-[#C87941]/60 shadow-[0_0_60px_rgba(200,121,65,0.12)]" : "bg-white/[0.025] border border-white/[0.08] hover:border-[#C87941]/25"}`}>
                  {offer.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C87941] text-white text-[10px] font-black uppercase tracking-[1.2px] px-5 py-1.5 rounded-full whitespace-nowrap">
                      Flagship · Most Requested
                    </div>
                  )}

                  <div className="w-11 h-11 rounded-lg bg-[#C87941]/10 flex items-center justify-center mb-5">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#C87941" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={offer.icon} />
                    </svg>
                  </div>

                  <p className="text-lg font-bold mb-1">{offer.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#C87941] mb-4">{offer.tag}</p>

                  <div className="mb-5 pb-5 border-b border-white/[0.06]">
                    <p className="text-[13px] text-[#C87941]/80 italic">{offer.investmentLine}</p>
                  </div>

                  <p className="text-[14px] text-[#9CA3AF] leading-relaxed mb-6">{offer.desc}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {offer.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#9CA3AF]">
                        <CheckIcon />{f}
                      </li>
                    ))}
                  </ul>

                  {offer.qualifies.length > 0 && (
                    <div className="mb-6 p-4 rounded-lg bg-[#C87941]/[0.06] border border-[#C87941]/20">
                      <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#C87941] mb-3">This is right for you if…</p>
                      <ul className="space-y-2">
                        {offer.qualifies.map((q) => (
                          <li key={q} className="flex items-start gap-2 text-[13px] text-[#9CA3AF]">
                            <CheckIcon />{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {offer.note ? (
                    <div className="border-t border-white/[0.06] pt-5 mb-6">
                      <p className="text-[12px] text-[#4A5568] leading-relaxed">{offer.note}</p>
                    </div>
                  ) : <div className="mb-6" />}

                  <button
                    onClick={() => scrollTo("qualify")}
                    className="w-full py-3.5 rounded-[6px] font-bold text-sm transition-colors duration-200 bg-[#C87941] hover:bg-[#b06830] text-white"
                  >
                    Book a Discovery Call
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.2}>
            <div className="mt-16 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-xl font-black">
                <span className="text-[#C87941]">Stabilize</span>
                <span className="text-[#C87941]/40">→</span>
                <span className="text-[#C87941]">Strengthen</span>
                <span className="text-[#C87941]/40">→</span>
                <span className="text-[#C87941]">Leverage</span>
                <span className="text-[#C87941]/40">→</span>
                <span className="text-[#C87941]">Scale</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-[#111827]">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">The Process</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Simple. Focused. <span className="text-[#C87941]">Executed Together.</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-md mx-auto">
              No complex onboarding. No wasted weeks. We move fast from day one.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-[44px] left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] h-px bg-gradient-to-r from-[#C87941] via-[#C87941]/30 to-[#C87941]" />
            {[
              { n: "01", title: "Discovery Call", body: "We talk. Our team gets clear on where you are, where you want to go, and whether there's a real fit. If there is, we move to a full audit. If not, we'll tell you honestly." },
              { n: "02", title: "90-Day Roadmap", body: "We audit your business, operations, sales, team, and systems, then build a custom execution roadmap with clear priorities, owners, and measurable goalposts." },
              { n: "03", title: "Execute Together", body: "We execute alongside you, weekly sessions, real-time accountability, and course corrections until the momentum is locked in and self-sustaining." },
            ].map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center px-8 py-4">
                  <div className="relative z-10 w-[88px] h-[88px] rounded-full bg-[#C87941]/10 border-2 border-[#C87941] flex items-center justify-center text-3xl font-black text-[#C87941] mb-7">
                    {step.n}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-[14px] text-[#9CA3AF] leading-relaxed">{step.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ABOUT JEFF
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[360px_1fr] gap-20 items-center">
            <FadeUp>
              <div className="relative">
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.07]">
                  <img src="/jeff-pro.jpg" alt="Jeff Lawrence — Founder, 90 Day Turnaround" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute -bottom-5 -right-5 bg-[#0D0D0D]/95 border border-[#C87941]/30 rounded-xl px-5 py-4 text-center backdrop-blur-sm">
                  <strong className="block text-3xl font-black text-[#C87941] tracking-tight">30+</strong>
                  <span className="text-[12px] text-[#9CA3AF] leading-snug block mt-1">
                    Years of C-Suite<br />Experience
                  </span>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">About Jeff Lawrence</span>
              <div className="w-12 h-[3px] bg-[#C87941] rounded-full mb-6" />
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-8">
                Built From the <span className="text-[#C87941]">Inside Out.</span>
              </h2>

              <p className="text-[16px] text-[#9CA3AF] leading-[1.82] mb-4">
                Jeff Lawrence is the founder of 90 Day Turnaround, a business advisory and coaching
                firm built to help owner-led companies regain clarity, traction, and momentum.
              </p>
              <p className="text-[16px] text-[#9CA3AF] leading-[1.82] mb-4">
                With more than 30 years of experience operating at the owner, founder, and executive
                leadership level, Jeff brings real-world business experience to every engagement. He
                has built, scaled, and exited his own franchise-based business, growing it to more
                than $20 million in annual revenue, and has helped drive rapid expansion through both
                acquisitions and organic growth, including scaling revenue from $7 million to $47
                million in just two years.
              </p>
              <p className="text-[16px] text-[#9CA3AF] leading-[1.82] mb-4">
                Jeff&apos;s approach is practical, direct, and execution-focused. As a cancer
                survivor who transformed his personal health from over 300 pounds to running
                marathons, extreme skiing, and completing multi-day adventure hikes, he understands
                what it takes to rebuild, refocus, and push through difficult seasons. He brings that
                same discipline, resilience, and action-oriented mindset to business turnarounds.
              </p>
              <p className="text-[16px] text-[#9CA3AF] leading-[1.82] mb-4">
                Through 90 Day Turnaround, Jeff leads a network of fractional operators, CFOs, HR
                leaders, growth specialists, and strategic advisors, bringing the right expertise to
                each client based on their specific challenges, goals, and stage of growth. His
                mission is simple: help business owners create measurable progress in 90 days by
                aligning strategy, leadership, operations, and execution.
              </p>

              <div className="flex flex-wrap gap-2.5 mt-8">
                {[
                  ["30+", "Years Experience"],
                  ["$7M→$47M", "Growth Driven"],
                  ["$20M+", "Business Exited"],
                  ["Cancer Survivor", ""],
                  ["Marathon Runner", ""],
                  ["Extreme Skier", ""],
                  ["Adventure Hiker", ""],
                ].map(([val, label]) => (
                  <span key={val} className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-4 py-2 rounded-full text-[13px] text-[#9CA3AF] font-medium">
                    {label ? (<><span className="text-[#C87941] font-bold">{val}</span> {label}</>) : val}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-[#111827]">
        <div className="max-w-6xl mx-auto">

          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">Client Results</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              What Our Clients Say
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-md mx-auto leading-relaxed">
              Real results from founder-led businesses that went through the 90-day process.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* ── Featured testimonial — Roger Foster ── */}
          <FadeUp delay={0.1}>
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-[#C87941]/25 p-8 md:p-10 shadow-[0_0_80px_rgba(200,121,65,0.07)] h-full">

              {/* Large decorative quote mark */}
              <div className="absolute top-8 right-10 text-[120px] font-black text-[#C87941]/[0.07] leading-none select-none pointer-events-none">&ldquo;</div>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="#C87941" className="flex-shrink-0">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[17px] md:text-xl text-white/90 leading-[1.8] font-light mb-10 relative z-10">
                &ldquo;One of the biggest benefits was simply having experienced outside eyes looking into our business.
                When you have been inside your own company for a long time, it is very easy to get tunnel vision.
                Jeff helped me step back and look at our business more clearly — our strengths, our weaknesses,
                and where we could operate better and communicate our value more effectively.
                His coaching was practical, direct, and useful. It gave me tools and ideas I could actually use.
                I would recommend Jeff Lawrence and the 90 Day Turnaround program to any business owner who wants
                a clearer outside perspective, better focus, and practical help improving their business.&rdquo;
              </blockquote>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-10">
                {["Time management", "Social media strategy", "AI tools implementation", "Competing with larger franchises"].map(tag => (
                  <span key={tag} className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C87941] bg-[#C87941]/10 border border-[#C87941]/20 px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-5 border-t border-white/[0.07] pt-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C87941]/40 flex-shrink-0 bg-white/[0.05]">
                  <img
                    src="/roger-foster.jpg"
                    alt="Roger Foster"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-[17px] leading-tight">Roger Foster</p>
                  <p className="text-[#C87941] text-[13px] font-semibold mt-0.5">Owner, Tires On The Run</p>
                  <p className="text-[#9CA3AF] text-[12px] mt-0.5">Airdrie, Alberta</p>
                </div>
                <div className="ml-auto hidden sm:block text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#9CA3AF]/50">Advisory Coaching</p>
                  <p className="text-[11px] text-[#9CA3AF]/40 mt-0.5">Client Testimonial</p>
                </div>
              </div>

            </div>
          </FadeUp>

          {/* ── Featured testimonial — Geoff Tomlinson ── */}
          <FadeUp delay={0.18}>
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-[#C87941]/25 p-8 md:p-10 shadow-[0_0_80px_rgba(200,121,65,0.07)] h-full">

              {/* Large decorative quote mark */}
              <div className="absolute top-8 right-10 text-[120px] font-black text-[#C87941]/[0.07] leading-none select-none pointer-events-none">&ldquo;</div>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="#C87941" className="flex-shrink-0">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[16px] md:text-lg text-white/90 leading-[1.85] font-light mb-10 relative z-10 space-y-5">
                <p>
                  &ldquo;I first started working with Jeff Lawrence through an international nonprofit organization called Mentor Discover Inspire, where we volunteered together. It became clear to me early in our relationship that Jeff was a winner. Over the years, we both rose within the organization until I became President and Jeff became Chairman of the Board.
                </p>
                <p>
                  I have had a long and successful career in financial marketing, advertising, and financial planning, and I have rarely experienced a professional with Jeff&rsquo;s unique combination of intelligence, real-world experience, and personality. It is a combination of skills I have personally benefited from many times over the years, both through our nonprofit work and professionally.
                </p>
                <p>
                  Jeff and I also led many high-level leadership training courses together. In those environments, Jeff consistently demonstrated the ability to communicate difficult concepts in a way people could understand, apply, and put into action.
                </p>
                <p>
                  Simply put, Jeff Lawrence is one of the best. If you want to work with someone who brings experience, clarity, leadership, and real accountability, Jeff Lawrence should be at the top of your list.&rdquo;
                </p>
              </blockquote>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-10">
                {["Leadership", "Accountability", "Financial planning", "Training facilitation"].map(tag => (
                  <span key={tag} className="text-[11px] font-semibold uppercase tracking-[1px] text-[#C87941] bg-[#C87941]/10 border border-[#C87941]/20 px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-5 border-t border-white/[0.07] pt-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C87941]/40 flex-shrink-0 bg-white/[0.05]">
                  <img
                    src="/geoff-tomlinson.jpg"
                    alt="Geoff Tomlinson"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-[17px] leading-tight">Geoff Tomlinson</p>
                  <p className="text-[#C87941] text-[13px] font-semibold mt-0.5">Former President, Mentor Discover Inspire</p>
                  <p className="text-[#9CA3AF] text-[12px] mt-0.5">Senior Financial Consultant</p>
                </div>
                <div className="ml-auto hidden sm:block text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#9CA3AF]/50">Leadership Endorsement</p>
                  <p className="text-[11px] text-[#9CA3AF]/40 mt-0.5">Client Testimonial</p>
                </div>
              </div>

            </div>
          </FadeUp>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BOOKING — STEP 1: FORM  /  STEP 2: CALENDLY
      ════════════════════════════════════════════════════════════════ */}
      <section id="qualify" className="py-28 px-6 bg-[#0D0D0D]">
        <div className="max-w-[780px] mx-auto">

          {/* ── Step indicator ───────────────────────────────────────── */}
          <FadeUp className="flex items-center justify-center gap-3 mb-12">
            {(["Tell us about you", "Pick your time"] as const).map((label, i) => {
              const active = (i === 0 && step === "form") || (i === 1 && step === "calendar");
              const done   = i === 0 && step === "calendar";
              return (
                <div key={label} className="flex items-center gap-3">
                  {i > 0 && <div className="w-10 h-px bg-white/10" />}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors duration-300 ${active ? "bg-[#C87941] text-white" : done ? "bg-[#C87941]/30 text-[#C87941]" : "bg-white/[0.07] text-[#4A5568]"}`}>
                      {done
                        ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : i + 1}
                    </div>
                    <span className={`text-[13px] font-semibold hidden sm:block transition-colors duration-300 ${active ? "text-white" : "text-[#4A5568]"}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </FadeUp>

          {step === "form" ? (
            <>
              <FadeUp className="text-center mb-14">
                <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
                  Apply for a Discovery Call
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                  Let&apos;s Start the Conversation
                </h2>
                <p className="text-[#9CA3AF] text-lg max-w-lg mx-auto leading-relaxed">
                  Jeff works with a limited number of businesses at a time. Tell us about yourself
                  first — then you&apos;ll pick a time that works for you.
                </p>
              </FadeUp>

              <FadeUp delay={0.1}>
                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(
                    [
                      { id: "fname",   label: "First Name",       type: "text",  placeholder: "Jeff",                    col: 1 },
                      { id: "lname",   label: "Last Name",        type: "text",  placeholder: "Lawrence",                col: 1 },
                      { id: "email",   label: "Business Email",   type: "email", placeholder: "you@yourcompany.com",     col: 1 },
                      { id: "company", label: "Company Name",     type: "text",  placeholder: "Acme Corp.",              col: 1 },
                      { id: "website", label: "Company Website",  type: "url",   placeholder: "https://yourcompany.com", col: 2 },
                    ] as const
                  ).map((f) => (
                    <div key={f.id} className={f.col === 2 ? "sm:col-span-2" : ""}>
                      <label htmlFor={f.id} className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2">
                        {f.label} <span className="text-[#C87941]">*</span>
                      </label>
                      <input
                        id={f.id} name={f.id} type={f.type} placeholder={f.placeholder}
                        value={form[f.id]} onChange={handleChange}
                        className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] text-white placeholder:text-[#4A5568] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] ${errors[f.id] ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.13)]" : "border-white/10"}`}
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label htmlFor="challenge" className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2">
                      What is your biggest challenge right now? <span className="text-[#C87941]">*</span>
                    </label>
                    <textarea
                      id="challenge" name="challenge" rows={4}
                      placeholder="Be specific — what's the thing keeping you up at night?"
                      value={form.challenge} onChange={handleChange}
                      className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] text-white placeholder:text-[#4A5568] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] resize-y ${errors.challenge ? "border-red-500" : "border-white/10"}`}
                    />
                  </div>

                  {(
                    [
                      {
                        id: "service",
                        label: "Which service are you most interested in?",
                        options: [
                          { v: "90-day-turnaround-sprint",     l: "90-Day Turnaround Sprint" },
                          { v: "growth-accelerator-advisory",  l: "Growth Accelerator Advisory" },
                          { v: "ai-leverage-implementation",   l: "AI Leverage Implementation" },
                          { v: "expansion-readiness-blueprint",l: "Expansion Readiness Blueprint" },
                          { v: "not-sure",                     l: "Not sure yet" },
                        ],
                      },
                      {
                        id: "timeline",
                        label: "What is your timeline?",
                        options: [
                          { v: "immediately", l: "Immediately" },
                          { v: "30-days",     l: "Within 30 days" },
                          { v: "90-days",     l: "Within 90 days" },
                          { v: "exploring",   l: "Just exploring" },
                        ],
                      },
                    ] as const
                  ).map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2">
                        {f.label} <span className="text-[#C87941]">*</span>
                      </label>
                      <select
                        id={f.id} name={f.id} value={form[f.id]} onChange={handleChange}
                        className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] appearance-none cursor-pointer ${errors[f.id] ? "border-red-500" : "border-white/10"} ${form[f.id] === "" ? "text-[#4A5568]" : "text-white"}`}
                      >
                        <option value="" disabled>Select…</option>
                        {f.options.map((o) => (
                          <option key={o.v} value={o.v} className="bg-[#1a1f2e] text-white">{o.l}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label htmlFor="referral" className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2">
                      How did you hear about us? <span className="text-[#C87941]">*</span>
                    </label>
                    <select
                      id="referral" name="referral" value={form.referral} onChange={handleChange}
                      className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] appearance-none cursor-pointer ${errors.referral ? "border-red-500" : "border-white/10"} ${form.referral === "" ? "text-[#4A5568]" : "text-white"}`}
                    >
                      <option value="" disabled>Select…</option>
                      {["LinkedIn", "Referral", "Google", "Other"].map((o) => (
                        <option key={o} value={o.toLowerCase()} className="bg-[#1a1f2e] text-white">{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 mt-2 flex flex-col items-center gap-4">
                    <button
                      type="submit"
                      className="w-full bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-[16px] py-5 rounded-[6px] transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      Continue — Pick Your Time
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <p className="text-[13px] text-[#4A5568] text-center">
                      No commitment. 30-minute conversation. You&apos;ll pick a time on the next step.
                    </p>
                  </div>
                </form>
              </FadeUp>
            </>
          ) : (
            <>
              <div className="text-center mb-10" style={{ animation: "fadeScaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
                <div className="inline-flex items-center gap-2 bg-[#C87941]/[0.1] border border-[#C87941]/25 rounded-full px-5 py-2 mb-6">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#C87941" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[13px] font-semibold text-[#C87941]">Your info has been saved</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  Now Pick a Time
                </h2>
                <p className="text-[#9CA3AF] text-base max-w-md mx-auto">
                  Choose a date and time that works for you. Your answers have been pre-filled below.
                </p>
              </div>

              <div
                id="calendly-container"
                className="rounded-xl overflow-hidden border border-white/[0.07]"
                style={{ minWidth: "320px", height: "700px" }}
              />
            </>
          )}

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0D0D0D] border-t border-white/[0.055] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <a href="#" className="flex items-center">
            <img src="/logo.svg" alt="90 Day Turnaround" style={{ height: "72px", width: "auto" }} />
          </a>
          <nav className="flex flex-wrap items-center gap-6">
            <a href="mailto:jeff@90dayturnaround.ca" className="text-[14px] text-[#9CA3AF] hover:text-[#C87941] transition-colors">
              jeff@90dayturnaround.ca
            </a>
            <a href="https://linkedin.com/in/jtsales" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#9CA3AF] hover:text-[#C87941] transition-colors">
              LinkedIn
            </a>
            <button onClick={() => scrollTo("qualify")} className="bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-[14px] px-5 py-2.5 rounded-[6px] transition-colors duration-200">
              Book a Discovery Call
            </button>
          </nav>
          <p className="text-[13px] text-[#4A5568]">© 2026 90 Day Turnaround. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
