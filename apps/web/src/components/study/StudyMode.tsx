import { ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import DocumentOutline from "@/components/document/DocumentOutline";
import MarkdownPreview from "@/components/preview/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudySection } from "@/types/study-section";

type StudyModeProps = {
    outlineSections: StudySection[];
    studySections: StudySection[];
    currentIndex: number;
    reviewedSectionIds: string[];
    onCurrentIndexChange: (index: number) => void;
    onToggleReviewed: (sectionId: string) => void;
    onExit: () => void;
};

function SectionChildrenOverview({ section }: { section: StudySection }) {
    if (section.children.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6">
                <p className="text-muted-foreground">
                    This section only contains a heading. Add notes below it to study this
                    card.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-background p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
                In this section:
            </p>

            <div className="grid gap-3">
                {section.children.map((childSection, index) => (
                    <div
                        key={childSection.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                    >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">
                                {childSection.title}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                H{childSection.level}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StudyMode({
                                      outlineSections,
                                      studySections,
                                      currentIndex,
                                      reviewedSectionIds,
                                      onCurrentIndexChange,
                                      onToggleReviewed,
                                      onExit,
                                  }: StudyModeProps) {
    const currentSection = studySections[currentIndex];

    const totalSections = studySections.length;
    const reviewedCount = reviewedSectionIds.length;
    const progressPercentage =
        totalSections > 0 ? Math.round((reviewedCount / totalSections) * 100) : 0;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalSections - 1;

    function handleOutlineSelect(sectionId: string) {
        const nextIndex = studySections.findIndex(
            (section) => section.id === sectionId,
        );

        if (nextIndex !== -1) {
            onCurrentIndexChange(nextIndex);
        }
    }

    if (!currentSection) {
        return (
            <Card className="border-border bg-card p-8 text-card-foreground">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                        No study sections found
                    </h2>

                    <p className="mt-3 text-muted-foreground">
                        Add headings to your Markdown document to generate study cards.
                    </p>

                    <Button onClick={onExit} className="mt-6">
                        Back to editor
                    </Button>
                </div>
            </Card>
        );
    }

    const isReviewed = reviewedSectionIds.includes(currentSection.id);
    const hasContent = currentSection.content.trim().length > 0;
    const hasChildren = currentSection.children.length > 0;
    const canManuallyReview = !hasChildren;

    function goToPrevious() {
        if (!isFirst) {
            onCurrentIndexChange(currentIndex - 1);
        }
    }

    function goToNext() {
        if (!isLast) {
            onCurrentIndexChange(currentIndex + 1);
        }
    }

    return (
        <section>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Study Mode
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                        Review your study guide
                    </h1>
                </div>

                <Button variant="outline" onClick={onExit}>
                    <X size={16} />
                    Exit study mode
                </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
                <Card className="h-fit overflow-hidden border-border bg-card p-0 text-card-foreground xl:sticky xl:top-24">
                    <div className="border-b border-border bg-card px-4 py-3">
                        <h2 className="font-semibold text-card-foreground">
                            Study Outline
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Jump between concepts while studying.
                        </p>
                    </div>

                    <div className="max-h-[650px] overflow-y-auto p-4">
                        <DocumentOutline
                            sections={outlineSections}
                            activeSectionId={currentSection.id}
                            reviewedSectionIds={reviewedSectionIds}
                            onSectionSelect={handleOutlineSelect}
                        />
                    </div>
                </Card>

                <div>
                    <Card className="mb-6 border-border bg-card p-5 text-card-foreground">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                {reviewedCount} of {totalSections} reviewed
                            </p>

                            <p className="text-sm font-medium text-muted-foreground">
                                {progressPercentage}% reviewed
                            </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </Card>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSection.id}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Card className="min-h-[420px] border-border bg-card p-8 text-card-foreground shadow-sm">
                                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                            H{currentSection.level}
                                        </div>

                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                            {currentSection.title}
                                        </h2>
                                    </div>
                                    {canManuallyReview && (
                                        <Button
                                            variant={isReviewed ? "default" : "outline"}
                                            onClick={() => onToggleReviewed(currentSection.id)}
                                        >
                                            <CheckCircle2 size={16} />
                                            {isReviewed ? "Reviewed" : "Mark reviewed"}
                                        </Button>
                                    )}
                                </div>

                                {hasContent ? (
                                    <div className="rounded-2xl border border-border bg-background p-6">
                                        <MarkdownPreview
                                            content={currentSection.content}
                                            sections={[]}
                                        />
                                    </div>
                                ) : (
                                    <SectionChildrenOverview section={currentSection} />
                                )}
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center justify-between gap-4">
                        <Button variant="outline" onClick={goToPrevious} disabled={isFirst}>
                            <ArrowLeft size={16} />
                            Previous
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Block {currentIndex + 1} of {totalSections}
                        </div>

                        <Button onClick={goToNext} disabled={isLast}>
                            Next
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}