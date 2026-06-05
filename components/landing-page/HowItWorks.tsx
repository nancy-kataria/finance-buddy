import { motion } from "framer-motion";
import {
  FileSearch,
  Users,
  Gavel,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: FileSearch,
      tone: "system",
      tag: "01 · Discovery",
      title: "We gather the evidence.",
      desc: "We scour your private notes and the live web to compile every relevant exhibit before opening arguments.",
    },
    {
      icon: Users,
      tone: "bull",
      tag: "02 · Deliberation",
      title: "The Bull and the Bear argue.",
      desc: "Two specialist agents debate pros and cons in parallel — backed by data, citing exhibits, no walls of text.",
    },
    {
      icon: Gavel,
      tone: "judge",
      tag: "03 · The Verdict",
      title: "A neutral Judge decides.",
      desc: "The Judge synthesizes the debate into a high-confidence Buy, Sell or Hold — with a transparent reasoning trail.",
    },
  ];

  return (
    <section id="how" className="relative border-t border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-system">
            The Evidence Path
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Three steps from question to verdict.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every decision follows the same disciplined trial — no hallucinated
            confidence, no black box.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur transition hover:border-border/80 hover:bg-surface-elevated"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                style={{ background: `var(--${s.tone})` }}
              />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl ring-1"
                style={{
                  background: `color-mix(in oklab, var(--${s.tone}) 15%, transparent)`,
                  borderColor: `var(--${s.tone})`,
                }}
              >
                <s.icon
                  className="h-5 w-5"
                  style={{ color: `var(--${s.tone})` }}
                />
              </div>
              <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.tag}
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
