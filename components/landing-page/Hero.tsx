import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VerdictCard } from "@/components/landing-page/VerdictCard";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-paper opacity-40" aria-hidden />
      <div className="absolute inset-0 gradient-hero" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-20 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:pt-28">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bull" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              AI-powered investment research assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Don&apos;t just trade.
            {/* <br /> */}
            <span className="bg-gradient-to-r from-foreground via-system to-bull bg-clip-text text-transparent">
              Put your investments on trial.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            A multi-agent financial jury that debates your investments
            before you make them. A Bull and a Bear argue. A Judge decides.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button className="group inline-flex items-center justify-center gap-2 rounded-lg bg-system px-5 py-3 text-sm font-semibold text-system-foreground shadow-[var(--glow-system)] transition hover:brightness-110">
              Convene the Jury
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-surface-elevated">
              See a sample verdict
            </button>
          </motion.div>
        </div>

        {/* Verdict card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="animate-float">
            <VerdictCard
              tilt
              ticker="$NVDA"
              price="$1,142.83"
              change="+4.21%"
              changePositive
              verdict="BUY"
              confidence={0.94}
              sources={14}
              bullPoints={[
                { label: "Data-center revenue", detail: "+154% YoY · $22.6B run-rate" },
                { label: "Blackwell pipeline", detail: "Booked through FY26 · 80% margins" },
                { label: "CUDA moat", detail: "4M+ devs · zero credible alternative" },
                { label: "Hyperscaler capex", detail: "MSFT/META/GOOG guided +28%" },
              ]}
              bearPoints={[
                { label: "Concentration risk", detail: "Top-4 = 46% of revenue" },
                { label: "Valuation stretch", detail: "P/E 71x · 5y avg 48x" },
                { label: "China export curbs", detail: "$8B revenue at risk in '26" },
                { label: "Custom silicon", detail: "AWS Trainium, Google TPU ramp" },
              ]}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
