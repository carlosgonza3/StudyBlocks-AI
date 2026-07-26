import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
    Bold,
    Braces,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Italic,
    List,
    ListOrdered,
    Minus,
    Pilcrow,
    Quote,
    Sigma,
    Strikethrough,
} from "lucide-react";

import MathEditorDialog, {
    type MathDisplayMode,
} from "@/components/editor/MathEditorDialog";
import SlashCommandMenu, {
    type SlashCommandItem,
} from "@/components/editor/SlashCommandMenu";
import { createStudyGuideEditorExtensions } from "@/components/editor/studyGuideEditorExtensions";
import { Button } from "@/components/ui/button";
import {
    formatShortcutForDisplay,
    loadEditorPreferences,
    shortcutMatchesEvent,
    type EditorShortcutAction,
} from "@/features/editor-preferences/editorPreferences";

import "katex/dist/katex.min.css";

export type StudyGuideEditorHandle = {
    focusHeading: (headingIndex: number) => void;
    openMathEditor: (mode: MathDisplayMode) => void;
    runToolbarAction: (
        action: StudyGuideToolbarAction,
    ) => void;
};

export type StudyGuideToolbarAction =
    | EditorShortcutAction
    | "paragraph"
    | "redo"
    | "undo";

type StudyGuideEditorProps = {
    content: string;
    onChange: (markdown: string) => void;
};

type MathNodeType = "inline" | "block";

type MathDialogState = {
    latex: string;
    mode: MathDisplayMode;
    position: number | null;
};

type SlashMenuState = {
    from: number;
    left: number;
    query: string;
    selectedIndex: number;
    to: number;
    top: number;
};

const SLASH_COMMANDS: Array<
    SlashCommandItem & {
        action: EditorShortcutAction | "paragraph";
    }
> = [
    {
        action: "paragraph",
        description: "Plain text for notes and explanations.",
        icon: Pilcrow,
        id: "paragraph",
        keywords: ["text", "paragraph", "body"],
        label: "Text",
    },
    {
        action: "heading1",
        description: "Large title for a major topic.",
        icon: Heading1,
        id: "heading-1",
        keywords: ["title", "heading", "h1"],
        label: "Heading 1",
    },
    {
        action: "heading2",
        description: "Heading for a Study Guide section.",
        icon: Heading2,
        id: "heading-2",
        keywords: ["section", "heading", "h2"],
        label: "Heading 2",
    },
    {
        action: "heading3",
        description: "Heading for a smaller subsection.",
        icon: Heading3,
        id: "heading-3",
        keywords: ["subsection", "heading", "h3"],
        label: "Heading 3",
    },
    {
        action: "heading4",
        description: "Fourth-level heading for detailed topics.",
        icon: Heading4,
        id: "heading-4",
        keywords: ["detail", "heading", "h4"],
        label: "Heading 4",
    },
    {
        action: "heading5",
        description: "Fifth-level heading for deeper structure.",
        icon: Heading5,
        id: "heading-5",
        keywords: ["detail", "heading", "h5"],
        label: "Heading 5",
    },
    {
        action: "heading6",
        description: "Smallest heading level.",
        icon: Heading6,
        id: "heading-6",
        keywords: ["detail", "heading", "h6"],
        label: "Heading 6",
    },
    {
        action: "bulletList",
        description: "Create a bulleted list.",
        icon: List,
        id: "bullet-list",
        keywords: ["bullet", "unordered", "list"],
        label: "Bulleted list",
    },
    {
        action: "orderedList",
        description: "Create a numbered list.",
        icon: ListOrdered,
        id: "ordered-list",
        keywords: ["number", "ordered", "list"],
        label: "Numbered list",
    },
    {
        action: "blockquote",
        description: "Highlight a quotation or key idea.",
        icon: Quote,
        id: "quote",
        keywords: ["quote", "blockquote", "callout"],
        label: "Quote",
    },
    {
        action: "codeBlock",
        description: "Add a formatted block of code.",
        icon: Code,
        id: "code-block",
        keywords: ["code", "programming", "fence"],
        label: "Code block",
    },
    {
        action: "horizontalRule",
        description: "Separate topics with a divider.",
        icon: Minus,
        id: "divider",
        keywords: ["divider", "line", "separator", "rule"],
        label: "Divider",
    },
    {
        action: "inlineMath",
        description: "Add an equation inside a sentence.",
        icon: Sigma,
        id: "inline-equation",
        keywords: ["math", "latex", "formula", "inline"],
        label: "Inline equation",
    },
    {
        action: "blockMath",
        description: "Add a centered standalone equation.",
        icon: Braces,
        id: "block-equation",
        keywords: ["math", "latex", "formula", "block"],
        label: "Block equation",
    },
];

