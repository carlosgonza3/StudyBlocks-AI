import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    DEFAULT_EDITOR_PREFERENCES,
    formatShortcutForDisplay,
    loadEditorPreferences,
    normalizeShortcut,
    shortcutFromKeyboardEvent,
    shortcutMatchesEvent,
} from "./editorPreferences";

describe("editor preferences", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it("normalizes common modifier aliases", () => {
        expect(
            normalizeShortcut("command-option-m"),
        ).toBe("Mod-Alt-M");
        expect(
            normalizeShortcut("ctrl-shift-7"),
        ).toBe("Mod-Shift-7");
    });

    it("matches Mod shortcuts on macOS and Windows", () => {
        const macEvent = {
            altKey: true,
            code: "KeyM",
            ctrlKey: false,
            key: "m",
            metaKey: true,
            shiftKey: false,
        } as KeyboardEvent;
        const windowsEvent = {
            altKey: true,
            code: "KeyM",
            ctrlKey: true,
            key: "M",
            metaKey: false,
            shiftKey: false,
        } as KeyboardEvent;

        expect(
            shortcutMatchesEvent(
                "Mod-Alt-M",
                macEvent,
            ),
        ).toBe(true);
        expect(
            shortcutMatchesEvent(
                "Mod-Alt-M",
                windowsEvent,
            ),
        ).toBe(true);
    });

    it("does not match when extra modifiers are pressed", () => {
        const event = {
            altKey: true,
            code: "KeyM",
            ctrlKey: true,
            key: "m",
            metaKey: false,
            shiftKey: true,
        } as KeyboardEvent;

        expect(
            shortcutMatchesEvent(
                "Mod-Alt-M",
                event,
            ),
        ).toBe(false);
    });

    it("records a pressed key combination", () => {
        const event = {
            altKey: true,
            code: "KeyK",
            ctrlKey: false,
            key: "k",
            metaKey: true,
            shiftKey: true,
        } as KeyboardEvent;

        expect(
            shortcutFromKeyboardEvent(event),
        ).toBe("Mod-Alt-Shift-K");
    });

    it("uses physical number keys when macOS Option changes event.key", () => {
        const event = {
            altKey: true,
            code: "Digit1",
            ctrlKey: false,
            key: "¡",
            metaKey: true,
            shiftKey: false,
        } as KeyboardEvent;

        expect(
            shortcutFromKeyboardEvent(event),
        ).toBe("Mod-Alt-1");
        expect(
            shortcutMatchesEvent(
                "Mod-Alt-1",
                event,
            ),
        ).toBe(true);
    });

    it("formats shortcuts with familiar keyboard symbols", () => {
        expect(
            formatShortcutForDisplay(
                "Mod-Alt-1",
            ),
        ).toBe("⌘⌥1");
        expect(
            formatShortcutForDisplay(
                "Mod-Shift-M",
            ),
        ).toBe("⌘⇧M");
    });

    it("merges stored shortcuts with new defaults", () => {
        vi.stubGlobal("window", {
            localStorage: {
                getItem: vi.fn(() =>
                    JSON.stringify({
                        fullWidth: true,
                        shortcuts: {
                            heading1:
                                "Mod-Shift-H",
                        },
                    }),
                ),
            },
        });

        const preferences =
            loadEditorPreferences();

        expect(
            preferences.shortcuts.heading1,
        ).toBe("Mod-Shift-H");
        expect(preferences.fullWidth).toBe(true);
        expect(
            preferences.shortcuts.blockMath,
        ).toBe(
            DEFAULT_EDITOR_PREFERENCES
                .shortcuts.blockMath,
        );
    });
});
