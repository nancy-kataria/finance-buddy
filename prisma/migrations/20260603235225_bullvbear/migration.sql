-- CreateTable
CREATE TABLE "NoteChunk" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "chunkContent" TEXT NOT NULL,

    CONSTRAINT "NoteChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoteChunk_noteId_idx" ON "NoteChunk"("noteId");

-- AddForeignKey
ALTER TABLE "NoteChunk" ADD CONSTRAINT "NoteChunk_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "TradingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
