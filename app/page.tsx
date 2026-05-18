"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AnimatedShaderHero from "@/components/ui/animated-shader-hero";
import { NeonButton } from "@/components/ui/neon-button";

// ─── Fade-up wrapper ──────────────────────────────────────────────────────────
const FadeUp = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── SVG icons ────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 22 }: { path: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C87941"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const CheckIcon = () => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C87941"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="flex-shrink-0 mt-0.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Problem items ─────────────────────────────────────────────────────────────
const problems = [
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "You're the bottleneck.",
    body: "Every decision, every problem, every fire circles back to you. Nothing moves without your sign-off — and that's suffocating the business.",
  },
  {
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Revenue is unpredictable.",
    body: "Great months. Terrible months. No clear reason why either way. You can't forecast, can't plan, can't breathe. It's a slow grind.",
  },
  {
    icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    title: "No operating systems.",
    body: "Things get done by memory, heroics, and habit — not by documented, repeatable processes your team can actually own and execute without you.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 1 0-8 4 4 0 0 1 0 8z",
    title: "Your team isn't accountable.",
    body: "Deadlines slip, ownership is fuzzy, and you keep doing work your team should be handling — because it's faster than fighting for accountability.",
  },
  {
    icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    title: "Growth has stalled.",
    body: "You hit a ceiling you can't break past — and it's been months. Maybe years. You know something fundamental needs to change, but what?",
  },
  {
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
    title: "You're busy, not strategic.",
    body: "You work in the business constantly — rarely on it. The vision is buried under daily fires, and you can't see a clear path out of the chaos.",
  },
];

// ─── Offer cards ──────────────────────────────────────────────────────────────
const offers = [
  {
    name: "Growth Accelerator",
    tag: "Ongoing Coaching",
    desc: "Weekly coaching and ongoing strategic support. Once-a-week cadence — ideal for founders who have solid execution but need a seasoned operator's perspective on the big moves.",
    features: [
      "Weekly 1:1 strategic sessions",
      "Operator-level sounding board",
      "Priority & decision support",
      "Accountability check-ins",
      "Email support between sessions",
    ],
    note: "Monthly retainer. Min. 3-month commitment. Bundleable with AI Audit.",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    featured: false,
  },
  {
    name: "90-Day Turnaround",
    tag: "Flagship Engagement",
    desc: "Jeff rolls up his sleeves and works inside your business. Full hands-on engagement — not coaching from the sidelines. Discovery through momentum.",
    features: [
      "Discovery & deep bottleneck audit",
      "Custom 90-day execution roadmap",
      "Scorecard & accountability framework",
      "Hands-on execution support",
      "Leadership & team coaching",
      "AI leverage where it drives results",
    ],
    note: "Priced by goalpost, not by hour. 50% upfront, 50% in month 2.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    featured: true,
  },
  {
    name: "AI Integration Audit",
    tag: "Standalone Service",
    desc: "A focused audit that identifies exactly where AI can save time, reduce cost, and create leverage inside your specific business. Available standalone or bundled.",
    features: [
      "Full operational AI opportunity scan",
      "Prioritized integration roadmap",
      "Cost & time savings estimates",
      "Implementation guidance",
      "Vendor recommendations",
    ],
    note: "Flat-fee project engagement. Bundleable with Turnaround or Accelerator.",
    icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18",
    featured: false,
  },
];

