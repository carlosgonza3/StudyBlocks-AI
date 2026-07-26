import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
    Plugin,
    TextSelection,
} from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
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

function isEmptyParagraphAfterHorizontalRule(
    state: EditorState,
): boolean {
    const { selection } = state;

    if (
        !selection.empty ||
        selection.$from.parent.type.name !==
            "paragraph" ||
        selection.$from.parent.content.size !== 0 ||
        selection.$from.depth < 1
    ) {
        return false;
    }

    const containerDepth =
        selection.$from.depth - 1;
    const container =
        selection.$from.node(containerDepth);
    const paragraphIndex =
        selection.$from.index(containerDepth);

    return (
        paragraphIndex > 0 &&
        container.child(paragraphIndex - 1).type
            .name === "horizontalRule"
    );
}

function countHorizontalRules(
    state: EditorState,
): number {
    let count = 0;

    state.doc.descendants((node) => {
        if (node.type.name === "horizontalRule") {
            count += 1;
        }
    });

    return count;
}

const HorizontalRuleSpacing = Extension.create({
    name: "horizontalRuleSpacing",
    priority: 1100,

    addProseMirrorPlugins() {
        return [
            new Plugin({
                appendTransaction(
                    transactions,
                    oldState,
                    newState,
                ) {
                    const documentChanged =
                        transactions.some(
                            (transaction) =>
                                transaction.docChanged,
                        );
                    const addedHorizontalRule =
                        countHorizontalRules(newState) >
                        countHorizontalRules(oldState);

                    if (
                        !documentChanged ||
                        !addedHorizontalRule ||
                        !isEmptyParagraphAfterHorizontalRule(
                            newState,
                        )
                    ) {
                        return null;
                    }

                    const transaction =
                        newState.tr.insertText(
                            " ",
                            newState.selection.from,
                        );

                    return transaction.setSelection(
                        TextSelection.create(
                            transaction.doc,
                            newState.selection.from + 1,
                        ),
                    );
                },
            }),
        ];
    },
});

export function createStudyGuideEditorExtensions({
    onBlockMathClick,
    onInlineMathClick,
}: StudyGuideEditorExtensionOptions = {}) {
    return [
        HorizontalRuleSpacing,
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
