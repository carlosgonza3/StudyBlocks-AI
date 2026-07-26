import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Keyboard,
    Maximize2,
    PanelLeft,
    RotateCcw,
    Save,
} from "lucide-react";
import { Link } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
    DEFAULT_EDITOR_PREFERENCES,
    EDITOR_SHORTCUT_ACTIONS,
    getShortcutDisplayParts,
    loadEditorPreferences,
    normalizeShortcut,
    saveEditorPreferences,
    shortcutFromKeyboardEvent,
    type EditorPreferences,
    type EditorShortcutAction,
} from "@/features/editor-preferences/editorPreferences";

export default function EditorPreferencesPage() {
    const [preferences, setPreferences] =
        useState<EditorPreferences>(
            loadEditorPreferences,
        );
    const [savedPreferences, setSavedPreferences] =
        useState<EditorPreferences>(
            loadEditorPreferences,
        );
    const [message, setMessage] =
        useState<string | null>(null);
    const [
        recordingAction,
        setRecordingAction,
    ] = useState<EditorShortcutAction | null>(
        null,
    );

    const duplicateShortcuts = useMemo(() => {
        const shortcutOwners = new Map<
            string,
            EditorShortcutAction[]
        >();

        for (const action of EDITOR_SHORTCUT_ACTIONS) {
            const shortcut = normalizeShortcut(
                preferences.shortcuts[action.id],
            );

            if (!shortcut) {
                continue;
            }

            shortcutOwners.set(shortcut, [
                ...(shortcutOwners.get(shortcut) ??
                    []),
                action.id,
            ]);
        }

        return new Set(
            Array.from(shortcutOwners.values())
                .filter((owners) => owners.length > 1)
                .flat(),
        );
    }, [preferences]);

    const hasChanges =
        JSON.stringify(preferences) !==
        JSON.stringify(savedPreferences);

    function updateShortcut(
        action: EditorShortcutAction,
        value: string,
    ) {
        setPreferences((current) => ({
            ...current,
            shortcuts: {
                ...current.shortcuts,
                [action]: value,
            },
        }));
        setMessage(null);
    }

    return (
        <AppLayout>
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">

                <div>
                    <Button
                        asChild
                        className="mb-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                        variant="ghost"
                    >
                        <Link to="/">
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </Link>
                    </Button>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setPreferences(
                                    DEFAULT_EDITOR_PREFERENCES,
                                );
                                setMessage(null);
                            }}
                        >
                            <RotateCcw size={16} />
                            Restore defaults
                        </Button>
                        <Button
                            disabled={
                                !hasChanges ||
                                duplicateShortcuts.size > 0
                            }
                            type="button"
                            onClick={() => {
                                const normalizedPreferences = {
                                    fullWidth:
                                        preferences.fullWidth,
                                    shortcuts:
                                        Object.fromEntries(
                                            Object.entries(
                                                preferences.shortcuts,
                                            ).map(
                                                ([
                                                     action,
                                                     shortcut,
                                                 ]) => [
                                                    action,
                                                    normalizeShortcut(
                                                        shortcut,
                                                    ),
                                                ],
                                            ),
                                        ),
                                } as EditorPreferences;

                                saveEditorPreferences(
                                    normalizedPreferences,
                                );
                                setPreferences(
                                    normalizedPreferences,
                                );
                                setSavedPreferences(
                                    normalizedPreferences,
                                );
                                setMessage(
                                    "Editor preferences saved.",
                                );
                                toast.add({
                                    title: "Preferences saved",
                                    description:
                                        "Your editor settings will be used the next time you open the editor.",
                                    type: "success",
                                });
                            }}
                        >
                            <Save size={16} />
                            Save preferences
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-border bg-card p-3">
                            <Keyboard size={22} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Editor preferences
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Customize shortcuts used
                                while writing Study Guides.
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="gap-0 overflow-hidden p-0">
                    <div className="border-b border-border p-5">
                        <h2 className="font-semibold">
                            Editor width
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose how much horizontal space
                            the document uses while writing.
                        </p>
                    </div>

                    <div
                        className="grid gap-3 p-5 sm:grid-cols-2"
                        role="radiogroup"
                        aria-label="Editor width"
                    >
                        {[
                            {
                                description:
                                    "Keep lines comfortably narrow for focused reading and writing.",
                                fullWidth: false,
                                icon: PanelLeft,
                                label: "Focused width",
                            },
                            {
                                description:
                                    "Use all available space in the editor container.",
                                fullWidth: true,
                                icon: Maximize2,
                                label: "Full width",
                            },
                        ].map((option) => {
                            const Icon = option.icon;
                            const isSelected =
                                preferences.fullWidth ===
                                option.fullWidth;

                            return (
                                <button
                                    key={option.label}
                                    aria-checked={isSelected}
                                    className={[
                                        "rounded-xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/30",
                                        isSelected
                                            ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                            : "border-border bg-background hover:border-ring/50 hover:bg-accent/50",
                                    ].join(" ")}
                                    role="radio"
                                    type="button"
                                    onClick={() => {
                                        setPreferences(
                                            (current) => ({
                                                ...current,
                                                fullWidth:
                                                    option.fullWidth,
                                            }),
                                        );
                                        setMessage(null);
                                    }}
                                >
                                    <span className="mb-3 grid size-9 place-items-center rounded-lg border border-border bg-card">
                                        <Icon size={17} />
                                    </span>
                                    <span className="block font-medium">
                                        {option.label}
                                    </span>
                                    <span className="mt-1 block text-sm text-muted-foreground">
                                        {option.description}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <Card className="gap-0 overflow-hidden p-0">
                    <div className="border-b border-border p-5">
                        <h2 className="font-semibold">
                            Keyboard shortcuts
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Use “Mod” for Command on macOS
                            and Control on Windows or Linux.
                            Leave a field blank to disable
                            that shortcut.
                        </p>
                    </div>

                    <div className="divide-y divide-border">
                        {EDITOR_SHORTCUT_ACTIONS.map(
                            (action) => {
                                const hasDuplicate =
                                    duplicateShortcuts.has(
                                        action.id,
                                    );

                                return (
                                    <div
                                        key={action.id}
                                        className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center"
                                    >
                                        <div>
                                            <label
                                                className="font-medium"
                                                htmlFor={`shortcut-${action.id}`}
                                            >
                                                {action.label}
                                            </label>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {
                                                    action.description
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                aria-label={`${action.label} shortcut`}
                                                aria-pressed={
                                                    recordingAction ===
                                                    action.id
                                                }
                                                className={[
                                                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left outline-none transition-all",
                                                    recordingAction ===
                                                    action.id
                                                        ? "border-ring bg-primary/10 ring-2 ring-ring/30"
                                                        : "border-input bg-background hover:border-ring/50 hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
                                                ].join(
                                                    " ",
                                                )}
                                                id={`shortcut-${action.id}`}
                                                title="Click to record a new shortcut"
                                                type="button"
                                                onBlur={() => {
                                                    setRecordingAction(
                                                        (
                                                            current,
                                                        ) =>
                                                            current ===
                                                            action.id
                                                                ? null
                                                                : current,
                                                    );
                                                }}
                                                onClick={() => {
                                                    setRecordingAction(
                                                        action.id,
                                                    );
                                                    setMessage(
                                                        null,
                                                    );
                                                }}
                                                onKeyDown={(
                                                    event,
                                                ) => {
                                                    if (
                                                        recordingAction !==
                                                        action.id
                                                    ) {
                                                        return;
                                                    }

                                                    if (
                                                        event.key ===
                                                            "Backspace" ||
                                                        event.key ===
                                                            "Delete"
                                                    ) {
                                                        event.preventDefault();
                                                        updateShortcut(
                                                            action.id,
                                                            "",
                                                        );
                                                        setRecordingAction(
                                                            null,
                                                        );
                                                        return;
                                                    }

                                                    const shortcut =
                                                        shortcutFromKeyboardEvent(
                                                            event.nativeEvent,
                                                        );

                                                    if (
                                                        !shortcut
                                                    ) {
                                                        event.preventDefault();
                                                        return;
                                                    }

                                                    event.preventDefault();
                                                    updateShortcut(
                                                        action.id,
                                                        shortcut,
                                                    );
                                                    setRecordingAction(
                                                        null,
                                                    );
                                                }}
                                            >
                                                <span
                                                    className={[
                                                        "text-xs font-medium",
                                                        recordingAction ===
                                                        action.id
                                                            ? "text-primary"
                                                            : "text-muted-foreground",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {recordingAction ===
                                                    action.id
                                                        ? "Press shortcut…"
                                                        : "Click to change"}
                                                </span>

                                                <span
                                                    className={[
                                                        "flex items-center gap-1 transition-opacity",
                                                        recordingAction ===
                                                        action.id
                                                            ? "opacity-40"
                                                            : "opacity-100",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {getShortcutDisplayParts(
                                                        preferences
                                                            .shortcuts[
                                                            action
                                                                .id
                                                        ],
                                                    ).length >
                                                    0 ? (
                                                        getShortcutDisplayParts(
                                                            preferences
                                                                .shortcuts[
                                                                action
                                                                    .id
                                                            ],
                                                        ).map(
                                                            (
                                                                part,
                                                                index,
                                                            ) => (
                                                                <kbd
                                                                    key={`${part}-${index}`}
                                                                    className="grid min-w-7 place-items-center rounded-md border border-border bg-muted px-1.5 py-1 font-sans text-xs font-semibold text-foreground shadow-[0_1px_0_var(--border)]"
                                                                >
                                                                    {
                                                                        part
                                                                    }
                                                                </kbd>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            Not
                                                            set
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                            {hasDuplicate ? (
                                                <p className="mt-1 text-xs text-destructive">
                                                    This
                                                    shortcut is
                                                    assigned more
                                                    than once.
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </Card>

                {message &&
                message !==
                    "Editor preferences saved." ? (
                    <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                        {message}
                    </p>
                ) : null}

            </div>
        </AppLayout>
    );
}
