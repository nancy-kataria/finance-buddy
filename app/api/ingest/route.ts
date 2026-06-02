import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // Initializing Supabase Client to get the user session
    const supabase = await createClient();

    // Identifing the logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, metadata, ticker } = await req.json();

    if (!content || !ticker) {
      return NextResponse.json(
        { error: "Content and Ticker are required" },
        { status: 400 },
      );
    }

    // Find or create the ticker for this user
    const tickerRecord = await prisma.ticker.upsert({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: ticker.toUpperCase(),
        },
      },
      update: {},
      create: {
        symbol: ticker.toUpperCase(),
        userId: user.id,
      },
    });

    // Save the trading note
    await prisma.tradingNote.create({
      data: {
        content,
        userId: user.id,
        tickerId: tickerRecord.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data ingested successfully",
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to ingest data" },
      { status: 500 },
    );
  }
}
