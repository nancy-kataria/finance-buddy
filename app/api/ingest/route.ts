import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedMany } from "ai";

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

    // Remove any chunks from a previous ingest of this note so re-ingesting
    // (e.g. after an edit) replaces rather than duplicates them.
    await prisma.noteChunk.deleteMany({ where: { noteId } });

    // Embed every chunk in a single batched call.
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks.map(
        (chunkContent) =>
          `Ticker: ${ticker.toUpperCase()} \n\n Content: ${chunkContent}`,
      ),
    });

    // Create each chunk record, then inject its vector coordinates.
    await Promise.all(
      chunks.map(async (chunkContent, i) => {
        const chunkRecord = await prisma.noteChunk.create({
          data: { noteId, chunkContent },
        });

        const vectorString = `[${embeddings[i].join(",")}]`;

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