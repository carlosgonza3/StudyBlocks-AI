import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ArrowLeft,
    Loader2,
    Play,
    Save,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import DocumentOutline from "@/components/document/DocumentOutline";
import AppLayout from "@/components/layout/AppLayout";
import MarkdownPreview from "@/components/preview/MarkdownPreview";
import StudyMode from "@/components/study/StudyMode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    getMainStudyGuide,
    updateMainStudyGuide,
} from "@/features/study-guides/api/studyGuidesApi";
import type { StudyGuide } from "@/features/study-guides/types/study-guide";
import { flattenStudySections } from "@/lib/markdown/flattenStudySections";
import { parseMarkdownSections } from "@/lib/markdown/parseMarkdownSections";

const SAMPLE_MARKDOWN = `# Calculus 2 Study Guide

## Series

### Geometric Series

A geometric series has the form:

$$
a + ar + ar^2 + ar^3 + \\cdots
$$

It converges when:

$$
|r| < 1
$$

The sum is:

$$
S = \\frac{a}{1-r}
$$

---

### Ratio Test

Use the ratio test when the series has factorials, exponentials, or powers.

For a series $\\sum a_n$, compute:

$$
L = \\lim_{n \\to \\infty} \\left| \\frac{a_{n+1}}{a_n} \\right|
$$

- If $L < 1$, the series converges absolutely.
- If $L > 1$, the series diverges.
- If $L = 1$, the test is inconclusive.

## Integrals

### Integration by Parts

The formula is:

$$
\\int u\\,dv = uv - \\int v\\,du
$$

## Extra Practice

### Practice Problem 1

Use the ratio test to determine whether the following series converges:

$$
\\sum_{n=1}^{\\infty} \\frac{n!}{n^n}
$$

### Practice Problem 2

Use integration by parts to solve:

$$
\\int x e^x dx
$$

### Practice Problem 3

Find the sum of the geometric series:

$$
3 + \\frac{3}{2} + \\frac{3}{4} + \\frac{3}{8} + \\cdots
$$
`;

function getReadableError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong.";
}

