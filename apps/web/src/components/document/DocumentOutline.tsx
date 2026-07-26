import {
    useMemo,
    useState,
} from "react";

import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudySection } from "@/types/study-section";

type DocumentOutlineProps = {
    activeSectionId: string | null;
    onSectionSelect: (sectionId: string) => void;
    reviewedSectionIds?: string[];
    sections: StudySection[];
};

type OutlineItemProps = {
    activeSectionId: string | null;
    collapsedSectionIds: Set<string>;
    depth: number;
    onSectionSelect: (sectionId: string) => void;
    onToggle: (sectionId: string) => void;
    reviewedSectionIds: Set<string>;
    section: StudySection;
};

function collectSectionIds(
    sections: StudySection[],
): string[] {
    return sections.flatMap((section) => [
        section.id,
        ...collectSectionIds(section.children),
    ]);
}

function collectCollapsibleIds(
    sections: StudySection[],
): string[] {
    return sections.flatMap((section) => [
        ...(section.children.length > 0
            ? [section.id]
            : []),
        ...collectCollapsibleIds(
            section.children,
        ),
    ]);
}

function findAncestorIds(
    sections: StudySection[],
    targetId: string,
    ancestors: string[] = [],
): string[] | null {
    for (const section of sections) {
        if (section.id === targetId) {
            return ancestors;
        }

        const match = findAncestorIds(
            section.children,
            targetId,
            [...ancestors, section.id],
        );

        if (match) {
            return match;
        }
    }

    return null;
}

