-- CreateTable
CREATE TABLE "study_guides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL DEFAULT '',
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_guides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_guides_courseId_key" ON "study_guides"("courseId");

-- AddForeignKey
ALTER TABLE "study_guides" ADD CONSTRAINT "study_guides_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
