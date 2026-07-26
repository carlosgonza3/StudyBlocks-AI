import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ArrowLeft,
    BookOpen,
    Braces,
    ChevronDown,
    Code2,
    FileText,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    Loader2,
    Minus,
    Pilcrow,
    Play,
    Quote,
    Redo2,
    Save,
    Sigma,
    Undo2,
} from "lucide-react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import DocumentOutline from "@/components/document/DocumentOutline";
import StudyGuideEditor, {
    type StudyGuideEditorHandle,
    type StudyGuideToolbarAction,
} from "@/components/editor/StudyGuideEditor";
import UnsavedChangesDialog from "@/components/editor/UnsavedChangesDialog";
import AppLayout from "@/components/layout/AppLayout";
import StudyMode from "@/components/study/StudyMode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
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
    const navigate = useNavigate();
    const {
        courseId,
        documentId,
    } = useParams<{
        courseId?: string;
        documentId?: string;
    }>();

    const isCourseStudyGuide = Boolean(courseId);

    const initialTitle =
        documentId === "demo"
            ? "Demo Study Guide"
            : documentId ?? "Untitled Guide";

    const [studyGuide, setStudyGuide] =
        useState<StudyGuide | null>(null);

    const [documentTitle, setDocumentTitle] =
        useState(initialTitle);

    const [savedTitle, setSavedTitle] =
        useState(initialTitle);

    const [markdown, setMarkdown] =
        useState(SAMPLE_MARKDOWN);

    const [savedMarkdown, setSavedMarkdown] =
        useState(SAMPLE_MARKDOWN);

    const [
        activeSectionId,
        setActiveSectionId,
    ] = useState<string | null>(null);

    const [isStudyMode, setIsStudyMode] =
        useState(false);

    const [studyIndex, setStudyIndex] =
        useState(0);

    const [
        reviewedSectionIds,
        setReviewedSectionIds,
    ] = useState<string[]>([]);

    const [isLoading, setIsLoading] =
        useState(isCourseStudyGuide);

    const [isSaving, setIsSaving] =
        useState(false);
    const [isDesktopLayout, setIsDesktopLayout] =
        useState(() =>
            window.matchMedia(
                "(min-width: 1024px)",
            ).matches,
        );
    const [pendingExitPath, setPendingExitPath] =
        useState<string | null>(null);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string | null>(null);

    const editorRef =
        useRef<StudyGuideEditorHandle | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(min-width: 1024px)",
        );
        const handleLayoutChange = () => {
            setIsDesktopLayout(mediaQuery.matches);
        };

        mediaQuery.addEventListener(
            "change",
            handleLayoutChange,
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleLayoutChange,
            );
        };
    }, []);

    function runToolbarAction(
        action: StudyGuideToolbarAction,
    ) {
        editorRef.current?.runToolbarAction(
            action,
        );
    }

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

                const loadedMarkdown =
                    loadedStudyGuide.contentMarkdown ||
                    SAMPLE_MARKDOWN;

                setStudyGuide(loadedStudyGuide);
                setDocumentTitle(
                    loadedStudyGuide.title,
                );
                setSavedTitle(
                    loadedStudyGuide.title,
                );
                setMarkdown(loadedMarkdown);
                setSavedMarkdown(loadedMarkdown);
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                if (!isCurrent) {
                    return;
                }

                setErrorMessage(
                    getReadableError(error),
                );
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

    const hasUnsavedChanges =
        documentTitle !== savedTitle ||
        markdown !== savedMarkdown;

    const handleSaveStudyGuide =
        useCallback(async (): Promise<boolean> => {
            if (!courseId) {
                setSavedTitle(documentTitle);
                setSavedMarkdown(markdown);
                toast.add({
                    title: "Document saved",
                    description:
                        "Demo document saved locally for this session.",
                    type: "success",
                });

                return true;
            }

            try {
                setIsSaving(true);

                const updatedStudyGuide =
                    await updateMainStudyGuide(
                        courseId,
                        {
                            title: documentTitle,
                            contentMarkdown: markdown,
                        },
                    );

                setStudyGuide(updatedStudyGuide);
                setDocumentTitle(
                    updatedStudyGuide.title,
                );
                setSavedTitle(
                    updatedStudyGuide.title,
                );
                setMarkdown(
                    updatedStudyGuide.contentMarkdown,
                );
                setSavedMarkdown(
                    updatedStudyGuide.contentMarkdown,
                );
                toast.add({
                    title: "Document saved",
                    description:
                        "Your Main Study Guide is up to date.",
                    type: "success",
                });
                return true;
            } catch (error) {
                toast.add({
                    title: "Could not save document",
                    description:
                        getReadableError(error),
                    type: "error",
                });
                return false;
            } finally {
                setIsSaving(false);
            }
        }, [
            courseId,
            documentTitle,
            markdown,
        ]);

    useEffect(() => {
        function handleSaveShortcut(
            event: KeyboardEvent,
        ) {
            const isSaveShortcut =
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "s";

            if (!isSaveShortcut) {
                return;
            }

            event.preventDefault();

            if (
                isLoading ||
                isSaving ||
                !hasUnsavedChanges
            ) {
                return;
            }

            void handleSaveStudyGuide();
        }

        window.addEventListener(
            "keydown",
            handleSaveShortcut,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleSaveShortcut,
            );
        };
    }, [
        handleSaveStudyGuide,
        hasUnsavedChanges,
        isLoading,
        isSaving,
    ]);

    function handleMarkdownChange(
        nextMarkdown: string,
    ) {
        setMarkdown(nextMarkdown);
    }

    function handleSectionSelect(
        sectionId: string,
    ) {
        setActiveSectionId(sectionId);

        const sectionIndex =
            flatSections.findIndex(
                (section) =>
                    section.id === sectionId,
            );

        if (sectionIndex === -1) {
            return;
        }

        editorRef.current?.focusHeading(
            sectionIndex,
        );
    }

    function handleStartStudyMode() {
        setStudyIndex(0);
        setIsStudyMode(true);
    }

    function calculateAutoReviewedIds(
        reviewedIds: string[],
    ) {
        const finalReviewedIds =
            new Set(reviewedIds);

        function walk(
            section: (typeof flatSections)[number],
        ) {
            for (
                const childSection
                of section.children
                ) {
                walk(childSection);
            }

            if (section.children.length > 0) {
                const allChildrenReviewed =
                    section.children.every(
                        (childSection) =>
                            finalReviewedIds.has(
                                childSection.id,
                            ),
                    );

                if (allChildrenReviewed) {
                    finalReviewedIds.add(
                        section.id,
                    );
                } else {
                    finalReviewedIds.delete(
                        section.id,
                    );
                }
            }
        }

        for (const rootSection of sections) {
            walk(rootSection);
        }

        return Array.from(
            finalReviewedIds,
        );
    }

    function handleToggleReviewed(
        sectionId: string,
    ) {
        setReviewedSectionIds(
            (currentIds) => {
                const selectedSection =
                    flatSections.find(
                        (section) =>
                            section.id ===
                            sectionId,
                    );

                if (!selectedSection) {
                    return currentIds;
                }

                const updatedIds =
                    new Set(currentIds);

                const isReviewed =
                    updatedIds.has(sectionId);

                if (
                    selectedSection.children
                        .length > 0
                ) {
                    return calculateAutoReviewedIds(
                        Array.from(updatedIds),
                    );
                }

                if (isReviewed) {
                    updatedIds.delete(
                        sectionId,
                    );
                } else {
                    updatedIds.add(
                        sectionId,
                    );
                }

                return calculateAutoReviewedIds(
                    Array.from(updatedIds),
                );
            },
        );
    }

    const backPath = courseId
        ? `/courses/${courseId}`
        : "/";

    const backLabel = courseId
        ? "Back to course"
        : "Back to dashboard";

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return undefined;
        }

        function handleBeforeUnload(
            event: BeforeUnloadEvent,
        ) {
            event.preventDefault();
            event.returnValue = "";
        }

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload,
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload,
            );
        };
    }, [hasUnsavedChanges]);

    function handleNavigationRequest(path: string) {
        if (hasUnsavedChanges) {
            setPendingExitPath(path);
            return;
        }

        navigate(path);
    }

    async function handleSaveAndExit() {
        const didSave =
            await handleSaveStudyGuide();

        if (!didSave || !pendingExitPath) {
            return;
        }

        const exitPath = pendingExitPath;
        setPendingExitPath(null);
        navigate(exitPath);
    }

    return (
        <AppLayout
            fullWidth={!isStudyMode}
            onNavigateRequest={
                handleNavigationRequest
            }
        >
            {isStudyMode ? (
                <StudyMode
                    currentIndex={studyIndex}
                    outlineSections={sections}
                    reviewedSectionIds={
                        reviewedSectionIds
                    }
                    studySections={flatSections}
                    onCurrentIndexChange={
                        setStudyIndex
                    }
                    onExit={() => {
                        setIsStudyMode(false);
                    }}
                    onToggleReviewed={
                        handleToggleReviewed
                    }
                />
            ) : (
                <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
                    <section className="hidden">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <Button
                                    asChild
                                    className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    variant="ghost"
                                >
                                    <Link
                                        to={backPath}
                                    >
                                        <ArrowLeft
                                            size={16}
                                        />
                                        {backLabel}
                                    </Link>
                                </Button>

                                <input
                                    aria-label="Study Guide title"
                                    className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground md:text-4xl"
                                    maxLength={120}
                                    placeholder="Untitled Study Guide"
                                    value={documentTitle}
                                    onChange={(
                                        event,
                                    ) => {
                                        setDocumentTitle(
                                            event
                                                .target
                                                .value,
                                        );

                                    }}
                                />

                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-full border border-border bg-muted px-3 py-1">
                                        {
                                            flatSections.length
                                        }{" "}
                                        sections
                                    </span>

                                    <span className="rounded-full border border-border bg-muted px-3 py-1">
                                        {
                                            markdown.length
                                        }{" "}
                                        characters
                                    </span>

                                    <span className="rounded-full border border-border bg-muted px-3 py-1">
                                        {hasUnsavedChanges
                                            ? "Unsaved changes"
                                            : "Saved"}
                                    </span>

                                    {studyGuide ? (
                                        <span className="rounded-full border border-border bg-muted px-3 py-1">
                                            Connected to
                                            database
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-border bg-muted px-3 py-1">
                                            Local demo
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:pt-9">
                                <Button
                                    disabled={
                                        isLoading ||
                                        isSaving ||
                                        !hasUnsavedChanges
                                    }
                                    variant="outline"
                                    onClick={() => {
                                        void handleSaveStudyGuide();
                                    }}
                                >
                                    {isSaving ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <Save
                                            size={16}
                                        />
                                    )}

                                    {isSaving
                                        ? "Saving..."
                                        : hasUnsavedChanges
                                            ? "Save"
                                            : "Saved"}
                                </Button>

                                <Button
                                    disabled={
                                        isLoading
                                    }
                                    onClick={
                                        handleStartStudyMode
                                    }
                                >
                                    <Play
                                        size={16}
                                    />
                                    Study
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section
                        aria-label="Study Guide editor toolbar"
                        className="z-20 shrink-0 border-b border-border bg-background/95 p-2 shadow-sm backdrop-blur"
                    >
                        <div className="flex items-center gap-1 overflow-x-auto">
                            <Button
                                aria-label={backLabel}
                                className="h-9 w-9 shrink-0 rounded-full p-0"
                                title={backLabel}
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    handleNavigationRequest(
                                        backPath,
                                    );
                                }}
                            >
                                <ArrowLeft
                                    size={17}
                                />
                            </Button>

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            <input
                                aria-label="Study Guide title"
                                className="w-44 shrink-0 bg-transparent px-2 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 md:w-56"
                                maxLength={120}
                                placeholder="Untitled Study Guide"
                                value={documentTitle}
                                onChange={(event) => {
                                    setDocumentTitle(
                                        event.target
                                            .value,
                                    );
                                }}
                            />

                            <span className="hidden shrink-0 rounded-full bg-muted px-2 py-1 text-[0.68rem] text-muted-foreground xl:inline">
                                {hasUnsavedChanges
                                    ? "Unsaved"
                                    : "Saved"}
                            </span>

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    aria-label="Undo"
                                    className="h-9 w-9 p-0"
                                    disabled={isLoading}
                                    title="Undo"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        runToolbarAction(
                                            "undo",
                                        );
                                    }}
                                >
                                    <Undo2 size={16} />
                                </Button>
                                <Button
                                    aria-label="Redo"
                                    className="h-9 w-9 p-0"
                                    disabled={isLoading}
                                    title="Redo"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        runToolbarAction(
                                            "redo",
                                        );
                                    }}
                                >
                                    <Redo2 size={16} />
                                </Button>
                            </div>

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    asChild
                                >
                                    <Button
                                        className="shrink-0"
                                        disabled={
                                            isLoading
                                        }
                                        type="button"
                                        variant="ghost"
                                    >
                                        <Pilcrow
                                            size={16}
                                        />
                                        Text style
                                        <ChevronDown
                                            size={14}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "paragraph",
                                            );
                                        }}
                                    >
                                        <Pilcrow
                                            size={16}
                                        />
                                        Normal text
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading1",
                                            );
                                        }}
                                    >
                                        <Heading1
                                            size={16}
                                        />
                                        Heading 1
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading2",
                                            );
                                        }}
                                    >
                                        <Heading2
                                            size={16}
                                        />
                                        Heading 2
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading3",
                                            );
                                        }}
                                    >
                                        <Heading3
                                            size={16}
                                        />
                                        Heading 3
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading4",
                                            );
                                        }}
                                    >
                                        <Heading4
                                            size={16}
                                        />
                                        Heading 4
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading5",
                                            );
                                        }}
                                    >
                                        <Heading5
                                            size={16}
                                        />
                                        Heading 5
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "heading6",
                                            );
                                        }}
                                    >
                                        <Heading6
                                            size={16}
                                        />
                                        Heading 6
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            {[
                                {
                                    action:
                                        "bulletList" as const,
                                    icon: List,
                                    label: "Bulleted list",
                                },
                                {
                                    action:
                                        "orderedList" as const,
                                    icon: ListOrdered,
                                    label: "Numbered list",
                                },
                                {
                                    action:
                                        "blockquote" as const,
                                    icon: Quote,
                                    label: "Quote",
                                },
                                {
                                    action:
                                        "codeBlock" as const,
                                    icon: Code2,
                                    label: "Code block",
                                },
                                {
                                    action:
                                        "horizontalRule" as const,
                                    icon: Minus,
                                    label: "Divider",
                                },
                            ].map((item) => {
                                const Icon =
                                    item.icon;

                                return (
                                    <Button
                                        key={
                                            item.action
                                        }
                                        aria-label={
                                            item.label
                                        }
                                        className="h-9 w-9 shrink-0 p-0"
                                        disabled={
                                            isLoading
                                        }
                                        title={
                                            item.label
                                        }
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            runToolbarAction(
                                                item.action,
                                            );
                                        }}
                                    >
                                        <Icon
                                            size={16}
                                        />
                                    </Button>
                                );
                            })}

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    asChild
                                >
                                    <Button
                                        className="shrink-0"
                                        disabled={
                                            isLoading
                                        }
                                        type="button"
                                        variant="ghost"
                                    >
                                        <Sigma
                                            size={16}
                                        />
                                        Equation
                                        <ChevronDown
                                            size={14}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "inlineMath",
                                            );
                                        }}
                                    >
                                        <Sigma
                                            size={16}
                                        />
                                        Inline equation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            runToolbarAction(
                                                "blockMath",
                                            );
                                        }}
                                    >
                                        <Braces
                                            size={16}
                                        />
                                        Block equation
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="ml-auto hidden shrink-0 items-center gap-2 px-2 text-xs text-muted-foreground 2xl:flex">
                                Type / for inline shortcuts
                            </div>

                            <div className="mx-1 h-6 w-px shrink-0 bg-border" />

                            <Button
                                className="shrink-0"
                                disabled={
                                    isLoading ||
                                    isSaving ||
                                    !hasUnsavedChanges
                                }
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    void handleSaveStudyGuide();
                                }}
                            >
                                {isSaving ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={15}
                                    />
                                ) : (
                                    <Save size={15} />
                                )}
                                {isSaving
                                    ? "Saving"
                                    : "Save"}
                            </Button>

                            <Button
                                className="shrink-0"
                                disabled={isLoading}
                                size="sm"
                                onClick={
                                    handleStartStudyMode
                                }
                            >
                                <Play size={15} />
                                Study
                            </Button>
                        </div>
                    </section>

                    {errorMessage ? (
                        <p className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}

                    {isLoading ? (
                        <div className="grid min-h-0 flex-1 place-items-center text-center text-sm text-muted-foreground">
                            <Loader2 className="mx-auto mb-3 animate-spin" />

                            Loading main Study
                            Guide...
                        </div>
                    ) : (
                        <section
                            aria-label="Resizable editor workspace"
                            className="min-h-0 flex-1"
                        >
                            <ResizablePanelGroup
                                key={
                                    isDesktopLayout
                                        ? "desktop"
                                        : "mobile"
                                }
                                orientation={
                                    isDesktopLayout
                                        ? "horizontal"
                                        : "vertical"
                                }
                            >
                            <ResizablePanel
                                defaultSize={
                                    isDesktopLayout
                                        ? "24%"
                                        : "32%"
                                }
                                maxSize={
                                    isDesktopLayout
                                        ? "45%"
                                        : "55%"
                                }
                                minSize={
                                    isDesktopLayout
                                        ? "15%"
                                        : "20%"
                                }
                            >
                            <Card className="h-full min-h-0 gap-0 overflow-hidden rounded-none border-0 bg-muted/20 p-0 text-card-foreground shadow-none">
                                <div className="border-b border-border px-5 py-5">
                                    <div className="flex items-center gap-2">
                                    <BookOpen
                                        className="text-muted-foreground"
                                        size={16}
                                    />

                                    <h2 className="text-sm font-semibold">
                                        Outline
                                    </h2>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                    <DocumentOutline
                                        activeSectionId={
                                            activeSectionId
                                        }
                                        sections={
                                            sections
                                        }
                                        onSectionSelect={
                                            handleSectionSelect
                                        }
                                    />
                                </div>
                            </Card>
                            </ResizablePanel>

                            <ResizableHandle
                                aria-label="Resize outline and editor"
                                withHandle
                            />

                            <ResizablePanel
                                defaultSize={
                                    isDesktopLayout
                                        ? "76%"
                                        : "68%"
                                }
                                minSize={
                                    isDesktopLayout
                                        ? "55%"
                                        : "45%"
                                }
                            >
                            <Card className="h-full min-h-0 gap-0 overflow-y-auto rounded-none border-0 bg-background p-0 text-card-foreground shadow-none">
                                <div className="hidden">
                                    <div className="flex items-center gap-2">
                                        <FileText
                                            className="text-muted-foreground"
                                            size={16}
                                        />

                                        <h2 className="font-semibold">
                                            Study Guide
                                        </h2>
                                    </div>

                                    <p className="hidden text-xs text-muted-foreground sm:block">
                                        Select text for
                                        formatting
                                    </p>
                                </div>

                                <StudyGuideEditor
                                    ref={editorRef}
                                    content={markdown}
                                    onChange={
                                        handleMarkdownChange
                                    }
                                />
                            </Card>
                            </ResizablePanel>
                            </ResizablePanelGroup>
                        </section>
                    )}

                    {pendingExitPath ? (
                        <UnsavedChangesDialog
                            isSaving={isSaving}
                            onCancel={() => {
                                setPendingExitPath(null);
                            }}
                            onExitWithoutSaving={() => {
                                const exitPath =
                                    pendingExitPath;
                                setPendingExitPath(null);
                                navigate(exitPath);
                            }}
                            onSaveAndExit={() => {
                                void handleSaveAndExit();
                            }}
                        />
                    ) : null}
                </div>
            )}
        </AppLayout>
    );
}
