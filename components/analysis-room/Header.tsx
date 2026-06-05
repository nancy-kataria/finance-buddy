import Link from 'next/link';
import { Scale, RotateCcw, LogOut } from 'lucide-react';
import { signOut } from '@/app/auth/actions';
import type { Phase } from '@/types';

interface HeaderProps {
  phase: Phase;
  onReset: () => void;
}

export function Header({ phase, onReset }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-border bg-navy-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-neutral-muted hover:text-neutral-white transition-colors text-sm cursor-pointer"
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <div className="w-px h-5 bg-neutral-border" />
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-electric-dim border border-electric/30">
            <Scale size={13} className="text-electric" />
          </div>
          <Link href="/" className="font-mono font-bold text-sm text-neutral-white hover:text-electric transition-colors">
            Bull v. Bear
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {phase !== 'idle' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-neutral-muted hover:text-neutral-white hover:border-neutral-muted transition-all text-xs"
          >
            <RotateCcw size={12} />
            New Case
          </button>
        )}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${phase === 'idle' ? 'border-neutral-border text-neutral-muted' : phase === 'verdict' ? 'border-bull/40 text-bull bg-bull-dim/20' : 'border-electric/40 text-electric bg-electric-dim/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${phase === 'idle' ? 'bg-neutral-muted' : phase === 'verdict' ? 'bg-bull' : 'bg-electric animate-pulse'}`} />
          {phase === 'idle' ? 'Standby' : phase === 'processing' ? 'Processing' : phase === 'deliberating' ? 'Deliberating' : 'Verdict Ready'}
        </div>
      </div>
    </header>
  );
}