// ─── Form initial state ───────────────────────────────────────────────────────
const emptyForm = {
  fname: "",
  lname: "",
  email: "",
  company: "",
  website: "",
  revenue: "",
  employees: "",
  challenge: "",
  service: "",
  timeline: "",
  referral: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    Object.entries(form).forEach(([k, v]) => {
      if (!v.trim()) newErrors[k] = true;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      const first = Object.keys(newErrors)[0];
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitted(true);
  };

  return (
    <main className="bg-[#0D0D0D] text-white overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
          scrolled
            ? "bg-[#0D0D0D]/98 shadow-[0_1px_0_rgba(200,121,65,0.15)]"
            : "bg-[#0D0D0D]/80 backdrop-blur-md"
        }`}
      >
        <a
          href="#"
          className="text-[17px] font-black tracking-tight"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          90 Day <span className="text-[#C87941]">Turnaround</span>
        </a>
        <button
          onClick={() => scrollTo("qualify")}
          className="bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-sm px-5 py-2.5 rounded-[6px] transition-colors duration-200"
        >
          Book a Call
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          HERO — AnimatedShaderHero (21st.dev component)
      ════════════════════════════════════════════════════════════════ */}
      <AnimatedShaderHero
        trustBadge={{
          text: "Western Canada's Business Turnaround Specialist",
          icons: ["✦"],
        }}
        headline={{
          line1: "Your Business",
          line2: "Has Hit a Ceiling.",
          line3: "Let's Break Through It.",
        }}
        subtitle="You've built something real — but growth has stalled, chaos is creeping in, and you're doing too much yourself. 90 days is all it takes to change that."
        buttons={{
          primary: {
            text: "See If You Qualify",
            onClick: () => scrollTo("qualify"),
          },
          secondary: {
            text: "View Services →",
            onClick: () => scrollTo("offers"),
          },
        }}
        note="No fluff. No generic advice. Serious founders only."
        identity={{
          name: "Jeff Lawrence",
          title: "90-Day Business Turnaround Specialist · 90DayTurnaround.ca",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#111827] border-y border-[#C87941]/15">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { num: "30+", label: "Years operating at VP level and above" },
            { num: "$7M→$47M", label: "Revenue growth driven inside client businesses" },
            { num: "90", label: "Days to measurable, locked-in momentum" },
            { num: "$20M", label: "Business personally operated & rebuilt" },
          ].map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.08}>
              <div
                className={`flex flex-col items-center text-center px-6 py-10 ${
                  i < 3 ? "border-r border-white/[0.05]" : ""
                } ${i < 2 ? "border-b border-white/[0.05] md:border-b-0" : ""}`}
              >
                <span className="text-4xl font-black text-[#C87941] tracking-tight leading-none mb-2.5">
                  {s.num}
                </span>
                <p className="text-[13px] text-[#9CA3AF] font-medium leading-snug max-w-[140px]">
                  {s.label}
                </p>
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
            {/* Left: headline + list */}
            <div>
              <FadeUp delay={0.05}>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                  You&apos;ve Got Revenue.
                  <br />
                  <span className="text-[#C87941]">You&apos;re Still Stuck.</span>
                </h2>
                <p className="text-[#9CA3AF] text-lg mb-10 leading-relaxed">
                  If any of these feel uncomfortably close to home — keep reading.
                </p>
              </FadeUp>

              <ul className="space-y-3">
                {problems.map((p, i) => (
                  <FadeUp key={p.title} delay={0.06 * i}>
                    <li className="group flex gap-4 p-5 rounded-lg bg-white/[0.018] border border-white/[0.055] hover:border-[#C87941]/25 hover:bg-[#C87941]/[0.025] transition-all duration-200">
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon path={p.icon} />
                      </div>
                      <p className="text-[15px] text-[#9CA3AF] leading-relaxed">
                        <strong className="text-white font-semibold">{p.title}</strong>{" "}
                        {p.body}
                      </p>
                    </li>
                  </FadeUp>
                ))}
              </ul>
            </div>

            {/* Right: callout box */}
            <FadeUp delay={0.2}>
              <div className="sticky top-28 p-10 rounded-xl bg-gradient-to-br from-[#C87941]/10 to-[#C87941]/[0.03] border border-[#C87941]/30">
                <h3 className="text-2xl font-bold leading-snug mb-5">
                  If this sounds like you — keep reading.
                </h3>
                <p className="text-[#9CA3AF] text-[15px] leading-relaxed mb-4">
                  These aren&apos;t permanent problems. They&apos;re solvable — with the right
                  operator in your corner, the right systems, and 90 focused days to execute.
                </p>
                <p className="text-[#9CA3AF] text-[15px] leading-relaxed mb-8">
                  Jeff has been inside businesses just like yours. He doesn&apos;t coach from
                  the sidelines. He rolls up his sleeves, finds the breaks, and helps you fix
                  them — fast.
                </p>
                <button
                  onClick={() => scrollTo("qualify")}
                  className="w-full bg-[#C87941] hover:bg-[#b06830] text-white font-bold py-4 rounded-[6px] transition-colors duration-200 text-center"
                >
                  See If You Qualify →
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ANIMATED PATHS CTA — inspired by uniquesonu/modern-background-paths
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 bg-[#111827] overflow-hidden">
        {/* Animated SVG path background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[
            {
              dur: "9s",
              w: "1.2",
              op: "0.7",
              v: [
                "M-80,300 C180,100 380,520 600,240 C820,-20 1020,440 1200,200 C1380,-20 1440,340 1600,180",
                "M-80,160 C180,440 380,60 600,400 C820,600 1020,100 1200,440 C1380,600 1440,140 1600,380",
                "M-80,300 C180,100 380,520 600,240 C820,-20 1020,440 1200,200 C1380,-20 1440,340 1600,180",
              ],
            },
            {
              dur: "12s",
              w: "0.8",
              op: "0.5",
              v: [
                "M-80,460 C240,230 480,560 700,280 C900,10 1100,480 1320,220 C1480,40 1560,380 1700,220",
                "M-80,100 C240,400 480,50 700,420 C900,680 1100,100 1320,440 C1480,640 1560,100 1700,440",
                "M-80,460 C240,230 480,560 700,280 C900,10 1100,480 1320,220 C1480,40 1560,380 1700,220",
              ],
            },
            {
              dur: "15s",
              w: "1.8",
              op: "0.25",
              v: [
                "M-80,120 C200,340 460,60 660,360 C860,600 1100,80 1340,360 C1520,540 1600,180 1720,360",
                "M-80,520 C200,60 460,560 660,80 C860,0 1100,580 1340,80 C1520,0 1600,520 1720,80",
                "M-80,120 C200,340 460,60 660,360 C860,600 1100,80 1340,360 C1520,540 1600,180 1720,360",
              ],
            },
            {
              dur: "7s",
              w: "0.5",
              op: "0.6",
              v: [
                "M0,380 Q360,40 720,380 T1440,380",
                "M0,180 Q360,580 720,180 T1440,180",
                "M0,380 Q360,40 720,380 T1440,380",
              ],
            },
            {
              dur: "11s",
              w: "0.9",
              op: "0.3",
              v: [
                "M-100,560 C340,280 620,680 920,320 C1140,80 1360,480 1640,280",
                "M-100,80 C340,420 620,0 920,420 C1140,620 1360,80 1640,440",
                "M-100,560 C340,280 620,680 920,320 C1140,80 1360,480 1640,280",
              ],
            },
          ].map((p, i) => (
            <path
              key={i}
              fill="none"
              stroke="#C87941"
              strokeWidth={p.w}
              strokeLinecap="round"
              opacity={p.op}
            >
              <animate
                attributeName="d"
                dur={p.dur}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                values={p.v.join(";")}
              />
            </path>
          ))}
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-5">
              The Decision Point
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6">
              You Can Keep Running on Empty —
              <br />
              <span className="text-[#C87941]">Or Change Everything in 90 Days.</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Businesses that break through aren&apos;t the ones with the most capital. They&apos;re
              the ones whose founders were willing to stop, fix what&apos;s broken, and execute
              with intention. That&apos;s what we build together.
            </p>
            {/* NeonButton from cybergaz/neon-button */}
            <NeonButton
              size="lg"
              className="text-[16px] border-[#C87941]/60 text-[#C87941] hover:border-[#C87941] px-14 py-4 rounded-[6px]"
              onClick={() => scrollTo("qualify")}
            >
              Apply for a Discovery Call
            </NeonButton>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          OFFERS / SERVICES
      ════════════════════════════════════════════════════════════════ */}
      <section id="offers" className="py-28 px-6 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
              Three Ways to Work With Jeff
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Choose Your Engagement Level
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto leading-relaxed">
              From full hands-on execution to a focused standalone audit — there&apos;s a model
              built for where you are right now.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {offers.map((offer, i) => (
              <FadeUp key={offer.name} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-1 ${
                    offer.featured
                      ? "bg-gradient-to-b from-[#C87941]/10 to-[#C87941]/[0.02] border-2 border-[#C87941]/60 shadow-[0_0_60px_rgba(200,121,65,0.12)]"
                      : "bg-white/[0.025] border border-white/[0.08] hover:border-[#C87941]/25"
                  }`}
                >
                  {offer.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C87941] text-white text-[10px] font-black uppercase tracking-[1.2px] px-5 py-1.5 rounded-full whitespace-nowrap">
                      Flagship · Most Requested
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-lg bg-[#C87941]/10 flex items-center justify-center mb-5">
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C87941"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={offer.icon} />
                    </svg>
                  </div>

                  <p className="text-lg font-bold mb-1">{offer.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#C87941] mb-4">
                    {offer.tag}
                  </p>
                  <p className="text-[14px] text-[#9CA3AF] leading-relaxed mb-6">{offer.desc}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {offer.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#9CA3AF]">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-white/[0.06] pt-5 mb-6">
                    <p className="text-[12px] text-[#4A5568] leading-relaxed">{offer.note}</p>
                  </div>

                  <button
                    onClick={() => scrollTo("qualify")}
                    className={`w-full py-3.5 rounded-[6px] font-bold text-sm transition-colors duration-200 ${
                      offer.featured
                        ? "bg-[#C87941] hover:bg-[#b06830] text-white"
                        : "border border-[#C87941]/40 text-[#C87941] hover:bg-[#C87941]/10"
                    }`}
                  >
                    Apply Now →
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-[#111827]">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Simple. Focused.{" "}
              <span className="text-[#C87941]">Executed Together.</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-md mx-auto">
              No complex onboarding. No wasted weeks. We move fast from day one.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-0 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[44px] left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] h-px bg-gradient-to-r from-[#C87941] via-[#C87941]/30 to-[#C87941]" />

            {[
              {
                n: "01",
                title: "Discovery Call",
                body: "We talk. Jeff gets clear on where you are, where you want to go, and whether there's a real fit. If there is, we move to a full audit. If not, he'll tell you honestly.",
              },
              {
                n: "02",
                title: "90-Day Roadmap",
                body: "Jeff audits your business — operations, sales, team, and systems — then builds a custom execution roadmap with clear priorities, owners, and measurable goalposts.",
              },
              {
                n: "03",
                title: "Execute Together",
                body: "We execute. Jeff stays in it with you — weekly sessions, real-time accountability, and course corrections until the momentum is locked in and self-sustaining.",
              },
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
            {/* Photo placeholder */}
            <FadeUp>
              <div className="relative">
                {/* To add Jeff's photo: replace the inner content of this div with:
                    <img src="/jeff-photo.jpg" alt="Jeff Lawrence" className="w-full h-full object-cover rounded-xl" />
                */}
                <div className="w-full aspect-[3/4] bg-[#111827] border border-white/[0.07] rounded-xl flex flex-col items-center justify-center gap-4 text-[#4A5568]">
                  <svg
                    width={52}
                    height={52}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-sm">Jeff&apos;s photo goes here</span>
                </div>
                {/* Credential badge */}
                <div className="absolute -bottom-5 -right-5 bg-[#0D0D0D]/95 border border-[#C87941]/30 rounded-xl px-5 py-4 text-center backdrop-blur-sm">
                  <strong className="block text-3xl font-black text-[#C87941] tracking-tight">
                    30+
                  </strong>
                  <span className="text-[12px] text-[#9CA3AF] leading-snug block mt-1">
                    Years at VP
                    <br />
                    Level &amp; Above
                  </span>
                </div>
              </div>
            </FadeUp>

            {/* Bio */}
            <FadeUp delay={0.1}>
              <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
                About Jeff Lawrence
              </span>
              <div className="w-12 h-[3px] bg-[#C87941] rounded-full mb-6" />
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-8">
                He&apos;s Sat in{" "}
                <span className="text-[#C87941]">Your Chair Before.</span>
              </h2>

              {[
                "Jeff Lawrence isn't a consultant who's read the books. He's an operator who's lived them — 30+ years of VP-level and executive experience across industries, building and rebuilding businesses from the inside out.",
                "He's run a $20M business. He's helped companies grow from $7M to $47M. He knows what it feels like when you're the one carrying it all — because he's been there, and he knows exactly what has to change.",
                "In 2020, Jeff survived cancer. He ran a marathon. He came out the other side with a sharper sense of what matters and zero patience for businesses running at half their potential.",
                "Today, Jeff works directly with founder-led businesses in Western Canada who've hit a ceiling — not as a coach who listens and nods, but as an operator who digs in and executes alongside you.",
              ].map((para, i) => (
                <p key={i} className="text-[16px] text-[#9CA3AF] leading-[1.82] mb-4">
                  {para}
                </p>
              ))}

              <div className="flex flex-wrap gap-2.5 mt-8">
                {[
                  ["30+", "Years Experience"],
                  ["$7M→$47M", "Growth Driven"],
                  ["$20M", "Business Run"],
                  ["VP Level & Above", ""],
                  ["Cancer Survivor", ""],
                  ["Marathon Runner", ""],
                ].map(([val, label]) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-4 py-2 rounded-full text-[13px] text-[#9CA3AF] font-medium"
                  >
                    {label ? (
                      <>
                        <span className="text-[#C87941] font-bold">{val}</span> {label}
                      </>
                    ) : (
                      val
                    )}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          INTAKE FORM
      ════════════════════════════════════════════════════════════════ */}
      <section id="qualify" className="py-28 px-6 bg-[#111827]">
        <div className="max-w-[780px] mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#C87941] block mb-4">
              Apply for a Discovery Call
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              See If You Qualify
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-lg mx-auto leading-relaxed">
              Jeff works with a limited number of businesses at a time. Complete the form below
              so we can determine if there&apos;s a fit before scheduling your call.
            </p>
          </FadeUp>

          {!submitted ? (
            <FadeUp delay={0.1}>
              <form
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {/* First / Last name */}
                {(
                  [
                    { id: "fname", label: "First Name", type: "text", placeholder: "Jeff", col: 1 },
                    { id: "lname", label: "Last Name", type: "text", placeholder: "Lawrence", col: 1 },
                    { id: "email", label: "Business Email", type: "email", placeholder: "you@yourcompany.com", col: 1 },
                    { id: "company", label: "Company Name", type: "text", placeholder: "Acme Corp.", col: 1 },
                    { id: "website", label: "Company Website", type: "url", placeholder: "https://yourcompany.com", col: 2 },
                  ] as const
                ).map((f) => (
                  <div key={f.id} className={f.col === 2 ? "sm:col-span-2" : ""}>
                    <label
                      htmlFor={f.id}
                      className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2"
                    >
                      {f.label} <span className="text-[#C87941]">*</span>
                    </label>
                    <input
                      id={f.id}
                      name={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.id]}
                      onChange={handleChange}
                      className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] text-white placeholder:text-[#4A5568] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] ${
                        errors[f.id]
                          ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.13)]"
                          : "border-white/10"
                      }`}
                    />
                  </div>
                ))}

                {/* Dropdowns */}
                {(
                  [
                    {
                      id: "revenue",
                      label: "Annual Revenue Range",
                      options: [
                        { v: "under-2m", l: "Under $2M" },
                        { v: "2m-5m", l: "$2M – $5M" },
                        { v: "5m-10m", l: "$5M – $10M" },
                        { v: "10m-25m", l: "$10M – $25M" },
                        { v: "over-25m", l: "Over $25M" },
                      ],
                    },
                    {
                      id: "employees",
                      label: "Number of Employees",
                      options: [
                        { v: "under-10", l: "Under 10" },
                        { v: "10-50", l: "10 – 50" },
                        { v: "50-150", l: "50 – 150" },
                        { v: "over-150", l: "Over 150" },
                      ],
                    },
                  ] as const
                ).map((f) => (
                  <div key={f.id}>
                    <label
                      htmlFor={f.id}
                      className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2"
                    >
                      {f.label} <span className="text-[#C87941]">*</span>
                    </label>
                    <select
                      id={f.id}
                      name={f.id}
                      value={form[f.id]}
                      onChange={handleChange}
                      className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] appearance-none cursor-pointer color-scheme-dark ${
                        errors[f.id]
                          ? "border-red-500"
                          : "border-white/10"
                      } ${form[f.id] === "" ? "text-[#4A5568]" : "text-white"}`}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {f.options.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Challenge textarea */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="challenge"
                    className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2"
                  >
                    What is your biggest challenge right now?{" "}
                    <span className="text-[#C87941]">*</span>
                  </label>
                  <textarea
                    id="challenge"
                    name="challenge"
                    rows={4}
                    placeholder="Be specific — what's the thing keeping you up at night?"
                    value={form.challenge}
                    onChange={handleChange}
                    className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] text-white placeholder:text-[#4A5568] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] resize-y ${
                      errors.challenge ? "border-red-500" : "border-white/10"
                    }`}
                  />
                </div>

                {/* Service / Timeline dropdowns */}
                {(
                  [
                    {
                      id: "service",
                      label: "Which service are you most interested in?",
                      options: [
                        { v: "90-day-turnaround", l: "90-Day Turnaround" },
                        { v: "growth-accelerator", l: "Growth Accelerator" },
                        { v: "ai-audit", l: "AI Integration Audit" },
                        { v: "not-sure", l: "Not sure yet" },
                      ],
                    },
                    {
                      id: "timeline",
                      label: "What is your timeline?",
                      options: [
                        { v: "immediately", l: "Immediately" },
                        { v: "30-days", l: "Within 30 days" },
                        { v: "90-days", l: "Within 90 days" },
                        { v: "exploring", l: "Just exploring" },
                      ],
                    },
                  ] as const
                ).map((f) => (
                  <div key={f.id}>
                    <label
                      htmlFor={f.id}
                      className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2"
                    >
                      {f.label} <span className="text-[#C87941]">*</span>
                    </label>
                    <select
                      id={f.id}
                      name={f.id}
                      value={form[f.id]}
                      onChange={handleChange}
                      className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] appearance-none cursor-pointer ${
                        errors[f.id] ? "border-red-500" : "border-white/10"
                      } ${form[f.id] === "" ? "text-[#4A5568]" : "text-white"}`}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {f.options.map((o) => (
                        <option key={o.v} value={o.v} className="bg-[#1a1f2e] text-white">
                          {o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Referral — full width */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="referral"
                    className="block text-[12px] font-bold uppercase tracking-[0.4px] text-white mb-2"
                  >
                    How did you hear about Jeff?{" "}
                    <span className="text-[#C87941]">*</span>
                  </label>
                  <select
                    id="referral"
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
                    className={`w-full bg-white/[0.04] border rounded-[6px] px-4 py-3.5 text-[15px] outline-none transition-all duration-200 focus:border-[#C87941] focus:shadow-[0_0_0_3px_rgba(200,121,65,0.14)] appearance-none cursor-pointer ${
                      errors.referral ? "border-red-500" : "border-white/10"
                    } ${form.referral === "" ? "text-[#4A5568]" : "text-white"}`}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {["LinkedIn", "Referral", "Google", "Other"].map((o) => (
                      <option key={o} value={o.toLowerCase()} className="bg-[#1a1f2e] text-white">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <div className="sm:col-span-2 mt-2 flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    className="w-full bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-[16px] py-5 rounded-[6px] transition-colors duration-200"
                  >
                    Apply for a Discovery Call
                  </button>
                  <p className="text-[13px] text-[#4A5568] text-center">
                    By submitting, Jeff&apos;s team will review your application personally and
                    reach out within 1–2 business days if there&apos;s a fit.
                  </p>
                </div>
              </form>
            </FadeUp>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-16 px-8 bg-[#C87941]/[0.06] border border-[#C87941]/25 rounded-xl"
            >
              <div className="w-20 h-20 bg-[#C87941]/10 rounded-full flex items-center justify-center mx-auto mb-7">
                <svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C87941"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4">Application Received.</h3>
              <p className="text-[#9CA3AF] text-[16px] max-w-md mx-auto leading-relaxed mb-10">
                Thanks for applying. Jeff&apos;s team reviews every submission personally. If
                there&apos;s a fit, you&apos;ll hear back within 1–2 business days to schedule
                your discovery call.
              </p>
              <a
                href="https://calendly.com/jt-sales"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#C87941] hover:bg-[#b06830] text-white font-bold text-[16px] px-12 py-5 rounded-[6px] transition-colors duration-200"
              >
                Book Your Discovery Call →
              </a>
            </motion.div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0D0D0D] border-t border-white/[0.055] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <a href="#" className="text-[16px] font-black">
            90 Day <span className="text-[#C87941]">Turnaround</span>
          </a>
          <nav className="flex flex-wrap items-center gap-6">
            <a
              href="mailto:jeff@90dayturnaround.ca"
              className="text-[14px] text-[#9CA3AF] hover:text-[#C87941] transition-colors"
            >
              jeff@90dayturnaround.ca
            </a>
            <a
              href="https://linkedin.com/in/jtsales"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#9CA3AF] hover:text-[#C87941] transition-colors"
            >
              LinkedIn
            </a>
            <button
              onClick={() => scrollTo("qualify")}
              className="text-[14px] text-[#9CA3AF] hover:text-[#C87941] transition-colors"
            >
              Apply Now
            </button>
          </nav>
          <p className="text-[13px] text-[#4A5568]">
            © 2025 90 Day Turnaround. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
