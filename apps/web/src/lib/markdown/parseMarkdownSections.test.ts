import { describe, expect, it } from "vitest";

import { parseMarkdownSections } from "@/lib/markdown/parseMarkdownSections";

describe("parseMarkdownSections", () => {
    it("returns an empty array for empty Markdown", () => {
        expect(parseMarkdownSections("")).toEqual([]);
    });

    it("returns an empty array when the document has no headings", () => {
        const markdown = [
            "This document has text.",
            "It does not contain a Markdown heading.",
        ].join("\n");

        expect(parseMarkdownSections(markdown)).toEqual([]);
    });

    it("creates a root section from a level-one heading", () => {
        const sections = parseMarkdownSections(
            "# Introduction\nWelcome to the course.",
        );

        expect(sections).toHaveLength(1);
        expect(sections[0]).toEqual({
            id: "introduction-1",
            title: "Introduction",
            level: 1,
            content: "Welcome to the course.\n",
            children: [],
            parentId: null,
            order: 1,
        });
    });

    it("creates multiple root sections with their own content", () => {
        const markdown = [
            "# Introduction",
            "Introduction content.",
            "# Conclusion",
            "Conclusion content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections).toHaveLength(2);

        expect(sections[0].title).toBe("Introduction");
        expect(sections[0].content).toBe("Introduction content.\n");

        expect(sections[1].title).toBe("Conclusion");
        expect(sections[1].content).toBe("Conclusion content.\n");
    });

    it("creates nested sections based on heading levels", () => {
        const markdown = [
            "# Infinite Series",
            "Root content.",
            "## Convergence Tests",
            "Convergence content.",
            "### Ratio Test",
            "Ratio test content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        const rootSection = sections[0];
        const convergenceSection = rootSection.children[0];
        const ratioTestSection = convergenceSection.children[0];

        expect(sections).toHaveLength(1);

        expect(rootSection.title).toBe("Infinite Series");
        expect(rootSection.parentId).toBeNull();

        expect(convergenceSection.title).toBe("Convergence Tests");
        expect(convergenceSection.parentId).toBe(rootSection.id);

        expect(ratioTestSection.title).toBe("Ratio Test");
        expect(ratioTestSection.parentId).toBe(convergenceSection.id);
    });

    it("returns to the correct parent when heading levels decrease", () => {
        const markdown = [
            "# Calculus II",
            "## Series",
            "### Ratio Test",
            "Ratio content.",
            "## Integration",
            "Integration content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        const courseSection = sections[0];
        const seriesSection = courseSection.children[0];
        const integrationSection = courseSection.children[1];

        expect(courseSection.children).toHaveLength(2);
        expect(seriesSection.title).toBe("Series");
        expect(seriesSection.children[0].title).toBe("Ratio Test");

        expect(integrationSection.title).toBe("Integration");
        expect(integrationSection.parentId).toBe(courseSection.id);
    });

    it("supports heading levels that skip a number", () => {
        const markdown = [
            "# Main Topic",
            "### Detailed Topic",
            "Detailed content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        const rootSection = sections[0];
        const detailedSection = rootSection.children[0];

        expect(detailedSection.level).toBe(3);
        expect(detailedSection.parentId).toBe(rootSection.id);
    });

    it("ignores content that appears before the first heading", () => {
        const markdown = [
            "Course title",
            "This text appears before a heading.",
            "# First Section",
            "Section content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections).toHaveLength(1);
        expect(sections[0].title).toBe("First Section");
        expect(sections[0].content).toBe("Section content.\n");
    });

    it("treats a hash without a following space as normal content", () => {
        const markdown = [
            "# Valid Heading",
            "#Not a heading",
            "Additional content.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections).toHaveLength(1);
        expect(sections[0].content).toBe(
            "#Not a heading\nAdditional content.\n",
        );
    });

    it("preserves blank lines inside section content", () => {
        const markdown = [
            "# Geometric Series",
            "First paragraph.",
            "",
            "Second paragraph.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections[0].content).toBe(
            "First paragraph.\n\nSecond paragraph.\n",
        );
    });

    it("creates unique IDs for repeated heading titles", () => {
        const markdown = [
            "# Introduction",
            "First introduction.",
            "# Introduction",
            "Second introduction.",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections[0].id).toBe("introduction-1");
        expect(sections[1].id).toBe("introduction-2");
        expect(sections[0].id).not.toBe(sections[1].id);
    });

    it("assigns document order across nested and root sections", () => {
        const markdown = [
            "# First",
            "## Second",
            "### Third",
            "# Fourth",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections[0].order).toBe(1);
        expect(sections[0].children[0].order).toBe(2);
        expect(sections[0].children[0].children[0].order).toBe(3);
        expect(sections[1].order).toBe(4);
    });

    it("supports all six valid Markdown heading levels", () => {
        const markdown = [
            "# Level One",
            "## Level Two",
            "### Level Three",
            "#### Level Four",
            "##### Level Five",
            "###### Level Six",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        const levelOne = sections[0];
        const levelTwo = levelOne.children[0];
        const levelThree = levelTwo.children[0];
        const levelFour = levelThree.children[0];
        const levelFive = levelFour.children[0];
        const levelSix = levelFive.children[0];

        expect(levelOne.level).toBe(1);
        expect(levelTwo.level).toBe(2);
        expect(levelThree.level).toBe(3);
        expect(levelFour.level).toBe(4);
        expect(levelFive.level).toBe(5);
        expect(levelSix.level).toBe(6);
    });

    it("does not treat seven hash symbols as a valid heading", () => {
        const markdown = [
            "# Valid Heading",
            "####### Invalid Heading",
        ].join("\n");

        const sections = parseMarkdownSections(markdown);

        expect(sections).toHaveLength(1);
        expect(sections[0].content).toBe(
            "####### Invalid Heading\n",
        );
    });
});