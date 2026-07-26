import {
    resolveExtensions,
    type JSONContent,
} from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import {
    describe,
    expect,
    it,
} from "vitest";

import { createStudyGuideEditorExtensions } from "./studyGuideEditorExtensions";

function createMarkdownManager() {
    return new MarkdownManager({
        extensions: resolveExtensions(
            createStudyGuideEditorExtensions(),
        ),
    });
}

function findNodes(
    content: JSONContent,
    type: string,
): JSONContent[] {
    const matches: JSONContent[] = [];

    function walk(node: JSONContent) {
        if (node.type === type) {
            matches.push(node);
        }

        node.content?.forEach(walk);
    }

    walk(content);

    return matches;
}

describe("Study Guide editor Markdown", () => {
    it("includes horizontal-rule cursor spacing behavior", () => {
        const extensions =
            createStudyGuideEditorExtensions();

        expect(
            extensions.some(
                (extension) =>
                    extension.name ===
                    "horizontalRuleSpacing",
            ),
        ).toBe(true);
    });

    it("round-trips headings, lists, emphasis, code, and blockquotes", () => {
        const manager = createMarkdownManager();
        const markdown = `# Guide

> Important **idea** with *emphasis* and \`inline code\`.

- First
- Second

\`\`\`ts
const answer = 42;
\`\`\`
`;

        const serialized = manager.serialize(
            manager.parse(markdown),
        );

        expect(serialized).toContain("# Guide");
        expect(serialized).toContain(
            "> Important **idea** with *emphasis* and `inline code`.",
        );
        expect(serialized).toContain("- First");
        expect(serialized).toContain(
            "```ts\nconst answer = 42;\n```",
        );
    });

    it("parses and serializes inline math without losing LaTeX backslashes", () => {
        const manager = createMarkdownManager();
        const markdown =
            "For a series $\\sum_{n=1}^{\\infty} a_n$, test convergence.";
        const document = manager.parse(markdown);
        const mathNodes = findNodes(
            document,
            "inlineMath",
        );

        expect(mathNodes).toHaveLength(1);
        expect(mathNodes[0].attrs?.latex).toBe(
            "\\sum_{n=1}^{\\infty} a_n",
        );
        expect(manager.serialize(document)).toContain(
            "$\\sum_{n=1}^{\\infty} a_n$",
        );
    });

    it("parses and serializes multiline block math", () => {
        const manager = createMarkdownManager();
        const markdown = `Before.

$$
\\int u\\,dv = uv - \\int v\\,du
$$

After.`;
        const document = manager.parse(markdown);
        const mathNodes = findNodes(
            document,
            "blockMath",
        );

        expect(mathNodes).toHaveLength(1);
        expect(mathNodes[0].attrs?.latex).toBe(
            "\\int u\\,dv = uv - \\int v\\,du",
        );
        expect(manager.serialize(document)).toContain(
            "$$\n\\int u\\,dv = uv - \\int v\\,du\n$$",
        );
    });

    it("keeps inline and block equations distinct in the same document", () => {
        const manager = createMarkdownManager();
        const document = manager.parse(`Inline $E = mc^2$.

$$
E = mc^2
$$`);

        expect(
            findNodes(document, "inlineMath"),
        ).toHaveLength(1);
        expect(
            findNodes(document, "blockMath"),
        ).toHaveLength(1);
    });
});
