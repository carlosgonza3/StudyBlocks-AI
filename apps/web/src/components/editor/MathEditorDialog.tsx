import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import katex from "katex";
import { Sigma, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type MathDisplayMode = "inline" | "block";

type MathEditorDialogProps = {
    initialLatex?: string;
    initialMode: MathDisplayMode;
    isEditing?: boolean;
    onCancel: () => void;
    onConfirm: (
        latex: string,
        mode: MathDisplayMode,
    ) => void;
};

type PreviewResult = {
    error: string | null;
    html: string;
};

export default function MathEditorDialog({
    initialLatex = "",
    initialMode,
    isEditing = false,
    onCancel,
    onConfirm,
}: MathEditorDialogProps) {
    const titleId = useId();
    const inputRef =
        useRef<HTMLTextAreaElement | null>(null);
    const [latex, setLatex] =
        useState(initialLatex);

    useEffect(() => {
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [onCancel]);

    const preview = useMemo<PreviewResult>(() => {
        if (!latex.trim()) {
            return {
                error: null,
                html: "",
            };
        }

        try {
            return {
                error: null,
                html: katex.renderToString(latex, {
                    displayMode:
                        initialMode === "block",
                    output: "html",
                    strict: false,
                    throwOnError: true,
                    trust: false,
                }),
            };
        } catch (error) {
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : "This formula could not be rendered.",
                html: "",
            };
        }
    }, [initialMode, latex]);

    const canConfirm =
        Boolean(latex.trim()) && !preview.error;
    const equationLabel =
        initialMode === "inline"
            ? "inline equation"
            : "equation box";

    return (
        <div
            aria-labelledby={titleId}
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
            role="dialog"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sigma
                                className="text-muted-foreground"
                                size={18}
                            />
                            <h2
                                className="font-semibold"
                                id={titleId}
                            >
                                {isEditing
                                    ? `Edit ${equationLabel}`
                                    : `Insert ${equationLabel}`}
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {initialMode === "inline"
                                ? "Add a formula inside the current sentence."
                                : "Add a centered formula in its own display box."}{" "}
                            Enter LaTeX without dollar
                            signs.
                        </p>
                    </div>

                    <Button
                        aria-label="Close equation editor"
                        className="h-8 w-8 p-0"
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        <X size={16} />
                    </Button>
                </div>

                <label className="mt-5 block text-sm font-medium">
                    LaTeX source
                    <textarea
                        ref={inputRef}
                        className="mt-2 min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
                        placeholder="\frac{a}{b}"
                        spellCheck={false}
                        value={latex}
                        onChange={(event) => {
                            setLatex(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (
                                (event.metaKey ||
                                    event.ctrlKey) &&
                                event.key === "Enter" &&
                                canConfirm
                            ) {
                                event.preventDefault();
                                onConfirm(
                                    latex.trim(),
                                    initialMode,
                                );
                            }
                        }}
                    />
                </label>

                <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Preview
                    </p>
                    <div
                        className={[
                            "mt-2 flex min-h-24 items-center overflow-x-auto rounded-xl border border-border bg-background p-4",
                            initialMode === "block"
                                ? "justify-center"
                                : "justify-start",
                        ].join(" ")}
                    >
                        {preview.error ? (
                            <p
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {preview.error}
                            </p>
                        ) : preview.html ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: preview.html,
                                }}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Your equation will appear
                                here.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!canConfirm}
                        type="button"
                        onClick={() => {
                            onConfirm(
                                latex.trim(),
                                initialMode,
                            );
                        }}
                    >
                        {isEditing
                            ? `Update ${equationLabel}`
                            : `Insert ${equationLabel}`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
