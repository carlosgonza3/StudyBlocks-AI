import { useMemo, useRef, useState } from "react";

import { ArrowLeft, Play } from "lucide-react";

import { Link, useParams } from "react-router-dom";

import DocumentOutline from "@/components/document/DocumentOutline";
import AppLayout from "@/components/layout/AppLayout";
import MarkdownPreview from "@/components/preview/MarkdownPreview";


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { parseMarkdownSections } from "@/lib/markdown/parseMarkdownSections";
import { flattenStudySections } from "@/lib/markdown/flattenStudySections";

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

export default function EditorPage() {
    const { documentId } = useParams();

    const documentTitle =
        documentId === "demo" ? "Demo Study Guide" : documentId ?? "Untitled Guide";

    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    const previewRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<HTMLTextAreaElement | null>(null);

    const sections = useMemo(() => parseMarkdownSections(markdown), [markdown]);
    const flatSections = useMemo(() => flattenStudySections(sections), [sections]);

    function handleSectionSelect(sectionId: string) {
        setActiveSectionId(sectionId);

        const previewElement = previewRef.current;

        if (previewElement) {
            const sectionIndex = flatSections.findIndex(
                (section) => section.id === sectionId,
            );

            if (sectionIndex !== -1) {
                const headingElements = previewElement.querySelectorAll<HTMLElement>(
                    "h1, h2, h3, h4, h5, h6",
                );

                const headingElement = headingElements[sectionIndex];

                if (headingElement) {
                    const targetTop = Math.max(headingElement.offsetTop - 24, 0);

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
        const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 28;

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

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                        <Link to="/">
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </Link>
                    </Button>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {documentTitle}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Editing document: {documentId}
                    </p>
                </div>

                <Button>
                    <Play size={16} />
                    Study
                </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[280px_1fr_1fr]">
                <Card className="overflow-hidden border-border bg-card p-0 text-card-foreground gap-0">
                    <div className="border-b border-border bg-card px-4 py-3">
                        <h2 className="font-semibold text-card-foreground">
                            Document Outline
                        </h2>
                    </div>

                    <div className="h-[650px] overflow-y-auto p-4">
                        <DocumentOutline
                            sections={sections}
                            activeSectionId={activeSectionId}
                            onSectionSelect={handleSectionSelect}
                        />
                    </div>
                </Card>

                <Card className="overflow-hidden border-border bg-card p-0 text-card-foreground gap-0">
                    <div className="border-b border-border bg-card px-4 py-3">
                        <h2 className="font-semibold text-card-foreground">
                            Markdown Editor
                        </h2>
                    </div>

                    <Textarea
                        ref={editorRef}
                        value={markdown}
                        onChange={(event) => setMarkdown(event.target.value)}
                        wrap="off"
                        className="h-[650px] resize-none rounded-none border-0 bg-muted font-mono text-sm leading-7 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                    />
                </Card>

                <Card className="overflow-hidden border-border bg-card p-0 text-card-foreground gap-0">
                    <div className="border-b border-border bg-card px-4 py-3">
                        <h2 className="font-semibold text-card-foreground">Live Preview</h2>
                    </div>

                    <div
                        ref={previewRef}
                        className="relative h-[650px] overflow-y-auto scroll-smooth bg-card p-6"
                    >
                        <MarkdownPreview content={markdown} sections={sections} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}