"use client";

import { motion, useSpring } from "framer-motion";
import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Check, Star as LucideStar } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Utils ────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);
  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }
    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);
    return () => result.removeEventListener("change", onChange);
  }, [query]);
  return value;
}

// ─── Button (local, self-contained) ──────────────────────────────────────────

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// ─── Starfield ────────────────────────────────────────────────────────────────

function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [initialPos] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  });

  const cfg = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, cfg);
  const springY = useSpring(0, cfg);

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      springX.set(0);
      springY.set(0);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const starX = rect.left + (parseFloat(initialPos.left) / 100) * rect.width;
    const starY = rect.top + (parseFloat(initialPos.top) / 100) * rect.height;
    const dx = mousePosition.x - starX;
    const dy = mousePosition.y - starY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 600;
    if (dist < radius) {
      const force = 1 - dist / radius;
      springX.set(dx * force * 0.5);
      springY.set(dy * force * 0.5);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initialPos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute bg-foreground rounded-full"
      style={{
        top: initialPos.top,
        left: initialPos.left,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
    />
  );
}

function InteractiveStarfield({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {Array.from({ length: 150 }).map((_, i) => (
        <Star key={`star-${i}`} mousePosition={mousePosition} containerRef={containerRef} />
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PricingContext = createContext<{
  isMonthly: boolean;
  setIsMonthly: (v: boolean) => void;
}>({ isMonthly: true, setIsMonthly: () => {} });

// ─── PricingSection ───────────────────────────────────────────────────────────

export function PricingSection({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that's right for you.",
}: PricingSectionProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  return (
    <PricingContext.Provider value={{ isMonthly, setIsMonthly }}>
      <div
        ref={containerRef}
        onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className="relative w-full bg-background dark:bg-neutral-950 py-20 sm:py-24"
      >
        <InteractiveStarfield mousePosition={mousePosition} containerRef={containerRef} />
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg whitespace-pre-line">{description}</p>
          </div>
          <PricingToggle />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
            {plans.map((plan, i) => (
              <PricingCard key={i} plan={plan} index={i} />
            ))}
          </div>
        </div>
      </div>
    </PricingContext.Provider>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function PricingToggle() {
  const { isMonthly, setIsMonthly } = useContext(PricingContext);
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const annualRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({});

  useEffect(() => {
    const ref = isMonthly ? monthlyRef : annualRef;
    if (ref.current) {
      setPillStyle({ width: ref.current.offsetWidth, transform: `translateX(${ref.current.offsetLeft}px)` });
    }
  }, [isMonthly]);

  const handleToggle = (monthly: boolean) => {
    if (isMonthly === monthly) return;
    setIsMonthly(monthly);
    if (!monthly && annualRef.current) {
      const rect = annualRef.current.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["hsl(var(--primary))", "hsl(var(--background))", "hsl(var(--accent))"],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative flex w-fit items-center rounded-full bg-muted p-1">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-primary p-1"
          style={pillStyle}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        <button
          ref={monthlyRef}
          onClick={() => handleToggle(true)}
          className={cn(
            "relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
            isMonthly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly
        </button>
        <button
          ref={annualRef}
          onClick={() => handleToggle(false)}
          className={cn(
            "relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
            !isMonthly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Annual
          <span className={cn("hidden sm:inline", !isMonthly ? "text-primary-foreground/80" : "")}>
            {" "}(Save 20%)
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMonthly } = useContext(PricingContext);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: plan.isPopular && isDesktop ? -20 : 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20, delay: index * 0.15 }}
      className={cn(
        "rounded-2xl p-8 flex flex-col relative bg-background/70 backdrop-blur-sm",
        plan.isPopular ? "border-2 border-primary shadow-xl" : "border border-border",
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="bg-primary py-1.5 px-4 rounded-full flex items-center gap-1.5">
            <LucideStar className="text-primary-foreground h-4 w-4 fill-current" />
            <span className="text-primary-foreground text-sm font-semibold">Most Popular</span>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col text-center">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
        <div className="mt-6 flex items-baseline justify-center gap-x-1">
          <span className="text-5xl font-bold tracking-tight text-foreground">
            <NumberFlow
              value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
              format={{ style: "currency", currency: "USD", minimumFractionDigits: 0 }}
            />
          </span>
          <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
            / {plan.period}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isMonthly ? "Billed Monthly" : "Billed Annually"}
        </p>
        <ul
          role="list"
          className="mt-8 space-y-3 text-sm leading-6 text-left text-muted-foreground"
        >
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <Link
            href={plan.href}
            className={cn(buttonVariants({ variant: plan.isPopular ? "default" : "outline", size: "lg" }), "w-full")}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
