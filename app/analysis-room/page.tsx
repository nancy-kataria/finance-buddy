"use client"

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/analysis-room/Header';
import { InputPanel } from '@/components/analysis-room/InputPanel';
import { AnalysisPanel } from '@/components/analysis-room/AnalysisPanel';
import ExhibitHall from '@/components/analysis-room/ExhibitHall';
import { Footer } from '@/components/Footer';
import { useProtected } from '@/lib/use-protected';
import type { Argument, ChatAnalystPoint, ChatApiResponse, ChatPageSearchResult, Phase, ProcessingStep, Source, VerdictData } from '@/types';

const STEPS_SEQUENCE: { delay: number; id: string; label: string }[] = [
  { delay: 400, id: 'p1', label: 'Summoning Analysts...' },
  { delay: 1400, id: 'p2', label: 'Scanning Private Insights...' },
  { delay: 2600, id: 'p3', label: 'Cross-referencing Web Context...' },
  { delay: 3800, id: 'p4', label: 'Staging Deliberation...' },
  { delay: 5200, id: 'p5', label: "Rendering Judge's Verdict..." },
];

const extractTicker = (query: string) => query.match(/\$([A-Z]{1,5})\b/)?.[1] ?? 'NVDA';

const normalizeSourceType = (value: unknown): Source['type'] => {
  return value === 'filing' || value === 'note' ? value : 'web';
};

const toExhibitSource = (result: ChatPageSearchResult, index: number): Source => {
  const content = result.content?.trim() ?? '';
  const metadata = result.metadata ?? {};

  return {
    id: result.id ?? `search-${index}`,
    title: metadata.title ?? (content.slice(0, 90) || `Relevant exhibit ${index + 1}`),
    domain: metadata.domain ?? 'database',
    url: metadata.url ?? '#',
    type: normalizeSourceType(metadata.type),
    date: metadata.date ?? new Date().toISOString().slice(0, 10),
  };
};

const buildArguments = (
  analystData: { points: ChatAnalystPoint[] }
): Argument[] => {
  return analystData.points.slice(0, 4).map((pt, index) => ({
    point: pt.content,
    weight: index === 0 ? 'strong' : index === 1 ? 'moderate' : 'weak',
    riskTag: pt.tag,
    sourceIndex: pt.sourceIndex 
  }));
};

const buildVerdictData = (
  question: string,
  apiResponse: ChatApiResponse,
  sources: Source[],
  tickerFromParams?: string | null,
): VerdictData => {
  const ticker = tickerFromParams || extractTicker(question);

  return {
    ticker,
    verdict: apiResponse.decision.verdict,
    confidence: apiResponse.decision.confidence,
    summary: apiResponse.decision.reasoning,
    bullArguments: buildArguments(apiResponse.bull),
    bearArguments: buildArguments(apiResponse.bear),
    riskTags: apiResponse.decision.keyRisks,
    sources,
  };
};

export default function JuryRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950 flex items-center justify-center"><div className="text-neutral-muted">Loading...</div></div>}>
      <JuryRoomPageContent />
    </Suspense>
  );
}

function JuryRoomPageContent() {
  const searchParams = useSearchParams();
  const tickerParam = searchParams.get('ticker');
  const { isLoading, isAuthenticated } = useProtected();
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [showBull, setShowBull] = useState(false);
  const [showBear, setShowBear] = useState(false);
  const [exhibits, setExhibits] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const requestIdRef = useRef(0);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleSubmit = async () => {
    if (!input.trim() || phase !== 'idle') return;
    const requestId = ++requestIdRef.current;
    clearTimers();
    setError(null);
    setVerdict(null);
    setShowBull(false);
    setShowBear(false);
    setExhibits([]);
    setPhase('processing');
    setSteps(STEPS_SEQUENCE.map(s => ({ id: s.id, label: s.label, status: 'pending' as const })));

    try {
      // Update steps as they complete
      STEPS_SEQUENCE.forEach(step => {
        const t = setTimeout(() => {
          if (requestId !== requestIdRef.current) return;
          setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'done' as const } : s));
          
          if (step.id === 'p1') setShowBull(true);
          else if (step.id === 'p2') setShowBear(true);
          else if (step.id === 'p3') setPhase('deliberating');
          else if (step.id === 'p5') setPhase('verdict');
        }, step.delay);
        timersRef.current.push(t);
      });

      // Call the chat API with ticker context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
          tickerContext: tickerParam,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate verdict');
      }

      const data: ChatApiResponse = await response.json();

      if (requestId !== requestIdRef.current) return;

      const sources = (data.sources as ChatPageSearchResult[])?.map((s, i) => toExhibitSource(s, i)) ?? [];
      const verdictData = buildVerdictData(input, data, sources, tickerParam);

      setExhibits(sources);
      setVerdict(verdictData);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      console.error('Chat analysis error:', error);
      clearTimers();
      setError(error instanceof Error ? error.message : 'Failed to generate verdict');
      setPhase('idle');
    }
  };

  const handleReset = () => {
    requestIdRef.current += 1;
    clearTimers();
    setInput('');
    setPhase('idle');
    setSteps([]);
    setVerdict(null);
    setShowBull(false);
    setShowBear(false);
    setExhibits([]);
    setError(null);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (phase === 'verdict' && verdict) {
      const clearTimer = setTimeout(() => {
        setInput('');
      }, 500);
      return () => clearTimeout(clearTimer);
    }
  }, [phase, verdict]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-neutral-muted">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Header phase={phase} onReset={handleReset} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_260px] gap-0 min-h-0">
        <InputPanel
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          phase={phase}
          error={error}
          steps={steps}
          textareaRef={textareaRef}
          onSuggestionClick={setInput}
          autoResize={autoResize}
        />

        <AnalysisPanel
          phase={phase}
          showBull={showBull}
          showBear={showBear}
          verdict={verdict}
        />

        <div className="border-l border-neutral-border bg-navy-900/40 hidden lg:flex flex-col overflow-hidden">
          <ExhibitHall sources={phase === 'verdict' && verdict ? verdict.sources : exhibits} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

