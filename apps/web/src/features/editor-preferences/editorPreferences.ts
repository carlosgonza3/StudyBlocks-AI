export const EDITOR_PREFERENCES_STORAGE_KEY =
    "studyblocks.editor-preferences";

export const EDITOR_SHORTCUT_ACTIONS = [
    {
        description: "Turn the current block into a large heading.",
        id: "heading1",
        label: "Heading 1",
    },
    {
        description: "Turn the current block into a section heading.",
        id: "heading2",
        label: "Heading 2",
    },
    {
        description: "Turn the current block into a subsection heading.",
        id: "heading3",
        label: "Heading 3",
    },
    {
        description: "Turn the current block into a fourth-level heading.",
        id: "heading4",
        label: "Heading 4",
    },
    {
        description: "Turn the current block into a fifth-level heading.",
        id: "heading5",
        label: "Heading 5",
    },
    {
        description: "Turn the current block into a sixth-level heading.",
        id: "heading6",
        label: "Heading 6",
    },
    {
        description: "Start or toggle a bulleted list.",
        id: "bulletList",
        label: "Bulleted list",
    },
    {
        description: "Start or toggle a numbered list.",
        id: "orderedList",
        label: "Numbered list",
    },
    {
        description: "Start or toggle a quote block.",
        id: "blockquote",
        label: "Quote",
    },
    {
        description: "Start or toggle a fenced code block.",
        id: "codeBlock",
        label: "Code block",
    },
    {
        description: "Insert a horizontal divider.",
        id: "horizontalRule",
        label: "Divider",
    },
    {
        description: "Open the inline equation editor.",
        id: "inlineMath",
        label: "Inline equation",
    },
    {
        description: "Open the block equation editor.",
        id: "blockMath",
        label: "Block equation",
    },
] as const;

export type EditorShortcutAction =
    (typeof EDITOR_SHORTCUT_ACTIONS)[number]["id"];

export type EditorPreferences = {
    fullWidth: boolean;
    shortcuts: Record<
        EditorShortcutAction,
        string
    >;
};

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences =
    {
        fullWidth: false,
        shortcuts: {
            heading1: "Mod-Alt-1",
            heading2: "Mod-Alt-2",
            heading3: "Mod-Alt-3",
            heading4: "Mod-Alt-4",
            heading5: "Mod-Alt-5",
            heading6: "Mod-Alt-6",
            bulletList: "Mod-Shift-8",
            orderedList: "Mod-Shift-7",
            blockquote: "Mod-Shift-B",
            codeBlock: "Mod-Alt-C",
            horizontalRule: "Mod-Alt-D",
            inlineMath: "Mod-Alt-M",
            blockMath: "Mod-Shift-M",
        },
    };

export function loadEditorPreferences(): EditorPreferences {
    if (typeof window === "undefined") {
        return DEFAULT_EDITOR_PREFERENCES;
    }

    try {
        const storedValue = window.localStorage.getItem(
            EDITOR_PREFERENCES_STORAGE_KEY,
        );

        if (!storedValue) {
            return DEFAULT_EDITOR_PREFERENCES;
        }

        const parsed = JSON.parse(
            storedValue,
        ) as Partial<EditorPreferences>;

        return {
            fullWidth:
                typeof parsed.fullWidth === "boolean"
                    ? parsed.fullWidth
                    : DEFAULT_EDITOR_PREFERENCES.fullWidth,
            shortcuts: {
                ...DEFAULT_EDITOR_PREFERENCES.shortcuts,
                ...parsed.shortcuts,
            },
        };
    } catch {
        return DEFAULT_EDITOR_PREFERENCES;
    }
}

export function saveEditorPreferences(
    preferences: EditorPreferences,
) {
    window.localStorage.setItem(
        EDITOR_PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences),
    );
}

export function normalizeShortcut(
    shortcut: string,
): string {
    return shortcut
        .split("-")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const lowerPart = part.toLowerCase();

            if (
                lowerPart === "cmd" ||
                lowerPart === "command" ||
                lowerPart === "ctrl" ||
                lowerPart === "control" ||
                lowerPart === "mod"
            ) {
                return "Mod";
            }

            if (
                lowerPart === "option" ||
                lowerPart === "alt"
            ) {
                return "Alt";
            }

            if (lowerPart === "shift") {
                return "Shift";
            }

            return part.length === 1
                ? part.toUpperCase()
                : part;
        })
        .join("-");
}

export function shortcutMatchesEvent(
    shortcut: string,
    event: KeyboardEvent,
): boolean {
    const normalized = normalizeShortcut(shortcut);

    if (!normalized) {
        return false;
    }

    const parts = normalized.split("-");
    const key = parts.at(-1)?.toLowerCase();
    const eventKey =
        getShortcutKeyFromEvent(event).toLowerCase();
    const requiresMod = parts.includes("Mod");
    const requiresAlt = parts.includes("Alt");
    const requiresShift = parts.includes("Shift");

    return (
        Boolean(key) &&
        eventKey === key &&
        (event.metaKey || event.ctrlKey) ===
            requiresMod &&
        event.altKey === requiresAlt &&
        event.shiftKey === requiresShift
    );
}

function getShortcutKeyFromEvent(
    event: KeyboardEvent,
): string {
    if (/^Digit[0-9]$/.test(event.code)) {
        return event.code.slice(-1);
    }

    if (/^Numpad[0-9]$/.test(event.code)) {
        return event.code.slice(-1);
    }

    if (/^Key[A-Z]$/.test(event.code)) {
        return event.code.slice(-1);
    }

    const codeKeys: Record<string, string> = {
        ArrowDown: "ArrowDown",
        ArrowLeft: "ArrowLeft",
        ArrowRight: "ArrowRight",
        ArrowUp: "ArrowUp",
        Backspace: "Backspace",
        Delete: "Delete",
        Enter: "Enter",
        Escape: "Escape",
        Space: "Space",
        Tab: "Tab",
    };

    return codeKeys[event.code] ?? event.key;
}

export function shortcutFromKeyboardEvent(
    event: KeyboardEvent,
): string | null {
    const shortcutKey =
        getShortcutKeyFromEvent(event);

    if (
        [
            "Alt",
            "Control",
            "Meta",
            "Shift",
            "Tab",
        ].includes(shortcutKey)
    ) {
        return null;
    }

    const parts: string[] = [];

    if (event.metaKey || event.ctrlKey) {
        parts.push("Mod");
    }

    if (event.altKey) {
        parts.push("Alt");
    }

    if (event.shiftKey) {
        parts.push("Shift");
    }

    parts.push(
        shortcutKey.length === 1
            ? shortcutKey.toUpperCase()
            : shortcutKey,
    );

    return parts.join("-");
}

export function formatShortcutForDisplay(
    shortcut: string,
): string {
    return getShortcutDisplayParts(
        shortcut,
    ).join("");
}

export function getShortcutDisplayParts(
    shortcut: string,
): string[] {
    const symbols: Record<string, string> = {
        Alt: "⌥",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",
        ArrowUp: "↑",
        Backspace: "⌫",
        Delete: "⌦",
        Enter: "↵",
        Escape: "Esc",
        Mod: "⌘",
        Shift: "⇧",
        Space: "␠",
        Tab: "⇥",
    };

    return normalizeShortcut(shortcut)
        .split("-")
        .filter(Boolean)
        .map((part) => symbols[part] ?? part);
}
