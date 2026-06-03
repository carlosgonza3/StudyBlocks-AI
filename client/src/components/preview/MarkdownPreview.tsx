import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { flattenStudySections } from "@/lib/markdown/flattenStudySections";
import type { StudySection } from "@/types/study-section";

type MarkdownPreviewProps = {
    content: string;
    sections: StudySection[];
};

function getTextFromChildren(children: ReactNode): string {
    if (typeof children === "string" || typeof children === "number") {
        return String(children);
    }

    if (Array.isArray(children)) {
        return children.map(getTextFromChildren).join("");
    }

    if (
        typeof children === "object" &&
        children !== null &&
        "props" in children
    ) {
        const childWithProps = children as { props?: { children?: ReactNode } };
        return getTextFromChildren(childWithProps.props?.children);
    }

    return "";
}

function normalizeHeadingTitle(title: string) {
    return title.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function MarkdownPreview({
                                            content,
                                            sections,
                                        }: MarkdownPreviewProps) {
    const flatSections = flattenStudySections(sections);

    const sectionIdsByTitle = new Map<string, string[]>();

    for (const section of flatSections) {
        const normalizedTitle = normalizeHeadingTitle(section.title);
        const existingIds = sectionIdsByTitle.get(normalizedTitle) ?? [];

        sectionIdsByTitle.set(normalizedTitle, [...existingIds, section.id]);
    }

    const usedTitleCounts = new Map<string, number>();

    function getHeadingAttributes(children: ReactNode) {
        const title = getTextFromChildren(children);
        const normalizedTitle = normalizeHeadingTitle(title);

        const matchingIds = sectionIdsByTitle.get(normalizedTitle);

        if (!matchingIds || matchingIds.length === 0) {
            return {};
        }

        const usedCount = usedTitleCounts.get(normalizedTitle) ?? 0;
        const sectionId = matchingIds[usedCount];

        usedTitleCounts.set(normalizedTitle, usedCount + 1);

        if (!sectionId) {
            return {};
        }

        return {
            id: sectionId,
            "data-section-id": sectionId,
        };
    }

    return (
        <div className="max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h1
                                {...headingAttributes}
                                className="mb-5 mt-0 scroll-mt-24 text-4xl font-bold tracking-tight text-foreground"
                            >
                                {children}
                            </h1>
                        );
                    },

                    h2: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h2
                                {...headingAttributes}
                                className="mb-4 mt-8 scroll-mt-24 border-b border-border pb-2 text-2xl font-bold tracking-tight text-foreground"
                            >
                                {children}
                            </h2>
                        );
                    },

                    h3: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h3
                                {...headingAttributes}
                                className="mb-3 mt-6 scroll-mt-24 text-xl font-semibold text-foreground"
                            >
                                {children}
                            </h3>
                        );
                    },

                    h4: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h4
                                {...headingAttributes}
                                className="mb-2 mt-5 scroll-mt-24 text-lg font-semibold text-foreground"
                            >
                                {children}
                            </h4>
                        );
                    },

                    h5: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h5
                                {...headingAttributes}
                                className="mb-2 mt-4 scroll-mt-24 text-base font-semibold text-foreground"
                            >
                                {children}
                            </h5>
                        );
                    },

                    h6: ({ children }) => {
                        const headingAttributes = getHeadingAttributes(children);

                        return (
                            <h6
                                {...headingAttributes}
                                className="mb-2 mt-4 scroll-mt-24 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                {children}
                            </h6>
                        );
                    },

                    p: ({ children }) => (
                        <p className="mb-4 leading-7 text-muted-foreground">{children}</p>
                    ),

                    ul: ({ children }) => (
                        <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => <li className="pl-1">{children}</li>,

                    hr: () => <hr className="my-8 border-border" />,

                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),

                    em: ({ children }) => <em className="text-foreground">{children}</em>,

                    blockquote: ({ children }) => (
                        <blockquote className="my-5 border-l-4 border-border bg-muted px-4 py-3 text-muted-foreground">
                            {children}
                        </blockquote>
                    ),

                    code: ({ children, className }) => {
                        const isMath = className?.includes("language-math");

                        if (isMath) {
                            return <code className={className}>{children}</code>;
                        }

                        return (
                            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                                {children}
                            </code>
                        );
                    },

                    pre: ({ children }) => (
                        <pre className="my-5 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-50">
              {children}
            </pre>
                    ),

                    table: ({ children }) => (
                        <div className="my-6 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                {children}
                            </table>
                        </div>
                    ),

                    th: ({ children }) => (
                        <th className="border border-border bg-muted px-3 py-2 text-left font-semibold text-foreground">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="border border-border px-3 py-2 text-muted-foreground">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}