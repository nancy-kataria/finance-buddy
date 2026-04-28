import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
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

    const { content, metadata } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Generating the embeddings
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: content,
    });

    const vectorString = `[${embedding.join(",")}]`;

    // using Prisma to save the text and metadata
    // raw SQL for pgvector
    await prisma.$executeRaw`
    INSERT INTO "FinancialInsight" (id, content, metadata, embedding, "userId")
      VALUES (
        gen_random_uuid(), 
        ${content}, 
        ${JSON.stringify(metadata)}::jsonb, 
        ${vectorString}::vector,
        ${user.id} 
      )
    `;

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
