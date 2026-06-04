import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embed } from "ai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, ticker, noteId } = await req.json();

    if (!content || !ticker || !noteId) {
      return NextResponse.json(
        { error: "Content, ticker, and noteId are required" },
        { status: 400 },
      );
    }

    // Querying by both id and userId ensures a malicious user can't spoof someone else's noteId
    const note = await prisma.tradingNote.findFirst({
      where: { 
        id: noteId,
        userId: user.id 
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 },
      );
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, 
      chunkOverlap: 200, 
    });

    const chunks = await splitter.splitText(content);

    // Process all vector computations and database insertions concurrently
    await Promise.all(
      chunks.map(async (chunkContent) => {
        // Create relational chunk record
        const chunkRecord = await prisma.noteChunk.create({
          data: { noteId, chunkContent },
        });

        // Calculate vector coordinates
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: `Ticker: ${ticker.toUpperCase()} \n\n Content: ${chunkContent}`,
        });

        const vectorString = `[${embedding.join(",")}]`;

        // Inject coordinates directly into Supabase
        await prisma.$executeRaw`
          UPDATE "NoteChunk"
          SET "embedding" = ${vectorString}::vector
          WHERE id = ${chunkRecord.id}
        `;
      })
    );

    return NextResponse.json({
      success: true,
      message: "Data and vectors ingested successfully",
      chunksCreated: chunks.length,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to ingest data" },
      { status: 500 },
    );
  }
}