function OutlineItem({
    activeSectionId,
    collapsedSectionIds,
    depth,
    onSectionSelect,
    onToggle,
    reviewedSectionIds,
    section,
}: OutlineItemProps) {
    const isActive =
        activeSectionId === section.id;
    const isReviewed =
        reviewedSectionIds.has(section.id);
    const hasChildren =
        section.children.length > 0;
    const isCollapsed =
        collapsedSectionIds.has(section.id);

    return (
        <li>
            <div
                className={[
                    "group flex items-center gap-1 rounded-xl transition-colors",
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/70",
                ].join(" ")}
            >
                {hasChildren ? (
                    <button
                        aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${section.title}`}
                        aria-expanded={!isCollapsed}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        type="button"
                        onClick={() => {
                            onToggle(section.id);
                        }}
                    >
                        {isCollapsed ? (
                            <ChevronRight size={15} />
                        ) : (
                            <ChevronDown size={15} />
                        )}
                    </button>
                ) : (
                    <span className="grid size-8 shrink-0 place-items-center">
                        <Circle
                            className={
                                isActive
                                    ? "fill-primary text-primary"
                                    : "fill-muted-foreground/25 text-muted-foreground/40"
                            }
                            size={7}
                        />
                    </span>
                )}

                <button
                    aria-current={
                        isActive
                            ? "location"
                            : undefined
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left"
                    type="button"
                    onClick={() => {
                        onSectionSelect(
                            section.id,
                        );
                    }}
                >
                    <span
                        className={[
                            "min-w-0 flex-1 truncate",
                            depth === 0
                                ? "text-sm font-semibold"
                                : "text-sm font-medium",
                            isActive
                                ? "text-primary"
                                : "text-foreground",
                        ].join(" ")}
                        title={section.title}
                    >
                        {section.title}
                    </span>

                    {isReviewed ? (
                        <CheckCircle2
                            aria-label="Reviewed"
                            className={
                                isActive
                                    ? "shrink-0 text-primary"
                                    : "shrink-0 text-emerald-600 dark:text-emerald-400"
                            }
                            size={15}
                        />
                    ) : null}
                </button>
            </div>

            {hasChildren && !isCollapsed ? (
                <ul className="relative ml-4 mt-1 space-y-1 pl-3 before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-border">
                    {section.children.map(
                        (childSection) => (
                            <OutlineItem
                                key={
                                    childSection.id
                                }
                                activeSectionId={
                                    activeSectionId
                                }
                                collapsedSectionIds={
                                    collapsedSectionIds
                                }
                                depth={depth + 1}
                                reviewedSectionIds={
                                    reviewedSectionIds
                                }
                                section={
                                    childSection
                                }
                                onSectionSelect={
                                    onSectionSelect
                                }
                                onToggle={onToggle}
                            />
                        ),
                    )}
                </ul>
            ) : null}
        </li>
    );
}

export default function DocumentOutline({
    activeSectionId,
    onSectionSelect,
    reviewedSectionIds = [],
    sections,
}: DocumentOutlineProps) {
    const [
        collapsedSectionIds,
        setCollapsedSectionIds,
    ] = useState<Set<string>>(
        () => new Set(),
    );

    const allSectionIds = useMemo(
        () => collectSectionIds(sections),
        [sections],
    );
    const reviewedIds = useMemo(
        () => new Set(reviewedSectionIds),
        [reviewedSectionIds],
    );
    const collapsibleIds = useMemo(
        () => collectCollapsibleIds(sections),
        [sections],
    );
    const visibleCollapsedSectionIds =
        useMemo(() => {
            const visible = new Set(
                collapsedSectionIds,
            );

            if (activeSectionId) {
                const ancestorIds =
                    findAncestorIds(
                        sections,
                        activeSectionId,
                    ) ?? [];

                ancestorIds.forEach(
                    (ancestorId) => {
                        visible.delete(
                            ancestorId,
                        );
                    },
                );
            }

            return visible;
        }, [
            activeSectionId,
            collapsedSectionIds,
            sections,
        ]);

    if (sections.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">
                    No structure yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add a heading from the toolbar
                    or type / to organize your
                    Study Guide.
                </p>
            </div>
        );
    }

    return (
        <nav aria-label="Document outline">
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {allSectionIds.length}{" "}
                    {allSectionIds.length === 1
                        ? "section"
                        : "sections"}
                </p>

                <div className="flex items-center gap-1">
                    <Button
                        aria-label="Expand all sections"
                        className="h-8 w-8 p-0"
                        disabled={
                            visibleCollapsedSectionIds.size ===
                            0
                        }
                        title="Expand all"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setCollapsedSectionIds(
                                new Set(),
                            );
                        }}
                    >
                        <ChevronsUpDown
                            size={15}
                        />
                    </Button>
                    <Button
                        aria-label="Collapse all sections"
                        className="h-8 w-8 p-0"
                        disabled={
                            collapsibleIds.length ===
                                0 ||
                            collapsibleIds.every(
                                (sectionId) =>
                                    visibleCollapsedSectionIds.has(
                                        sectionId,
                                    ),
                            )
                        }
                        title="Collapse all"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setCollapsedSectionIds(
                                new Set(
                                    collapsibleIds,
                                ),
                            );
                        }}
                    >
                        <ChevronsDownUp
                            size={15}
                        />
                    </Button>
                </div>
            </div>

            <ul className="space-y-1">
                {sections.map((section) => (
                    <OutlineItem
                        key={section.id}
                        activeSectionId={
                            activeSectionId
                        }
                        collapsedSectionIds={
                            visibleCollapsedSectionIds
                        }
                        depth={0}
                        reviewedSectionIds={
                            reviewedIds
                        }
                        section={section}
                        onSectionSelect={
                            (sectionId) => {
                                const ancestorIds =
                                    findAncestorIds(
                                        sections,
                                        sectionId,
                                    ) ?? [];

                                setCollapsedSectionIds(
                                    (current) => {
                                        const updated =
                                            new Set(
                                                current,
                                            );

                                        ancestorIds.forEach(
                                            (
                                                ancestorId,
                                            ) => {
                                                updated.delete(
                                                    ancestorId,
                                                );
                                            },
                                        );

                                        return updated;
                                    },
                                );
                                onSectionSelect(
                                    sectionId,
                                );
                            }
                        }
                        onToggle={(sectionId) => {
                            setCollapsedSectionIds(
                                (current) => {
                                    const updated =
                                        new Set(
                                            current,
                                        );

                                    if (
                                        updated.has(
                                            sectionId,
                                        )
                                    ) {
                                        updated.delete(
                                            sectionId,
                                        );
                                    } else {
                                        updated.add(
                                            sectionId,
                                        );
                                    }

                                    return updated;
                                },
                            );
                        }}
                    />
                ))}
            </ul>
        </nav>
    );
}