export default function EditorPage() {
    const { courseId, documentId } = useParams<{
        courseId?: string;
        documentId?: string;
    }>();

    const isCourseStudyGuide = Boolean(courseId);

    const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(
        null,
    );
    const [documentTitle, setDocumentTitle] = useState(
        documentId === "demo"
            ? "Demo Study Guide"
            : documentId ?? "Untitled Guide",
    );
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(
        null,
    );
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [studyIndex, setStudyIndex] = useState(0);
    const [reviewedSectionIds, setReviewedSectionIds] = useState<
        string[]
    >([]);
    const [isLoading, setIsLoading] = useState(isCourseStudyGuide);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );

    const previewRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!courseId) {
            return undefined;
        }

        let isCurrent = true;

        getMainStudyGuide(courseId)
            .then((loadedStudyGuide) => {
                if (!isCurrent) {
                    return;
                }

                setStudyGuide(loadedStudyGuide);
                setDocumentTitle(loadedStudyGuide.title);
                setMarkdown(
                    loadedStudyGuide.contentMarkdown || SAMPLE_MARKDOWN,
                );
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                if (!isCurrent) {
                    return;
                }

                setErrorMessage(getReadableError(error));
            })
            .finally(() => {
                if (!isCurrent) {
                    return;
                }

                setIsLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [courseId]);

    const sections = useMemo(
        () => parseMarkdownSections(markdown),
        [markdown],
    );
    const flatSections = useMemo(
        () => flattenStudySections(sections),
        [sections],
    );

    function handleSectionSelect(sectionId: string) {
        setActiveSectionId(sectionId);

        const previewElement = previewRef.current;

        if (previewElement) {
            const sectionIndex = flatSections.findIndex(
                (section) => section.id === sectionId,
            );

            if (sectionIndex !== -1) {
                const headingElements =
                    previewElement.querySelectorAll<HTMLElement>(
                        "h1, h2, h3, h4, h5, h6",
                    );

                const headingElement = headingElements[sectionIndex];

                if (headingElement) {
                    const targetTop = Math.max(
                        headingElement.offsetTop - 24,
                        0,
                    );

                    previewElement.scrollTo({
                        top: targetTop,
                        behavior: "smooth",
                    });
                }
            }
        }

        scrollEditorToSection(sectionId);
    }

    function scrollEditorToSection(sectionId: string) {
        const editorElement = editorRef.current;

        if (!editorElement) {
            return;
        }

        const sectionIndex = flatSections.findIndex(
            (section) => section.id === sectionId,
        );

        if (sectionIndex === -1) {
            return;
        }

        const lines = markdown.split("\n");

        let headingCount = -1;
        let targetLineIndex = -1;
        let targetCharIndex = 0;

        for (let index = 0; index < lines.length; index += 1) {
            const isHeading = /^(#{1,6})\s+(.+)$/.test(lines[index]);

            if (isHeading) {
                headingCount += 1;
            }

            if (headingCount === sectionIndex) {
                targetLineIndex = index;
                break;
            }

            targetCharIndex += lines[index].length + 1;
        }

        if (targetLineIndex === -1) {
            return;
        }

        const computedStyle = window.getComputedStyle(editorElement);
        const lineHeight =
            Number.parseFloat(computedStyle.lineHeight) || 28;

        const targetTop = Math.max(targetLineIndex * lineHeight - 24, 0);

        editorElement.focus({ preventScroll: true });
        editorElement.setSelectionRange(targetCharIndex, targetCharIndex);

        requestAnimationFrame(() => {
            editorElement.scrollTo({
                top: targetTop,
                behavior: "smooth",
            });
        });
    }

    function handleStartStudyMode() {
        setStudyIndex(0);
        setIsStudyMode(true);
    }

    function calculateAutoReviewedIds(reviewedIds: string[]) {
        const finalReviewedIds = new Set(reviewedIds);

        function walk(section: (typeof flatSections)[number]) {
            for (const childSection of section.children) {
                walk(childSection);
            }

            if (section.children.length > 0) {
                const allChildrenReviewed = section.children.every(
                    (childSection) => finalReviewedIds.has(childSection.id),
                );

                if (allChildrenReviewed) {
                    finalReviewedIds.add(section.id);
                } else {
                    finalReviewedIds.delete(section.id);
                }
            }
        }

        for (const rootSection of sections) {
            walk(rootSection);
        }

        return Array.from(finalReviewedIds);
    }

    function handleToggleReviewed(sectionId: string) {
        setReviewedSectionIds((currentIds) => {
            const selectedSection = flatSections.find(
                (section) => section.id === sectionId,
            );

            if (!selectedSection) {
                return currentIds;
            }

            const updatedIds = new Set(currentIds);
            const isReviewed = updatedIds.has(sectionId);

            if (selectedSection.children.length > 0) {
                return calculateAutoReviewedIds(Array.from(updatedIds));
            }

            if (isReviewed) {
                updatedIds.delete(sectionId);
            } else {
                updatedIds.add(sectionId);
            }

            return calculateAutoReviewedIds(Array.from(updatedIds));
        });
    }

    async function handleSaveStudyGuide() {
        if (!courseId) {
            setSuccessMessage("Demo document changes are local only.");
            return;
        }

        try {
            setIsSaving(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            const updatedStudyGuide = await updateMainStudyGuide(
                courseId,
                {
                    title: documentTitle,
                    contentMarkdown: markdown,
                },
            );

            setStudyGuide(updatedStudyGuide);
            setDocumentTitle(updatedStudyGuide.title);
            setMarkdown(updatedStudyGuide.contentMarkdown);
            setSuccessMessage("Main Study Guide saved.");
        } catch (error) {
            setErrorMessage(getReadableError(error));
        } finally {
            setIsSaving(false);
        }
    }

    const backPath = courseId ? `/courses/${courseId}` : "/";
    const backLabel = courseId ? "Back to course" : "Back to dashboard";
    const editingLabel = isCourseStudyGuide
        ? "Editing main Study Guide"
        : `Editing document: ${documentId}`;

    return (
        <AppLayout>
            {isStudyMode ? (
                <StudyMode
                    outlineSections={sections}
                    studySections={flatSections}
                    currentIndex={studyIndex}
                    reviewedSectionIds={reviewedSectionIds}
                    onCurrentIndexChange={setStudyIndex}
                    onToggleReviewed={handleToggleReviewed}
                    onExit={() => {
                        setIsStudyMode(false);
                    }}
                />
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <Button
                                asChild
                                className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                variant="ghost"
                            >
                                <Link to={backPath}>
                                    <ArrowLeft size={16} />
                                    {backLabel}
                                </Link>
                            </Button>

                            {isCourseStudyGuide ? (
                                <input
                                    className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none"
                                    maxLength={120}
                                    value={documentTitle}
                                    onChange={(event) => {
                                        setDocumentTitle(
                                            event.target.value,
                                        );
                                        setSuccessMessage(null);
                                    }}
                                />
                            ) : (
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {documentTitle}
                                </h1>
                            )}

                            <p className="mt-1 text-sm text-muted-foreground">
                                {editingLabel}
                            </p>

                            {studyGuide ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Study Guide ID: {studyGuide.id}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                disabled={isLoading || isSaving}
                                onClick={() => {
                                    void handleSaveStudyGuide();
                                }}
                                variant="outline"
                            >
                                {isSaving ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={16}
                                    />
                                ) : (
                                    <Save size={16} />
                                )}
                                Save
                            </Button>

                            <Button
                                disabled={isLoading}
                                onClick={handleStartStudyMode}
                            >
                                <Play size={16} />
                                Study
                            </Button>
                        </div>
                    </div>

                    {errorMessage ? (
                        <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="mb-4 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                            {successMessage}
                        </p>
                    ) : null}

                    {isLoading ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                            <Loader2 className="mx-auto mb-3 animate-spin" />
                            Loading main Study Guide...
                        </div>
                    ) : (
                        <div className="grid gap-6 xl:grid-cols-[280px_1fr_1fr]">
                            <Card className="gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground">
                                <div className="border-b border-border bg-card px-4 py-3">
                                    <h2 className="font-semibold text-card-foreground">
                                        Document Outline
                                    </h2>
                                </div>

                                <div className="h-[650px] overflow-y-auto p-4">
                                    <DocumentOutline
                                        activeSectionId={activeSectionId}
                                        sections={sections}
                                        onSectionSelect={handleSectionSelect}
                                    />
                                </div>
                            </Card>

                            <Card className="gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground">
                                <div className="border-b border-border bg-card px-4 py-3">
                                    <h2 className="font-semibold text-card-foreground">
                                        Markdown Editor
                                    </h2>
                                </div>

                                <Textarea
                                    ref={editorRef}
                                    className="h-[650px] resize-none rounded-none border-0 bg-muted font-mono text-sm leading-7 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                                    value={markdown}
                                    wrap="off"
                                    onChange={(event) => {
                                        setMarkdown(event.target.value);
                                        setSuccessMessage(null);
                                    }}
                                />
                            </Card>

                            <Card className="gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground">
                                <div className="border-b border-border bg-card px-4 py-3">
                                    <h2 className="font-semibold text-card-foreground">
                                        Live Preview
                                    </h2>
                                </div>

                                <div
                                    ref={previewRef}
                                    className="relative h-[650px] overflow-y-auto scroll-smooth bg-card p-6"
                                >
                                    <MarkdownPreview
                                        content={markdown}
                                        sections={sections}
                                    />
                                </div>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}