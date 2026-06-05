"use client"

import { Footer } from "@/components/Footer";

export default function TradingAgentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Select a conversation to get started</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
