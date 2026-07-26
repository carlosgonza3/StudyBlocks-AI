import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

type MathClickHandler = (
    node: ProseMirrorNode,
    position: number,
) => void;

type StudyGuideEditorExtensionOptions = {
    onBlockMathClick?: MathClickHandler;
    onInlineMathClick?: MathClickHandler;
};

export function createStudyGuideEditorExtensions({
    onBlockMathClick,
    onInlineMathClick,
}: StudyGuideEditorExtensionOptions = {}) {
    return [
        StarterKit,
        Markdown,
        Mathematics.configure({
            inlineOptions: {
                onClick: onInlineMathClick,
            },
            blockOptions: {
                onClick: onBlockMathClick,
            },
            katexOptions: {
                strict: false,
                throwOnError: false,
                trust: false,
            },
        }),
    ];
}