function getMathLatex(node: ProseMirrorNode): string {
    const latex = node.attrs.latex;

    return typeof latex === "string" ? latex : "";
}

const StudyGuideEditor = forwardRef<
    StudyGuideEditorHandle,
    StudyGuideEditorProps
>(function StudyGuideEditor(
    {
        content,
        onChange,
    },
    ref,
) {
    const editorInstanceRef = useRef<Editor | null>(null);
    const [
        mathDialog,
        setMathDialog,
    ] = useState<MathDialogState | null>(null);
    const [
        slashMenu,
        setSlashMenu,
    ] = useState<SlashMenuState | null>(null);
    const slashMenuRef =
        useRef<SlashMenuState | null>(null);

    const extensions = useMemo(() => {
        function editMathNode(
            type: MathNodeType,
            node: ProseMirrorNode,
            position: number,
        ) {
            setMathDialog({
                latex: getMathLatex(node),
                mode: type,
                position,
            });
        }

        return createStudyGuideEditorExtensions({
            onInlineMathClick: (node, position) => {
                editMathNode(
                    "inline",
                    node,
                    position,
                );
            },
            onBlockMathClick: (node, position) => {
                editMathNode(
                    "block",
                    node,
                    position,
                );
            },
        });
    }, []);

    const editor = useEditor({
        extensions,
        content,
        contentType: "markdown",
        editorProps: {
            attributes: {
                class: "study-guide-editor-content",
                spellcheck: "true",
            },
        },
        onUpdate: ({ editor: updatedEditor }) => {
            onChange(updatedEditor.getMarkdown());
        },
    });

    useEffect(() => {
        editorInstanceRef.current = editor;

        return () => {
            editorInstanceRef.current = null;
        };
    }, [editor]);

    const preferences = useMemo(
        loadEditorPreferences,
        [],
    );

    const slashCommandItems = useMemo(() => {
        const query =
            slashMenu?.query.trim().toLowerCase() ??
            "";

        return SLASH_COMMANDS.filter((item) => {
            if (!query) {
                return true;
            }

            return [
                item.label,
                ...item.keywords,
            ].some((value) =>
                value.toLowerCase().includes(query),
            );
        }).map((item) => ({
            ...item,
            shortcut:
                item.action === "paragraph"
                    ? undefined
                    : formatShortcutForDisplay(
                        preferences.shortcuts[
                            item.action
                        ],
                    ),
        }));
    }, [preferences, slashMenu?.query]);

    useEffect(() => {
        slashMenuRef.current = slashMenu;
    }, [slashMenu]);

    useEffect(() => {
        if (!editor) {
            return undefined;
        }

        function updateSlashMenu() {
            const { $from } =
                editor.state.selection;

            if (
                !editor.isEditable ||
                !$from.parent.isTextblock
            ) {
                setSlashMenu(null);
                return;
            }

            const textBeforeCursor =
                $from.parent.textBetween(
                    0,
                    $from.parentOffset,
                    undefined,
                    "\ufffc",
                );
            const match =
                textBeforeCursor.match(
                    /^\/([a-z0-9 ]*)$/i,
                );

            if (!match) {
                setSlashMenu(null);
                return;
            }

            const from =
                $from.start() +
                textBeforeCursor.length -
                match[0].length;
            const coordinates =
                editor.view.coordsAtPos(
                    editor.state.selection.from,
                );
            const menuHeight = Math.min(
                360,
                window.innerHeight - 24,
            );
            const fitsBelow =
                coordinates.bottom +
                    8 +
                    menuHeight <=
                window.innerHeight;

            setSlashMenu((current) => ({
                from,
                left: Math.max(
                    12,
                    Math.min(
                        coordinates.left,
                        window.innerWidth - 340,
                    ),
                ),
                query: match[1],
                selectedIndex:
                    current?.query === match[1]
                        ? current.selectedIndex
                        : 0,
                to: editor.state.selection.from,
                top: fitsBelow
                    ? coordinates.bottom + 8
                    : coordinates.top -
                        menuHeight -
                        8,
            }));
        }

        editor.on("update", updateSlashMenu);
        editor.on(
            "selectionUpdate",
            updateSlashMenu,
        );
        window.addEventListener(
            "scroll",
            updateSlashMenu,
            true,
        );
        window.addEventListener(
            "resize",
            updateSlashMenu,
        );

        return () => {
            editor.off("update", updateSlashMenu);
            editor.off(
                "selectionUpdate",
                updateSlashMenu,
            );
            window.removeEventListener(
                "scroll",
                updateSlashMenu,
                true,
            );
            window.removeEventListener(
                "resize",
                updateSlashMenu,
            );
        };
    }, [editor]);

    const executeEditorAction = useCallback((
        action: EditorShortcutAction | "paragraph",
        range?: {
            from: number;
            to: number;
        },
    ) => {
        if (!editor) {
            return;
        }

        let chain = editor.chain().focus();

        if (range) {
            chain = chain.deleteRange(range);
        }

        switch (action) {
            case "paragraph":
                chain.setParagraph().run();
                break;
            case "heading1":
                chain.setHeading({ level: 1 }).run();
                break;
            case "heading2":
                chain.setHeading({ level: 2 }).run();
                break;
            case "heading3":
                chain.setHeading({ level: 3 }).run();
                break;
            case "heading4":
                chain.setHeading({ level: 4 }).run();
                break;
            case "heading5":
                chain.setHeading({ level: 5 }).run();
                break;
            case "heading6":
                chain.setHeading({ level: 6 }).run();
                break;
            case "bulletList":
                chain.toggleBulletList().run();
                break;
            case "orderedList":
                chain.toggleOrderedList().run();
                break;
            case "blockquote":
                chain.toggleBlockquote().run();
                break;
            case "codeBlock":
                chain.toggleCodeBlock().run();
                break;
            case "horizontalRule":
                chain.setHorizontalRule().run();
                break;
            case "inlineMath":
            case "blockMath":
                chain.run();
                setMathDialog({
                    latex: "",
                    mode:
                        action === "inlineMath"
                            ? "inline"
                            : "block",
                    position: null,
                });
                break;
        }

        setSlashMenu(null);
    }, [editor]);

    useEffect(() => {
        if (!editor) {
            return undefined;
        }

        function handleEditorKeyDown(
            event: KeyboardEvent,
        ) {
            const activeSlashMenu =
                slashMenuRef.current;

            if (activeSlashMenu) {
                if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowUp"
                ) {
                    event.preventDefault();
                    setSlashMenu((current) => {
                        if (!current) {
                            return current;
                        }

                        const itemCount =
                            slashCommandItems.length;

                        if (itemCount === 0) {
                            return current;
                        }

                        const direction =
                            event.key === "ArrowDown"
                                ? 1
                                : -1;

                        return {
                            ...current,
                            selectedIndex:
                                (current.selectedIndex +
                                    direction +
                                    itemCount) %
                                itemCount,
                        };
                    });
                    return;
                }

                if (event.key === "Escape") {
                    event.preventDefault();
                    setSlashMenu(null);
                    return;
                }

                if (event.key === "Enter") {
                    const selectedItem =
                        slashCommandItems[
                            Math.min(
                                activeSlashMenu
                                    .selectedIndex,
                                Math.max(
                                    slashCommandItems.length -
                                        1,
                                    0,
                                ),
                            )
                        ];

                    if (selectedItem) {
                        event.preventDefault();
                        executeEditorAction(
                            selectedItem.action,
                            {
                                from:
                                    activeSlashMenu.from,
                                to: activeSlashMenu.to,
                            },
                        );
                    }
                    return;
                }
            }

            for (const action of SLASH_COMMANDS) {
                if (action.action === "paragraph") {
                    continue;
                }

                if (
                    shortcutMatchesEvent(
                        preferences.shortcuts[
                            action.action
                        ],
                        event,
                    )
                ) {
                    event.preventDefault();
                    executeEditorAction(
                        action.action,
                    );
                    return;
                }
            }
        }

        const editorElement = editor.view.dom;
        editorElement.addEventListener(
            "keydown",
            handleEditorKeyDown,
            true,
        );

        return () => {
            editorElement.removeEventListener(
                "keydown",
                handleEditorKeyDown,
                true,
            );
        };
    }, [
        editor,
        executeEditorAction,
        preferences,
        slashCommandItems,
    ]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentMarkdown = editor.getMarkdown();

        if (currentMarkdown === content) {
            return;
        }

        editor.commands.setContent(content, {
            contentType: "markdown",
            emitUpdate: false,
        });
    }, [content, editor]);

    useImperativeHandle(
        ref,
        () => ({
            focusHeading(headingIndex) {
                if (!editor || headingIndex < 0) {
                    return;
                }

                let currentHeadingIndex = 0;
                let targetPosition: number | null = null;

                editor.state.doc.descendants(
                    (node, position) => {
                        if (targetPosition !== null) {
                            return false;
                        }

                        if (node.type.name !== "heading") {
                            return true;
                        }

                        if (
                            currentHeadingIndex ===
                            headingIndex
                        ) {
                            targetPosition = position + 1;

                            return false;
                        }

                        currentHeadingIndex += 1;

                        return false;
                    },
                );

                if (targetPosition === null) {
                    return;
                }

                editor
                    .chain()
                    .focus()
                    .setTextSelection(targetPosition)
                    .scrollIntoView()
                    .run();
            },

            openMathEditor(mode) {
                if (!editor) {
                    return;
                }

                setMathDialog({
                    latex: "",
                    mode,
                    position: null,
                });
            },

            runToolbarAction(action) {
                if (!editor) {
                    return;
                }

                switch (action) {
                    case "undo":
                        editor
                            .chain()
                            .focus()
                            .undo()
                            .run();
                        break;
                    case "redo":
                        editor
                            .chain()
                            .focus()
                            .redo()
                            .run();
                        break;
                    case "paragraph":
                        editor
                            .chain()
                            .focus()
                            .setParagraph()
                            .run();
                        break;
                    case "heading1":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 1,
                            })
                            .run();
                        break;
                    case "heading2":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 2,
                            })
                            .run();
                        break;
                    case "heading3":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 3,
                            })
                            .run();
                        break;
                    case "heading4":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 4,
                            })
                            .run();
                        break;
                    case "heading5":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 5,
                            })
                            .run();
                        break;
                    case "heading6":
                        editor
                            .chain()
                            .focus()
                            .setHeading({
                                level: 6,
                            })
                            .run();
                        break;
                    case "bulletList":
                        editor
                            .chain()
                            .focus()
                            .toggleBulletList()
                            .run();
                        break;
                    case "orderedList":
                        editor
                            .chain()
                            .focus()
                            .toggleOrderedList()
                            .run();
                        break;
                    case "blockquote":
                        editor
                            .chain()
                            .focus()
                            .toggleBlockquote()
                            .run();
                        break;
                    case "codeBlock":
                        editor
                            .chain()
                            .focus()
                            .toggleCodeBlock()
                            .run();
                        break;
                    case "horizontalRule":
                        editor
                            .chain()
                            .focus()
                            .setHorizontalRule()
                            .run();
                        break;
                    case "inlineMath":
                    case "blockMath":
                        setMathDialog({
                            latex: "",
                            mode:
                                action ===
                                "inlineMath"
                                    ? "inline"
                                    : "block",
                            position: null,
                        });
                        break;
                }
            },
        }),
        [editor],
    );

    if (!editor) {
        return (
            <div className="flex min-h-[32rem] items-center justify-center text-sm text-muted-foreground">
                Preparing editor...
            </div>
        );
    }

    return (
        <div
            className={[
                "study-guide-editor",
                preferences.fullWidth
                    ? "study-guide-editor-full-width"
                    : "",
            ].join(" ")}
        >
            <BubbleMenu editor={editor}>
                <div className="study-guide-bubble-menu">
                    <Button
                        aria-label="Bold"
                        className="h-8 w-8 p-0"
                        type="button"
                        variant={
                            editor.isActive("bold")
                                ? "secondary"
                                : "ghost"
                        }
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleBold()
                                .run();
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <Bold size={15} />
                    </Button>

                    <Button
                        aria-label="Italic"
                        className="h-8 w-8 p-0"
                        type="button"
                        variant={
                            editor.isActive("italic")
                                ? "secondary"
                                : "ghost"
                        }
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleItalic()
                                .run();
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <Italic size={15} />
                    </Button>

                    <Button
                        aria-label="Strikethrough"
                        className="h-8 w-8 p-0"
                        type="button"
                        variant={
                            editor.isActive("strike")
                                ? "secondary"
                                : "ghost"
                        }
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleStrike()
                                .run();
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <Strikethrough size={15} />
                    </Button>

                    <Button
                        aria-label="Inline code"
                        className="h-8 w-8 p-0"
                        type="button"
                        variant={
                            editor.isActive("code")
                                ? "secondary"
                                : "ghost"
                        }
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleCode()
                                .run();
                        }}
                        onMouseDown={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <Code2 size={15} />
                    </Button>
                </div>
            </BubbleMenu>

            <EditorContent editor={editor} />

            {slashMenu ? (
                <SlashCommandMenu
                    items={slashCommandItems}
                    left={slashMenu.left}
                    selectedIndex={Math.min(
                        slashMenu.selectedIndex,
                        Math.max(
                            slashCommandItems.length -
                                1,
                            0,
                        ),
                    )}
                    top={slashMenu.top}
                    onSelect={(item) => {
                        const command =
                            SLASH_COMMANDS.find(
                                (candidate) =>
                                    candidate.id ===
                                    item.id,
                            );

                        if (!command) {
                            return;
                        }

                        executeEditorAction(
                            command.action,
                            {
                                from: slashMenu.from,
                                to: slashMenu.to,
                            },
                        );
                    }}
                />
            ) : null}

            {mathDialog ? (
                <MathEditorDialog
                initialLatex={mathDialog.latex}
                initialMode={mathDialog.mode}
                isEditing={mathDialog.position !== null}
                onCancel={() => {
                    setMathDialog(null);
                    editor.commands.focus();
                }}
                onConfirm={(latex, mode) => {
                    const { position } = mathDialog;
                    const didChange =
                        position === null
                            ?
                            mode === "inline"
                                ? editor.commands.insertInlineMath({
                                    latex,
                                })
                                : editor.commands.insertBlockMath({
                                    latex,
                                })
                            :
                            mode === "inline"
                                ? editor.commands.updateInlineMath({
                                    latex,
                                    pos: position,
                                })
                                : editor.commands.updateBlockMath({
                                    latex,
                                    pos: position,
                                });

                    if (didChange) {
                        setMathDialog(null);
                        editor.commands.focus();
                    }
                }}
                />
            ) : null}
        </div>
    );
});

export default StudyGuideEditor;
