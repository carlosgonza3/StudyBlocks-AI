import { CheckCircle2, Hash } from "lucide-react";

import type { StudySection } from "@/types/study-section";

type DocumentOutlineProps = {
    sections: StudySection[];
    activeSectionId: string | null;
    reviewedSectionIds?: string[];
    onSectionSelect: (sectionId: string) => void;
};

type OutlineItemProps = {
    section: StudySection;
    activeSectionId: string | null;
    reviewedSectionIds: string[];
    onSectionSelect: (sectionId: string) => void;
};

function OutlineItem({
                         section,
                         activeSectionId,
                         reviewedSectionIds,
                         onSectionSelect,
                     }: OutlineItemProps) {
    const isActive = activeSectionId === section.id;
    const isReviewed = reviewedSectionIds.includes(section.id);

    return (
        <li>
            <button
                type="button"
                onClick={() => onSectionSelect(section.id)}
                className={[
                    "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : isReviewed
                            ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
            >
                {isReviewed ? (
                    <CheckCircle2
                        size={14}
                        className={[
                            "shrink-0 transition",
                            isActive
                                ? "text-primary-foreground"
                                : "text-emerald-600 dark:text-emerald-400",
                        ].join(" ")}
                    />
                ) : (
                    <Hash
                        size={14}
                        className={[
                            "shrink-0 transition",
                            isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-accent-foreground",
                        ].join(" ")}
                    />
                )}

                <span
                    className={[
                        "min-w-0 flex-1 truncate",
                        isActive
                            ? "text-primary-foreground"
                            : isReviewed
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-foreground group-hover:text-accent-foreground",
                    ].join(" ")}
                >
          {section.title}
        </span>

                <span
                    className={[
                        "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                        isActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : isReviewed
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground",
                    ].join(" ")}
                >
          H{section.level}
        </span>
            </button>

            {section.children.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                    {section.children.map((childSection) => (
                        <OutlineItem
                            key={childSection.id}
                            section={childSection}
                            activeSectionId={activeSectionId}
                            reviewedSectionIds={reviewedSectionIds}
                            onSectionSelect={onSectionSelect}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function DocumentOutline({
                                            sections,
                                            activeSectionId,
                                            reviewedSectionIds = [],
                                            onSectionSelect,
                                        }: DocumentOutlineProps) {
    if (sections.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">No structure yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                    Add headings like #, ##, or ### to generate your study guide outline.
                </p>
            </div>
        );
    }

    return (
        <nav aria-label="Document outline">
            <ul className="space-y-1">
                {sections.map((section) => (
                    <OutlineItem
                        key={section.id}
                        section={section}
                        activeSectionId={activeSectionId}
                        reviewedSectionIds={reviewedSectionIds}
                        onSectionSelect={onSectionSelect}
                    />
                ))}
            </ul>
        </nav>
    );
}