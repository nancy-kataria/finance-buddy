import type { VerdictData } from '../types';

export const nvdaVerdict: VerdictData = {
  ticker: 'NVDA',
  companyName: 'NVIDIA Corporation',
  price: 875.42,
  change: 35.67,
  changePct: 4.25,
  verdict: 'BUY',
  confidence: 0.94,
  summary: 'NVIDIA maintains dominant positioning across AI accelerator infrastructure with Blackwell architecture adoption accelerating. Near-term margin pressure from datacenter supply constraints does not materially alter the long-term thesis. Initiate with BUY.',
  bullArguments: [
    { point: 'Blackwell GPU demand exceeds supply by 3–4x, with hyperscalers locked in multi-year commitments totaling $200B+', weight: 'strong' },
    { point: 'CUDA ecosystem moat creates switching costs estimated at 18–24 months for competitive migration', weight: 'strong', riskTag: 'Competitive Moat' },
    { point: 'Sovereign AI tailwind from 40+ governments building national compute infrastructure', weight: 'moderate' },
    { point: 'NIM microservices expanding TAM into inference software — recurring revenue flywheel', weight: 'moderate', riskTag: 'Software Revenue' },
    { point: 'Data center segment grew 427% YoY; automotive pipeline at $14B for 2026', weight: 'strong' },
  ],
  bearArguments: [
    { point: 'P/E ratio of 68x prices in near-perfect execution — any miss triggers significant multiple compression', weight: 'strong', riskTag: 'High P/E Ratio' },
    { point: 'AMD MI300X and Google TPU v5 gaining traction among cost-sensitive workloads', weight: 'moderate', riskTag: 'Competition Risk' },
    { point: 'China export controls eliminate ~$15B addressable market; geopolitical escalation remains unquantified tail risk', weight: 'strong', riskTag: 'China Exposure' },
    { point: 'Customer concentration: top 5 hyperscalers represent ~65% of revenue — any capex pullback is critical', weight: 'moderate', riskTag: 'Concentration Risk' },
    { point: 'Gross margin guidance of 74–75% below street expectations of 77% — supply chain costs elevated', weight: 'weak' },
  ],
  riskTags: ['High P/E Ratio', 'Competition Risk', 'China Exposure', 'Concentration Risk', 'Competitive Moat', 'Software Revenue'],
  sources: [
    { id: 's1', title: 'NVIDIA Q4 2024 Earnings Call Transcript', domain: 'investor.nvidia.com', url: '#', type: 'filing', date: '2024-02-21' },
    { id: 's2', title: 'Blackwell Architecture Deep Dive — Supply Chain Analysis', domain: 'semianalysis.com', url: '#', type: 'web', date: '2024-03-15' },
    { id: 's3', title: 'Personal Note: Tech Sector Rotation — Q1 2024', domain: 'private-notes', url: '#', type: 'note', date: '2024-03-01' },
    { id: 's4', title: 'AMD MI300X Competitive Positioning Report', domain: 'seekingalpha.com', url: '#', type: 'web', date: '2024-03-18' },
    { id: 's5', title: 'US-China Semiconductor Export Control Framework Update', domain: 'reuters.com', url: '#', type: 'web', date: '2024-03-20' },
  ],
  processingSteps: [
    { id: 'p1', label: 'Summoning Analysts...', status: 'done' },
    { id: 'p2', label: 'Scanning Private Insights...', status: 'done' },
    { id: 'p3', label: 'Cross-referencing Web Context...', status: 'done' },
    { id: 'p4', label: 'Staging Deliberation...', status: 'done' },
    { id: 'p5', label: 'Rendering Judge\'s Verdict...', status: 'done' },
  ],
};

export const liveProcessingSteps = [
  { id: 'p1', label: 'Summoning Analysts...', status: 'done' as const },
  { id: 'p2', label: 'Scanning Private Insights...', status: 'running' as const },
  { id: 'p3', label: 'Cross-referencing Web Context...', status: 'pending' as const },
  { id: 'p4', label: 'Staging Deliberation...', status: 'pending' as const },
  { id: 'p5', label: 'Rendering Judge\'s Verdict...', status: 'pending' as const },
];
