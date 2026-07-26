CREATE TYPE "SourceDocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

CREATE TABLE "source_documents" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL DEFAULT '',
    "status" "SourceDocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "source_documents_courseId_idx" ON "source_documents"("courseId");

ALTER TABLE "source_documents"
ADD CONSTRAINT "source_documents_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
